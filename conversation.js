/* Core communication also runs on browsers without ES module support. */
var editingWord = -1;
var clearedSentence = null;
var lastSpeech = null;
var boardWords = {
    home: ['Eu Quero', 'Comer', 'Água', 'Banheiro', 'Brincar', 'Dormir', 'Mamãe', 'Papai'],
    school: ['Minha vez', 'Professor(a)', 'Amigo', 'Banheiro', 'Água', 'Brincar', 'Esperar', 'Acabou'],
    clinic: ['Dor', 'Dor de Cabeça', 'Dor de Barriga', 'Médico', 'Machucado', 'Frio', 'Banheiro', 'Água']
};
var conversationText = {
    pt: {sentence_title:'Minha frase', present:'Mostrar', removeWord:'Remover palavra', cancelEdit:'Cancelar troca', undoClear:'Desfazer limpeza', replyTitle:'Respostas rápidas', replyHelp:'Escolha uma frase salva ou escreva sua resposta em cada campo.', board:'Prancha', allBoards:'Todas as figuras', homeBoard:'Casa', schoolBoard:'Escola', clinicBoard:'Consulta', rotate:'Girar 180°', backToBoard:'Voltar à prancha', editHint:'Escolha uma figura para substituir', reply:'Resposta', help:'Ajuda', repeat:'Repetir última fala', defaults:['Espera, ainda estou falando.', 'Não foi isso que eu quis dizer.', 'Pode repetir?']},
    en: {sentence_title:'My sentence', present:'Show', removeWord:'Remove word', cancelEdit:'Cancel edit', undoClear:'Undo clear', replyTitle:'Quick replies', replyHelp:'Choose a saved phrase or type a reply in each field.', board:'Board', allBoards:'All pictures', homeBoard:'Home', schoolBoard:'School', clinicBoard:'Appointment', rotate:'Rotate 180°', backToBoard:'Back to board', editHint:'Choose a picture to replace', reply:'Reply', help:'Help', repeat:'Repeat last message', defaults:['Wait, I am still speaking.', 'That is not what I meant.', 'Could you repeat that?']},
    es: {sentence_title:'Mi frase', present:'Mostrar', removeWord:'Quitar palabra', cancelEdit:'Cancelar cambio', undoClear:'Deshacer borrado', replyTitle:'Respuestas rápidas', replyHelp:'Elige una frase guardada o escribe una respuesta en cada campo.', board:'Tablero', allBoards:'Todas las figuras', homeBoard:'Casa', schoolBoard:'Escuela', clinicBoard:'Consulta', rotate:'Girar 180°', backToBoard:'Volver al tablero', editHint:'Elige una figura para sustituir', reply:'Respuesta', help:'Ayuda', repeat:'Repetir último mensaje', defaults:['Espera, todavía estoy hablando.', 'No es lo que quise decir.', '¿Puedes repetirlo?']}
};
function byId(id) { return document.getElementById(id); }
function conversationLabels() { return conversationText[getProfileLanguage()] || conversationText.pt; }
function clearDraft() {
    if (!selectedCards.length) return;
    clearedSentence = selectedCards.slice();
    selectedCards = [];
    editingWord = -1;
    updateSentenceBuilder();
    byId('btn-undo-clear').focus();
}
function renderEditState() {
    byId('btn-undo-clear').hidden = !clearedSentence;
    byId('edit-word-tools').hidden = editingWord < 0;
    byId('edit-word-hint').textContent = editingWord < 0 ? '' : conversationLabels().editHint + ' “' + getCardText(selectedCards[editingWord]) + '”.';
}
function rememberSpeech(text, card) {
    lastSpeech = {text:text, card:card};
    byId('btn-repeat').disabled = false;
}
function quickReplies() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem('caa_replies_' + currentProfileId)); } catch(e) {}
    return conversationLabels().defaults.map(function(value, index) {
        return Array.isArray(saved) && typeof saved[index] === 'string' ? saved[index] : value;
    });
}
function renderReplies() {
    var values = quickReplies();
    byId('pinned-replies').innerHTML = values.map(function(value, i) {
        return value ? '<button type="button" class="btn btn-secondary" data-slot="' + i + '">' + esc(value) + '</button>' : '';
    }).join('');
    byId('reply-fields').innerHTML = values.map(function(value, i) {
        return '<label>' + conversationLabels().reply + ' ' + (i+1) + '<input data-slot="' + i + '" list="reply-options" maxlength="250" value="' + esc(value) + '"></label>';
    }).join('');
    byId('reply-options').innerHTML = (quickPhrases || []).map(function(p) {
        return '<option value="' + esc(p.text) + '"></option>';
    }).join('');
}
function boardCardButton(card, label) {
    var visual = card.type === 'emoji' ? '<div class="card-emoji">' + esc(card.value) + '</div>' : '<img alt="" src="' + esc(card.value) + '">';
    return '<button type="button" class="aac-card" data-index="' + cards.indexOf(card) + '" draggable="' + (isReorderModeActive ? 'true' : 'false') + '" data-text="' + esc(card.text) + '">' + visual + '<span>' + esc(label || getCardText(card)) + '</span></button>';
}
function renderBoardChoice(query) {
    var board = localStorage.getItem('caa_board_' + currentProfileId) || 'all';
    byId('board-select').value = boardWords[board] ? board : 'all';
    var core = ['Sim','Não','Socorro / Ajuda'].map(function(word, i) {
        var card = cards.find(function(c) { return c.text === word; }) || DEFAULT_CARDS.find(function(c) {return c.text === word;});
        return '<button type="button" class="btn btn-secondary" data-text="' + esc(word) + '">' + esc(i === 2 ? conversationLabels().help : getCardText(card)) + '</button>';
    });
    byId('core-words').innerHTML = core.join('');
    if (query || !boardWords[board]) return false;
    byId('breadcrumb-container').style.display = 'none';
    byId('cards-grid').innerHTML = cards.filter(function(c) {return boardWords[board].indexOf(c.text) >= 0;}).map(function(c) {return boardCardButton(c);}).join('');
    return true;
}
function openSubChoiceModal(word, category) {
    var choices = cards.filter(function(c) {
        if (category === 'drink') return isDrinkCard(c);
        if (category === 'food') return c.category === 'food' && !isDrinkCard(c);
        return c.category === category;
    });
    if (!choices.length) return;
    subChoiceTitle.textContent = getCardText(cards.find(function(c){ return c.text === word; }));
    subChoiceGrid.innerHTML = choices.map(function(c) {return boardCardButton(c);}).join('');
    modalSubChoice.classList.add('open');
}
function setupConversation() {
    byId('core-words').addEventListener('click', function(e) {
        var btn = e.target.closest('button[data-text]');
        if (btn) addCardToSentence(cards.find(function(c){return c.text === btn.dataset.text;}) || DEFAULT_CARDS.find(function(c){return c.text === btn.dataset.text;}));
    });
    byId('board-select').addEventListener('change', function(e) {
        localStorage.setItem('caa_board_' + currentProfileId, e.target.value);
        searchInput.value = '';
        btnClearSearch.classList.add('d-none');
        currentFolder = 'root';
        renderCards();
    });
    byId('pinned-replies').addEventListener('click', function(e) {
        var btn = e.target.closest('button');
        if (btn) speakText(quickReplies()[Number(btn.dataset.slot)]);
    });
    byId('reply-fields').addEventListener('change', function(e) {
        var inputs = byId('reply-fields').querySelectorAll('input');
        var values = Array.prototype.map.call(inputs, function(input, i) {
            var text = input.value.trim();
            return text === conversationLabels().defaults[i] ? null : text;
        });
        localStorage.setItem('caa_replies_' + currentProfileId, JSON.stringify(values));
        renderReplies();
    });
    byId('btn-remove-word').onclick = function() {
        if (editingWord >= 0) selectedCards.splice(editingWord, 1);
        editingWord = -1;
        updateSentenceBuilder();
    };
    byId('btn-cancel-word').onclick = function() { editingWord = -1; updateSentenceBuilder(); };
    byId('btn-undo-clear').onclick = function() {
        if (!clearedSentence) return;
        selectedCards = clearedSentence;
        clearedSentence = null;
        updateSentenceBuilder();
        byId('btn-speak').focus();
    };
    var view = byId('presentation');
    var page = view.querySelector('.presentation-page');
    var rotate = byId('btn-rotate');
    function closeView() {
        view.hidden = true;
        document.body.classList.remove('presenting');
        byId('btn-present').focus();
    }
    byId('btn-present').onclick = function() {
        if (!selectedCards.length) return;
        byId('presentation-text').textContent = selectedCards.map(function(c){return getCardText(c);}).join(' ');
        page.classList.remove('rotated');
        rotate.setAttribute('aria-pressed','false');
        document.body.classList.add('presenting');
        view.hidden = false;
        byId('btn-end-presentation').focus();
    };
    rotate.onclick = function() { rotate.setAttribute('aria-pressed', String(page.classList.toggle('rotated'))); };
    byId('btn-end-presentation').onclick = closeView;
    view.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { e.preventDefault(); closeView(); }
        if (e.key === 'Tab') {
            e.preventDefault();
            (document.activeElement === rotate ? byId('btn-end-presentation') : rotate).focus();
        }
        e.stopPropagation();
    });
    byId('btn-repeat').onclick = function() {
        if (lastSpeech) {
            if (lastSpeech.card) playCardVoice(lastSpeech.card);
            else speakText(lastSpeech.text);
        }
    };
}
