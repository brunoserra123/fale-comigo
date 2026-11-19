import {pending, snapshot, checkProfile} from '../storage.js';
import {flush, save} from '../driveSync.js';
const tests=[];
const check=(ok,message)=>{if(!ok)throw Error(message);tests.push(message);};
const el=id=>document.getElementById(id);
const click=selector=>{const target=document.querySelector(selector);if(!target)throw Error('Controle ausente: '+selector);target.click();};
const select=(id,value)=>{el(id).value=value;el(id).dispatchEvent(new Event('change',{bubbles:true}));};
async function run(){
    if(document.readyState!=='complete') await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    // Silence this test without changing the real voice path for app users.
    window.speakTextLocal=()=>{};
    const word=name=>click('#core-words [data-text="'+name+'"]');
    word('Não');for(let i=0;i<7;i++)word(i%2?'Não':'Sim');
    check(selectedCards.length===8 && selectedCards[0].text==='Não','Oito cartões preservam o primeiro Não');
    click('#sentence-list [data-idx="3"]');word('Socorro / Ajuda');
    check(selectedCards.length===8 && selectedCards[3].text==='Socorro / Ajuda','Troca de uma palavra no lugar');
    const draft=selectedCards.map(c=>c.text).join(' ');
    click('#pinned-replies button');click('#btn-repeat');
    check(lastSpeech.text.includes('Espera') && selectedCards.map(c=>c.text).join(' ')===draft,'Resposta rápida e repetição preservam a frase');
    for(const board of ['home','school','clinic']){
        select('board-select',board);
        check(el('cards-grid').children.length>2 && el('core-words').children[0].dataset.text==='Sim','Prancha '+board+' com vocabulário fixo');
    }
    select('board-select','school');check(!el('cards-grid').querySelector('[data-text="Dor de Cabeça"]'),'Vocabulário muda conforme a situação');
    click('#btn-present');click('#btn-rotate');
    check(!el('presentation').hidden && el('presentation-text').textContent===draft && document.querySelector('.presentation-page.rotated'),'Apresentação completa e girada');
    click('#btn-end-presentation');click('#btn-clear-all');click('#btn-undo-clear');
    check(selectedCards.map(c=>c.text).join(' ')===draft,'Desfazer restaura a frase');
    click('#btn-speak');el('history-query').value='zzz';el('history-query').dispatchEvent(new Event('input'));
    check(el('history-results').textContent.includes('Nenhuma'),'Filtro do histórico');
    const exported=snapshot();check(checkProfile(exported)===exported && exported.settings.board==='school','Perfil JSON inclui prancha e configurações');
    await save();const rows=await pending();check(rows.some(r=>r.kind==='cards' && r.uuid),'Fila IndexedDB persiste sem internet');
    window.testOnline=true;await flush();check(!(await pending()).length,'Fila esvaziada somente após confirmação');
    const registration=await navigator.serviceWorker.ready;
    const cache=await caches.open('caa-comunicador-3.0.0');
    for(const asset of ['index.html','conversation.js','storage.js','ui.js','img/card_nao.jpg'])check(!!await cache.match(new URL('../'+asset,import.meta.url)),'Cache instalado: '+asset);
    check(!!registration.active,'Service worker ativo');
}
run().then(()=>fetch('/result',{method:'POST',body:JSON.stringify({tests})})).catch(e=>fetch('/result',{method:'POST',body:JSON.stringify({error:e.stack})}));
