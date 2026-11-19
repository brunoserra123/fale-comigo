import {snapshot, applyProfile, profileKey, uuid, enqueue, pending, acknowledge} from './storage.js';
const clientKey = 'fale_device_id';
const client = localStorage.getItem(clientKey) || uuid();
localStorage.setItem(clientKey,client);
let running, retryTimer, retryDelay = 15000, status = '', validated = false;
let changes = 0;
const errors = [];
export const getErrors = () => errors.slice();
function report(message) {
    const line = String(message).slice(0,220);
    if (!errors.length || errors[0].message !== line) errors.unshift({time:new Date().toLocaleTimeString(),message:line});
    errors.length = Math.min(errors.length,12);
}
const endpoint = () => localStorage.getItem(profileKey('sync_apps_script_url')) || DEFAULT_APPS_SCRIPT_URL;
export const pairCode = () => localStorage.getItem(profileKey('pair')) || '';
const revisionKey = (id,token) => profileKey('revision_' + token,id);
let statusGeneration = 0;
async function indicator() {
    const generation = ++statusGeneration;
    let count;
    try { count = (await pending()).filter(x => x.profileId === currentProfileId).length; } catch (_) { count = -1; }
    if (generation !== statusGeneration) return;
    const label = count < 0 ? 'Fila indisponível' : !navigator.onLine ? 'Offline · ' + count + ' na fila' :
        status === 'sending' ? 'Salvando…' : count ? count + ' na fila' : status === 'failed' ? 'Falha na sincronização' :
        validated ? 'Sincronizado' : 'Salvo neste aparelho';
    const icon = document.getElementById('cloud-status-indicator');
    icon.title = label;
    icon.setAttribute('aria-label',label);
    icon.className = 'cloud-status-indicator ' + (count || status === 'failed' ? 'error' : status === 'sending' ? 'loading' : 'success');
    document.getElementById('cloud-state-label').textContent = label;
    if (syncStatusText) syncStatusText.textContent = label;
}
function queue(kind, payload) {
    const entry = {uuid:uuid(),client,kind,payload,token:pairCode(),url:endpoint(),profileId:currentProfileId,
        profile:profiles.find(p => p.id === currentProfileId)?.name || 'Padrão'};
    changes++;
    return enqueue(entry).then(() => { indicator(); return flush(); }).catch(error => {report(error.message);status='failed';indicator();});
}
export function save() {
    if (localStorage.getItem(profileKey('auto_backup')) === 'false') return Promise.resolve();
    return queue(pairCode() ? 'profile' : 'cards', pairCode() ? snapshot() : cards);
}
export const recordAccess = accesses => queue('access',accesses);
async function request(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(),20000);
    try {
        const res = await fetch(url,{...options,cache:'no-store',signal:controller.signal});
        if (!res.ok) throw Error('Google Apps Script · HTTP ' + res.status);
        return await res.json();
    } finally { clearTimeout(timer); }
}
async function drain() {
    if (!navigator.onLine) { await indicator(); return; }
    const blocked = new Set();
    let failed = false;
    for (const item of await pending()) {
        const group = item.url + '|' + (item.token || item.profile) + '|' + (item.kind === 'access' ? 'access' : 'state');
        if (blocked.has(group)) continue;
        status = 'sending'; await indicator();
        try {
            const key = revisionKey(item.profileId,item.token);
            const body = {...item, action:'deliverV3', base:Number(localStorage.getItem(key) || 0)};
            delete body.url;
            const ack = await request(item.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body)});
            if (ack.status !== 'ok' || ack.uuid !== item.uuid) {
                throw Error(ack.status === 'conflict' ? 'Conflito entre aparelhos. Exporte sua cópia antes de escolher uma versão.' : 'A implantação do Apps Script ainda não confirmou o registro 3.0.');
            }
            if (item.kind === 'profile') localStorage.setItem(key,String(ack.revision));
            await acknowledge(item.seq);
            validated = true;
        } catch (err) { report(err.message); blocked.add(group); failed = true; }
    }
    status = failed ? 'failed' : '';
    await indicator();
    if (navigator.onLine && (await pending()).length) {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(flush,failed ? retryDelay : 0);
        retryDelay = failed ? Math.min(retryDelay*2,300000) : 15000;
    } else retryDelay = 15000;
}
export function flush() {
    if (!running) {
        const work = navigator.locks ? navigator.locks.request('fale-comigo-outbox',drain) : drain();
        running = work.catch(e => {report(e.message);status='failed';}).finally(() => {running=null; indicator();});
    }
    return running;
}
async function remote(token) {
    const url = new URL(endpoint());
    url.searchParams.set('action','profileV3');
    url.searchParams.set('key',token);
    const response = await request(url.href);
    if (response?.version !== 3) throw Error('Atualize a implantação do Apps Script para usar o perfil 3.0.');
    return response;
}
export async function restore() {
    const id = currentProfileId, token = pairCode(), generation = changes;
    if (!navigator.onLine) { await indicator(); return false; }
    if (!token) return false;
    const outstanding = () => pending().then(rows => rows.some(x => x.profileId === id && x.kind !== 'access'));
    if (await outstanding()) return false;
    const result = await remote(token);
    if (currentProfileId !== id || pairCode() !== token || changes !== generation || await outstanding()) return false;
    const key = revisionKey(id,token);
    if (result.data && result.revision > Number(localStorage.getItem(key)||0)) {
        applyProfile(result.data);
        localStorage.setItem(key,String(result.revision));
    }
    validated = !!result.data; status = ''; await indicator();
    return true;
}
export async function connect(code) {
    const id = currentProfileId;
    const token = code.trim().toLowerCase() || uuid();
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(token)) throw Error('Código de perfil inválido.');
    const result = await remote(token);
    if (currentProfileId !== id) throw Error('O perfil ativo mudou.');
    if (code && !result.data) throw Error('O código ainda não tem um perfil salvo.');
    if (code && !await showCustomConfirm('Restaurar este perfil do Drive sobre as configurações deste aparelho?')) return;
    if (currentProfileId !== id) return;
    if (code) applyProfile(result.data);
    localStorage.setItem(profileKey('pair'),token);
    localStorage.setItem(revisionKey(id,token),String(result.revision || 0));
    if (!code) await queue('profile',snapshot());
    return token;
}
export async function sync(scriptUrl, feedback) {
    try {
        await flush();
        if (pairCode()) return await restore();
        const profileId = currentProfileId, generation = changes;
        const hasWrites = (await pending()).some(r => r.profileId === profileId && r.kind !== 'access');
        if (!hasWrites && generation === changes && profileId === currentProfileId) {
            validated = await legacySyncWithAppsScript(scriptUrl, feedback);
        }
        await indicator(); return validated;
    } catch (err) { status='failed'; report(err.message); await indicator(); if (feedback) showCustomAlert(err.message); return false; }
}
export function startSync() {
    window.faleSync = {save,recordAccess,sync,changed:() => changes, indicator};
    window.addEventListener('online', () => sync(endpoint(),false));
    window.addEventListener('offline',indicator);
    document.addEventListener('profilechange', () => { changes++; validated=false; status=''; indicator(); });
    document.addEventListener('profile-ready', () => { if (pairCode()) sync(endpoint(),false); });
    indicator();
}
