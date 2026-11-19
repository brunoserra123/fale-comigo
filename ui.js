import {snapshot,checkProfile,applyProfile,profileKey,pending,uuid} from './storage.js';
import {startSync,sync,pairCode,connect,getErrors,save} from './driveSync.js';
import {setupGestures} from './gestures.js';

startSync();
setupGestures();
const el = id => document.getElementById(id);
function history() {
    try {
        const entries = JSON.parse(localStorage.getItem(profileKey('history')));
        if (Array.isArray(entries)) return entries;
        const old = JSON.parse(localStorage.getItem(profileKey('recent_sentences'))) || [];
        return old.filter(Array.isArray).map(cards => ({date:null,cards}));
    } catch (_) { return []; }
}
function renderHistory() {
    const query = normalizeText(el('history-query').value), date = el('history-date').value;
    const cat = el('history-category').value;
    const results = el('history-results');
    results.textContent = '';
    history().filter(row => (!date || date === row.date) && (!cat || row.cards.some(c => (c.category || 'custom') === cat)) &&
        normalizeText(row.cards.map(c => getCardText(c)).join(' ')).includes(query)).forEach(row => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'btn btn-secondary';
        btn.textContent = row.cards.map(c => getCardText(c)).join(' ');
        btn.onclick = () => speakText(row.cards.map(c => getCardText(c,true)).join(' '));
        results.appendChild(btn);
    });
    if (!results.children.length) results.textContent = 'Nenhuma fala encontrada.';
}
window.recordHistory = function(cards) {
    const now = new Date(), localDay = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,10);
    // Keep words, pronunciation and categories; full-sized images already belong to the profile.
    const words = cards.map(c => ({text:c.text,pronunciation:c.pronunciation,category:c.category,type:'emoji',value:''}));
    const list = history();
    list.unshift({id:uuid(),date:localDay,cards:words});
    localStorage.setItem(profileKey('history'),JSON.stringify(list.slice(0,100)));
    renderHistory();
    if (pairCode()) save();
};
function refresh() {
    el('history-category').innerHTML = '<option value="">Todas</option>' + CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'favorites')
        .concat([{id:'pain'},{id:'custom'}]).map(c => '<option value="'+esc(c.id)+'">'+esc(getCategoryName(c.id))+'</option>').join('');
    el('history-query').value = ''; el('history-date').value = '';
    renderHistory();
    el('pair-code').type = 'password'; el('pair-code').value = pairCode();
    for (const [id,key] of [['haptics','haptics'],['click-sound','click_sound']]) el(id).checked = localStorage.getItem(profileKey(key)) === 'true';
    const avatar = localStorage.getItem(profileKey('avatar')) || '👤';
    el('profile-avatar').value = avatar;
    document.querySelector('.profile-header-container > span').textContent = avatar;
}
function initTools() {
    el('modern-settings').hidden = false; el('history-box').hidden = false; refresh();
}
if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded',initTools);
else initTools();
document.addEventListener('profile-ready',refresh);
document.addEventListener('profile-applied',refresh);
for (const id of ['history-query','history-date','history-category']) el(id).addEventListener('input',renderHistory);
el('export-profile').onclick = () => {
    const data = snapshot(), link = document.createElement('a');
    const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    link.href = url; link.download = 'fale-comigo-' + data.name.replace(/[^\w-]+/g,'-') + '.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
};
el('import-profile').onclick = () => el('profile-file').click();
el('profile-file').onchange = async event => {
    const file = event.target.files[0], id = currentProfileId;
    event.target.value = ''; if (!file) return;
    try {
        const data = checkProfile(JSON.parse(await file.text()));
        if (!await showCustomConfirm('Importar as figuras e configurações de “'+String(data.name || 'Perfil')+'” no perfil ativo?') || currentProfileId !== id) return;
        applyProfile(data); await save(); showCustomAlert('Perfil importado.');
    } catch (err) { showCustomAlert(err.message); }
};
for (const [id,key] of [['haptics','haptics'],['click-sound','click_sound'],['profile-avatar','avatar']]) {
    el(id).onchange = e => {
        localStorage.setItem(profileKey(key),key === 'avatar' ? e.target.value : String(e.target.checked));
        if (key === 'avatar') document.querySelector('.profile-header-container > span').textContent = e.target.value;
    };
}
el('pair-reveal').onclick = () => { const field = el('pair-code'); field.type = field.type === 'password' ? 'text' : 'password'; };
for (const id of ['pair-new','pair-restore']) el(id).onclick = async () => {
    const code = el('pair-code').value.trim();
    if (id === 'pair-restore' && !code) return showCustomAlert('Digite o código do outro aparelho.');
    if (id === 'pair-new' && pairCode() && !await showCustomConfirm('Gerar um novo código para este aparelho?')) return;
    try { const result = await connect(id === 'pair-new' ? '' : code); if (result) { el('pair-code').value=result; el('pair-code').type='text'; } }
    catch (err) {showCustomAlert(err.message);}
};
const settingEvents = '#seletor-idioma,#seletor-vozes,#input-voice-rate,#input-voice-pitch,#select-visual-mode,#select-grid-cols,#seletor-openai-voice,#board-select,#reply-fields input,#haptics,#click-sound,#profile-avatar';
document.addEventListener('change', e => {
    if (e.target.id === 'seletor-idioma') refresh();
    if (pairCode() && e.target.matches(settingEvents)) save();
});
document.addEventListener('click', e => {
    if (pairCode() && e.target.closest('#btn-toggle-theme,#btn-toggle-layout,#btn-toggle-fitzgerald,#btn-toggle-low-vision,#btn-save-phrase,.quick-phrase-delete')) save();
});
async function showDiagnostics() {
    const estimate = navigator.storage?.estimate ? await navigator.storage.estimate() : {};
    const queued = (await pending()).filter(r => r.profileId === currentProfileId).length;
    const size = estimate.usage === undefined ? 'indisponível' : (estimate.usage/1048576).toFixed(1)+' MB';
    el('diag-log').textContent = ['Versão 3.0.0','Armazenamento: '+size,'Na fila: '+queued,...getErrors().map(e => e.time+' · '+e.message)].join('\n');
    el('diagnostics').classList.add('open'); el('diag-close').focus();
}
let taps = 0, lastTap = 0;
el('version-mark').onclick = () => {
    const now = Date.now();
    taps = now-lastTap < 1500 ? taps+1 : 1; lastTap = now;
    if (taps === 5) { taps=0; showDiagnostics().catch(e => showCustomAlert(e.message)); }
};
el('diag-close').onclick = () => {el('diagnostics').classList.remove('open');el('version-mark').focus();};
el('force-sync').onclick = async () => {await sync(undefined,false); await showDiagnostics();};
