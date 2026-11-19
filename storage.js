const settingNames = ['lang','theme','visual_mode','grid_cols','fitzgerald','layout_mode','low_vision','selected_voice','voice_rate','voice_pitch','openai_voice','board','replies','quick_phrases','history','recent_sentences','stats','haptics','click_sound','avatar'];
export const profileKey = (name, id = currentProfileId) => 'caa_' + name + '_' + id;
export const uuid = () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const n = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
    return (c === 'x' ? n : (n & 3) | 8).toString(16);
});
export function snapshot() {
    const settings = {};
    for (const name of settingNames) {
        const value = localStorage.getItem(profileKey(name));
        if (value !== null) settings[name] = value;
    }
    return {format:'fale-comigo', version:3, name:profiles.find(p => p.id === currentProfileId)?.name || 'Padrão', cards:cardsForBackup(), settings};
}
export function checkProfile(data) {
    if (!data || data.format !== 'fale-comigo' || data.version !== 3 || !Array.isArray(data.cards) ||
        !data.cards.length || !data.cards.every(c => c && typeof c.text === 'string' && typeof c.value === 'string') ||
        !data.settings || typeof data.settings !== 'object') throw Error('Arquivo de perfil inválido.');
    for (const name of settingNames) {
        if (name in data.settings && typeof data.settings[name] !== 'string') throw Error('Configuração inválida.');
    }
    for (const name of ['quick_phrases','history','recent_sentences','replies']) {
        if (!(name in data.settings)) continue;
        const list = JSON.parse(data.settings[name]);
        if (!Array.isArray(list)) throw Error('Lista de perfil inválida.');
        const validCards = a => Array.isArray(a) && a.every(c => c && typeof c.text === 'string' && typeof c.value === 'string');
        if (name === 'quick_phrases' && !list.every(p => p && typeof p.text === 'string' && validCards(p.cards))) throw Error('Atalho inválido.');
        if (name === 'history' && !list.every(p => p && validCards(p.cards))) throw Error('Histórico inválido.');
        if (name === 'recent_sentences' && !list.every(validCards)) throw Error('Histórico antigo inválido.');
        if (name === 'replies' && !list.every(p => p === null || typeof p === 'string')) throw Error('Resposta inválida.');
    }
    return data;
}
export function applyProfile(data) {
    checkProfile(data);
    const id = currentProfileId;
    const writes = new Map(settingNames.map(name => [profileKey(name,id), data.settings[name] ?? null]));
    writes.set(profileKey('custom_cards',id), JSON.stringify(data.cards));
    const before = new Map([...writes.keys()].map(k => [k,localStorage.getItem(k)]));
    const set = (k,v) => v === null ? localStorage.removeItem(k) : localStorage.setItem(k,v);
    try { writes.forEach((v,k) => set(k,v)); }
    catch (error) { before.forEach((v,k) => set(k,v)); throw error; }
    if (dbHelper.db) dbHelper.set(profileKey('custom_cards',id), data.cards);
    setAndCleanCards(data.cards);
    loadProfileLanguage(); loadQuickPhrases(); carregarRecentes(); carregarVozConfig(); carregarVisualModeConfig(); carregarLayoutModeConfig();
    loadGridColsConfig(); loadFitzgeraldConfig();
    const theme = localStorage.getItem(profileKey('theme')) || 'light';
    document.documentElement.setAttribute('data-theme',theme); updateThemeIcon(theme);
    const low = localStorage.getItem(profileKey('low_vision')) === 'true';
    document.body.classList.toggle('low-vision',low); updateLowVisionIcon(low);
    renderCards(); updateSentenceBuilder(); renderManageCustomCards();
    document.dispatchEvent(new Event('profile-applied'));
}
let connection;
function database() {
    if (!connection) connection = new Promise((resolve,reject) => {
        const req = indexedDB.open('fale-comigo-delivery',1);
        req.onupgradeneeded = () => req.result.createObjectStore('outbox',{keyPath:'seq',autoIncrement:true});
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => { connection = null; reject(req.error); };
    });
    return connection;
}
async function transact(mode, work) {
    const db = await database();
    return new Promise((resolve,reject) => {
        const tx = db.transaction('outbox',mode);
        const req = work(tx.objectStore('outbox'));
        tx.oncomplete = () => resolve(req.result);
        tx.onabort = tx.onerror = () => reject(tx.error || Error('Fila indisponível'));
    });
}
export const enqueue = entry => transact('readwrite',store => store.add(entry));
export const pending = () => transact('readonly',store => store.getAll());
export const acknowledge = seq => transact('readwrite',store => store.delete(seq));
