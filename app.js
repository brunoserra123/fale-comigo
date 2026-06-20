// Polyfills for older browsers (like iOS 9.3.5 Safari)
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) throw new TypeError('Array.prototype.find called on null or undefined');
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function(predicate) {
        if (this == null) throw new TypeError('Array.prototype.findIndex called on null or undefined');
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;
        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return i;
            }
        }
        return -1;
    };
}

// Simple AJAX helper returning Promise (supported in iOS 9)
function ajaxRequest(url, method, data) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method || 'GET', url, true);
        if (method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch(e) {
                    resolve(xhr.responseText);
                }
            } else {
                reject(new Error('HTTP ' + xhr.status));
            }
        };
        xhr.onerror = function() {
            reject(new Error('Erro de rede'));
        };
        xhr.send(data ? JSON.stringify(data) : null);
    });
}

var DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxKaNfrudkvByEXalv30gB2FdwBsDfih_Awwo2kItRT4oMszKySDtQT3VfxQZ9x5ghp/exec';

// Define pre-configured categories with emojis
var CATEGORIES = [
    { id: 'all', name: 'Todos', icon: '📁', class: '' },
    { id: 'essential', name: 'Essencial', icon: '⭐', class: 'cat-essential' },
    { id: 'action', name: 'Ações', icon: '🟢', class: 'cat-action' },
    { id: 'food', name: 'Alimentação', icon: '🍏', class: 'cat-food' },
    { id: 'feeling', name: 'Sentimentos', icon: '❤️', class: 'cat-feeling' },
    { id: 'place', name: 'Lugares', icon: '🏠', class: 'cat-place' },
    { id: 'person', name: 'Pessoas', icon: '👥', class: 'cat-person' }
];

// Initial default cards
var DEFAULT_CARDS = [
    // Essential
    { text: 'Sim', category: 'essential', type: 'emoji', value: '👍' },
    { text: 'Não', category: 'essential', type: 'emoji', value: '👎' },
    { text: 'Por Favor', category: 'essential', type: 'emoji', value: '🙏' },
    { text: 'Obrigado', category: 'essential', type: 'emoji', value: '💖' },
    { text: 'Oi / Olá', category: 'essential', type: 'emoji', value: '👋' },
    { text: 'Tchau', category: 'essential', type: 'emoji', value: '👋' },
    { text: 'Socorro / Ajuda', category: 'essential', type: 'emoji', value: '🆘' },
    { text: 'Minha vez', category: 'essential', type: 'emoji', value: '🙋‍♂️' },
    { text: 'Sua vez', category: 'essential', type: 'emoji', value: '🫵' },
    { text: 'Mais', category: 'essential', type: 'emoji', value: '➕' },
    { text: 'Acabou', category: 'essential', type: 'emoji', value: '🛑' },
    { text: 'Diferente', category: 'essential', type: 'emoji', value: '🔀' },
    { text: 'Igual', category: 'essential', type: 'emoji', value: '👥' },
    
    // Actions
    { text: 'Eu Quero', category: 'action', type: 'emoji', value: '👉' },
    { text: 'Não quero', category: 'action', type: 'emoji', value: '🙅‍♂️' },
    { text: 'Comer', category: 'action', type: 'emoji', value: '😋', goToCategory: 'food' },
    { text: 'Beber', category: 'action', type: 'emoji', value: '🥛', goToCategory: 'drink' },
    { text: 'Falar com', category: 'action', type: 'emoji', value: '🗣️', goToCategory: 'person' },
    { text: 'Ir', category: 'action', type: 'emoji', value: '🚶', goToCategory: 'place' },
    { text: 'Parar', category: 'action', type: 'emoji', value: '🛑' },
    { text: 'Ver / Olhar', category: 'action', type: 'emoji', value: '👀' },
    { text: 'Gostar', category: 'action', type: 'emoji', value: '❤️' },
    { text: 'Não gostar', category: 'action', type: 'emoji', value: '💔' },
    { text: 'Brincar', category: 'action', type: 'emoji', value: '🧸' },
    { text: 'Dormir', category: 'action', type: 'emoji', value: '😴' },
    { text: 'Ouvir', category: 'action', type: 'emoji', value: '👂' },

    // Food
    { text: 'Água', category: 'food', type: 'emoji', value: '💧' },
    { text: 'Suco', category: 'food', type: 'emoji', value: '🧃' },
    { text: 'Fruta', category: 'food', type: 'emoji', value: '🍎' },
    { text: 'Pão', category: 'food', type: 'emoji', value: '🍞' },
    { text: 'Comida', category: 'food', type: 'emoji', value: '🍽️' },
    { text: 'Bolo', category: 'food', type: 'emoji', value: '🍰' },
    { text: 'Fome', category: 'food', type: 'emoji', value: '😋' },

    // Feelings
    { text: 'Feliz', category: 'feeling', type: 'emoji', value: '😊' },
    { text: 'Triste', category: 'feeling', type: 'emoji', value: '😢' },
    { text: 'Cansado', category: 'feeling', type: 'emoji', value: '🥱' },
    { text: 'Dor', category: 'feeling', type: 'emoji', value: '🤕' },
    { text: 'Machucado', category: 'feeling', type: 'emoji', value: '🩹' },
    { text: 'Bravo', category: 'feeling', type: 'emoji', value: '😡' },
    { text: 'Assustado', category: 'feeling', type: 'emoji', value: '😨' },

    // Places
    { text: 'Banheiro', category: 'place', type: 'emoji', value: '🚾' },
    { text: 'Casa', category: 'place', type: 'emoji', value: '🏠' },
    { text: 'Escola', category: 'place', type: 'emoji', value: '🏫' },
    { text: 'Parque / Rua', category: 'place', type: 'emoji', value: '🌳' },
    { text: 'Quarto', category: 'place', type: 'emoji', value: '🛏️' },

    // People
    { text: 'Eu', category: 'person', type: 'emoji', value: '🙋' },
    { text: 'Você', category: 'person', type: 'emoji', value: '🫵' },
    { text: 'Mamãe', category: 'person', type: 'emoji', value: '👩' },
    { text: 'Papai', category: 'person', type: 'emoji', value: '👨' },
    { text: 'Professor(a)', category: 'person', type: 'emoji', value: '👩‍🏫' },
    { text: 'Amigo', category: 'person', type: 'emoji', value: '👦' }
];

// App State
var cards = [];
var selectedCards = [];

// DOM Elements
var cardsGrid = document.getElementById('cards-grid');
var sentenceList = document.getElementById('sentence-list');
var searchInput = document.getElementById('search-input');
var btnClearSearch = document.getElementById('btn-clear-search');

// Main Buttons
var btnSpeak = document.getElementById('btn-speak');
var btnClearAll = document.getElementById('btn-clear-all');
var btnToggleTheme = document.getElementById('btn-toggle-theme');

// Settings Modal Elements
var btnSettings = document.getElementById('btn-settings');
var modalSettings = document.getElementById('modal-settings');
var btnCloseSettings = document.getElementById('btn-close-settings');
var btnResetCards = document.getElementById('btn-reset-cards');
var btnExportCards = document.getElementById('btn-export-cards');
var btnDownloadBackup = document.getElementById('btn-download-backup');
var btnImportBackupTrigger = document.getElementById('btn-import-backup-trigger');
var inputImportBackup = document.getElementById('input-import-backup');

// Add Card Form Elements inside Settings
var formAddCard = document.getElementById('form-add-card');
var cardTextInput = document.getElementById('card-text');
var cardEmojiInput = document.getElementById('card-emoji');
var imageTypeRadios = document.getElementsByName('image-type');
var groupEmoji = document.getElementById('group-emoji');
var groupUpload = document.getElementById('group-upload');
var cardImageFileInput = document.getElementById('card-image-file');
var imagePreview = document.getElementById('image-preview');

// Temporary image storage (base64)
var uploadedImageBase64 = null;

// Sub Choice Modal Elements
var modalSubChoice = document.getElementById('modal-sub-choice');
var subChoiceGrid = document.getElementById('sub-choice-grid');
var subChoiceTitle = document.getElementById('sub-choice-title');
var btnCloseSubChoice = document.getElementById('btn-close-sub-choice');
var btnAddSubChoice = document.getElementById('btn-add-sub-choice');

// Floating Bottom Bar Elements
var floatingBottomBar = document.getElementById('floating-bottom-bar');
var floatingSentencePreview = document.getElementById('floating-sentence-preview');
var btnSpeakFloat = document.getElementById('btn-speak-float');
var btnClearFloat = document.getElementById('btn-clear-float');

// Google Drive Sync Elements
var syncDriveIdInput = document.getElementById('sync-drive-id');
var syncAppsScriptUrlInput = document.getElementById('sync-apps-script-url');
var checkAutoBackup = document.getElementById('check-auto-backup');
var btnSyncNow = document.getElementById('btn-sync-now');
var syncStatusText = document.getElementById('sync-status');

// Changelog Modal Elements
var modalChangelog = document.getElementById('modal-changelog');
var btnCloseChangelog = document.getElementById('btn-close-changelog');
var btnOkChangelog = document.getElementById('btn-ok-changelog');
var changelogAddedSection = document.getElementById('changelog-added-section');
var changelogAddedList = document.getElementById('changelog-added-list');
var changelogRemovedSection = document.getElementById('changelog-removed-section');
var changelogRemovedList = document.getElementById('changelog-removed-list');

// Initialize Web Speech Synthesis
var synth = window.speechSynthesis;

// Profile State Variables
var currentProfileId = 'default';
var profiles = [{ id: 'default', name: 'Padrão' }];

// Audio Recording State
var mediaRecorder = null;
var audioChunks = [];
var recordedAudioBase64 = null;

// Profile DOM Elements
var selectProfile = document.getElementById('select-profile');
var btnManageProfiles = document.getElementById('btn-manage-profiles');
var modalProfiles = document.getElementById('modal-profiles');
var btnCloseProfiles = document.getElementById('btn-close-profiles');
var inputNewProfileName = document.getElementById('input-new-profile-name');
var btnCreateProfile = document.getElementById('btn-create-profile');
var btnSyncProfilesCloud = document.getElementById('btn-sync-profiles-cloud');
var profilesList = document.getElementById('profiles-list');
var accessCounterVal = document.getElementById('access-counter-val');
var cloudProfilesList = document.getElementById('cloud-profiles-list');
var cloudStatusIndicator = document.getElementById('cloud-status-indicator');
var btnRecordAudio = document.getElementById('btn-record-audio');
var recordStatus = document.getElementById('record-status');
var audioPreview = document.getElementById('audio-preview');
var groupAudioRecord = document.getElementById('group-audio-record');

function setCloudStatus(status, titleText) {
    if (!cloudStatusIndicator) return;
    cloudStatusIndicator.className = 'cloud-status-indicator ' + status;
    if (titleText) {
        cloudStatusIndicator.title = 'Status de Backup: ' + titleText;
    } else {
        if (status === 'success') cloudStatusIndicator.title = 'Status de Backup: Sincronizado';
        if (status === 'loading') cloudStatusIndicator.title = 'Status de Backup: Sincronizando...';
        if (status === 'error') cloudStatusIndicator.title = 'Status de Backup: Erro ou Desconectado';
    }
}

// Dicionário de sugestão de emojis em português
var EMOJI_DICTIONARY = {
    // Alimentos
    "agua": "💧", "suco": "🧃", "refrigerante": "🥤", "refri": "🥤", "leite": "🥛", "cafe": "☕", "cha": "🍵",
    "pao": "🍞", "bolo": "🍰", "chocolate": "🍫", "biscoito": "🍪", "bolacha": "🍪", "queijo": "🧀",
    "fruta": "🍎", "maca": "🍎", "banana": "🍌", "uva": "🍇", "laranja": "🍊", "morango": "🍓", "melancia": "🍉",
    "abacaxi": "🍍", "limao": "🍋", "pera": "🍐", "pessego": "🍑", "cereja": "🍒", "coco": "🥥",
    "comida": "🍽️", "arroz": "🍚", "feijao": "🍲", "sopa": "🥣", "salada": "🥗", "carne": "🥩", "frango": "🍗",
    "peixe": "🐟", "ovo": "🥚", "batata": "🍟", "pizza": "🍕", "hamburguer": "🍔", "pastel": "🥟", "sorvete": "🍨",
    
    // Ações
    "comer": "😋", "beber": "🥛", "ir": "🚶", "correr": "🏃", "brincar": "🧸", "dormir": "😴", "ouvir": "👂",
    "ver": "👀", "olhar": "👀", "falar": "🗣️", "cantar": "🎤", "dancar": "💃", "escrever": "✍️", "desenhar": "🎨",
    "ler": "📖", "estudar": "📚", "banho": "🚿", "escovar": "🪥", "sentar": "🪑", "levantar": "🧍", "parar": "🛑",
    "gostar": "❤️", "amar": "💖", "ajudar": "🆘", "socorro": "🆘", "limpar": "🧹",
    
    // Sentimentos
    "feliz": "😊", "alegre": "😁", "triste": "😢", "cansado": "🥱", "sono": "😴", "dor": "🤕", "machucado": "🩹",
    "doente": "🤒", "bravo": "😡", "irritado": "😠", "assustado": "😨", "medo": "😱", "surpreso": "😲",
    "nojo": "🤢", "vergonha": "😳", "amor": "❤️",
    
    // Lugares
    "casa": "🏠", "escola": "🏫", "parque": "🌳", "rua": "🛣️", "quarto": "🛏️", "banheiro": "🚾",
    "cozinha": "🍳", "sala": "🛋️", "quintal": "🏡", "praia": "🏖️", "shopping": "🛍️", "hospital": "🏥",
    "cinema": "🎬", "mercado": "🛒", "igreja": "⛪",
    
    // Pessoas
    "eu": "🙋", "voce": "🫵", "mamae": "👩", "papai": "👨", "vovo": "👵", "vovo": "👴", "irmao": "👦",
    "irma": "👧", "amigo": "👦", "amiga": "👧", "professor": "👨‍🏫", "professora": "👩‍🏫",
    "medico": "👨‍⚕️", "medica": "👩‍⚕️", "bebe": "👶", "tio": "👨", "tia": "👩",
    
    // Objetos
    "brinquedo": "🧸", "bola": "⚽", "boneca": "🪆", "carro": "🚗", "bicicleta": "🚲", "bike": "🚲",
    "moto": "🏍️", "aviao": "✈️", "trem": "🚂", "barco": "⛵", "livro": "📚", "caderno": "📓", "lapis": "✏️",
    "mochila": "🎒", "computador": "💻", "pc": "💻", "tablet": "📱", "celular": "📱", "telefone": "📞",
    "tv": "📺", "televisao": "📺", "relogio": "⌚", "chave": "🔑", "oculos": "👓", "tenis": "👟", "sapato": "👟",
    "camisa": "👕", "roupa": "👕", "calca": "👖", "copo": "🥛", "prato": "🍽️", "colher": "🥄",
    
    // Animais
    "cachorro": "🐶", "cao": "🐶", "gato": "🐱", "passaro": "🐦", "passarinho": "🐦", "peixinho": "🐟",
    "cavalo": "🐴", "vaca": "🐮", "porco": "🐷", "ovelha": "🐑", "galinha": "🐔", "pato": "🦆",
    "leao": "🦁", "urso": "🐻", "macaco": "🐵", "elefante": "🐘", "girafa": "🦒",
    
    // Outros comuns
    "sim": "👍", "nao": "👎", "por favor": "🙏", "obrigado": "💖", "oi": "👋", "ola": "👋", "tchau": "👋"
};

// Função para normalizar strings para busca no dicionário (sem acentos e minúsculo)
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Função para identificar a categoria correspondente a partir do texto digitado
function detectCategory(text) {
    var normalized = normalizeText(text);
    
    // Pessoas (person)
    var personKeywords = [
        'eu', 'voce', 'mamae', 'mae', 'papai', 'pai', 'vovo', 'vovo', 'irmao', 'irma', 'amigo', 'amiga', 
        'professor', 'professora', 'medico', 'medica', 'bebe', 'tio', 'tia', 'primo', 'prima',
        'pessoa', 'gente', 'crianca', 'filho', 'filha', 'tutor', 'terapeuta', 'fono'
    ];
    if (personKeywords.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'person';
    }

    // Lugares (place)
    var placeKeywords = [
        'casa', 'escola', 'parque', 'rua', 'quarto', 'banheiro', 'cozinha', 'sala', 'quintal', 
        'praia', 'shopping', 'shopping', 'hospital', 'cinema', 'mercado', 'igreja', 'clube', 'piscina'
    ];
    if (placeKeywords.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'place';
    }

    // Alimentação (food)
    var foodKeywords = [
        'agua', 'suco', 'refrigerante', 'refri', 'leite', 'cafe', 'cha', 'pao', 'bolo', 
        'chocolate', 'biscoito', 'bolacha', 'queijo', 'fruta', 'maca', 'banana', 'uva', 
        'laranja', 'morango', 'melancia', 'abacaxi', 'limao', 'pera', 'pessego', 'cereja', 
        'coco', 'comida', 'arroz', 'feijao', 'sopa', 'salada', 'carne', 'frango', 'peixe', 
        'ovo', 'batata', 'pizza', 'hamburguer', 'pastel', 'sorvete', 'comer', 'beber', 'fome'
    ];
    if (foodKeywords.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'food';
    }

    // Sentimentos (feeling)
    var feelingKeywords = [
        'feliz', 'alegre', 'triste', 'cansado', 'sono', 'dor', 'machucado', 'doente', 
        'bravo', 'irritado', 'assustado', 'medo', 'surpreso', 'nojo', 'vergonha', 'amor',
        'gostar', 'amar', 'odiar'
    ];
    if (feelingKeywords.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'feeling';
    }

    // Ações (action)
    var actionKeywords = [
        'ir', 'correr', 'brincar', 'dormir', 'ouvir', 'ver', 'olhar', 'falar', 'cantar', 
        'dancar', 'escrever', 'desenhar', 'ler', 'estudar', 'banho', 'escovar', 'sentar', 
        'levantar', 'parar', 'ajudar', 'socorro', 'limpar', 'pegar', 'dar', 'abrir', 'fechar'
    ];
    if (actionKeywords.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'action';
    }

    // Default to custom
    return 'custom';
}

// Custom alert modal using HTML (bypasses native alert blocks on iOS WebView)
function showCustomAlert(message) {
    return new Promise(function(resolve) {
        var dialog = document.getElementById('modal-custom-dialog');
        var title = document.getElementById('custom-dialog-title');
        var msg = document.getElementById('custom-dialog-message');
        var buttonsContainer = document.getElementById('custom-dialog-buttons');

        if (!dialog || !msg || !buttonsContainer) {
            alert(message);
            resolve();
            return;
        }

        title.textContent = 'Aviso 💡';
        msg.textContent = message;
        buttonsContainer.innerHTML = `
            <button id="btn-dialog-ok" class="btn btn-primary" style="flex-grow: 1; justify-content: center; font-size: 1.05rem; padding: 12px;">OK</button>
        `;

        dialog.classList.add('open');

        var btnOk = document.getElementById('btn-dialog-ok');
        btnOk.addEventListener('click', function() {
            dialog.classList.remove('open');
            resolve();
        }, { once: true });
    });
}

// Custom confirm modal using HTML (bypasses native confirm blocks on iOS WebView)
function showCustomConfirm(message) {
    return new Promise(function(resolve) {
        var dialog = document.getElementById('modal-custom-dialog');
        var title = document.getElementById('custom-dialog-title');
        var msg = document.getElementById('custom-dialog-message');
        var buttonsContainer = document.getElementById('custom-dialog-buttons');

        if (!dialog || !msg || !buttonsContainer) {
            var res = confirm(message);
            resolve(res);
            return;
        }

        title.textContent = 'Confirmação ❓';
        msg.textContent = message;
        buttonsContainer.innerHTML = `
            <button id="btn-dialog-cancel" class="btn btn-secondary" style="flex-grow: 1; justify-content: center; font-size: 1.05rem; padding: 12px;">Cancelar</button>
            <button id="btn-dialog-confirm" class="btn btn-danger" style="flex-grow: 1; justify-content: center; font-size: 1.05rem; padding: 12px;">Confirmar</button>
        `;

        dialog.classList.add('open');

        var btnCancel = document.getElementById('btn-dialog-cancel');
        var btnConfirm = document.getElementById('btn-dialog-confirm');

        btnCancel.addEventListener('click', function() {
            dialog.classList.remove('open');
            resolve(false);
        }, { once: true });

        btnConfirm.addEventListener('click', function() {
            dialog.classList.remove('open');
            resolve(true);
        }, { once: true });
    });
}

// Set cards, clean obsolete ones, sync properties and ensure DEFAULT_CARDS are always present
function setAndCleanCards(newCards) {
    var cleaned = newCards.slice();
    // Remove obsolete cards
    cleaned = cleaned.filter(function(c) { return c.text !== 'Dor / Machucado'; });
    
    // Sync default properties
    cleaned = cleaned.map(function(savedCard) {
        var defaultCard = DEFAULT_CARDS.find(function(d) { return d.text === savedCard.text; });
        if (defaultCard) {
            if (defaultCard.goToCategory) {
                savedCard.goToCategory = defaultCard.goToCategory;
            }
        }
        return savedCard;
    });
    
    // Ensure all default cards are present
    DEFAULT_CARDS.forEach(function(defaultCard) {
        var exists = cleaned.some(function(c) { return c.text === defaultCard.text; });
        if (!exists) {
            cleaned.push(defaultCard);
        }
    });

    cards = cleaned;
}

// Render the list of custom cards inside settings for management
function renderManageCustomCards() {
    var listContainer = document.getElementById('custom-cards-list');
    if (!listContainer) return;

    // Filter only custom cards (not present in DEFAULT_CARDS)
    var customCards = cards.filter(function(c) { return !DEFAULT_CARDS.some(function(d) { return d.text === c.text; }); });

    if (customCards.length === 0) {
        listContainer.innerHTML = '<span style="font-size: 0.9rem; color: var(--text-secondary); font-style: italic; display: block; text-align: center; padding: 10px;">Nenhum cartão personalizado criado.</span>';
        return;
    }

    listContainer.innerHTML = customCards.map(function(card) {
        var displayVal = card.type === 'emoji' ? card.value : '🖼️';
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    <span style="font-size: 1.2rem; flex-shrink: 0;">${displayVal}</span>
                    <span style="font-weight: 600; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis;">${card.text}</span>
                </div>
                <button type="button" class="btn-delete-card" data-text="${card.text}" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px; display: flex; align-items: center;" title="Excluir Cartão">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" style="color: var(--color-danger);"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            </div>
        `;
    }).join('');
}

// Helper functions to manage profiles
function loadProfiles() {
    var stored = localStorage.getItem('caa_profiles');
    if (stored) {
        try {
            profiles = JSON.parse(stored);
        } catch (e) {
            profiles = [{ id: 'default', name: 'Padrão' }];
        }
    } else {
        profiles = [{ id: 'default', name: 'Padrão' }];
    }
    
    currentProfileId = localStorage.getItem('caa_current_profile') || 'default';
    if (!profiles.some(function(p) { return p.id === currentProfileId; })) {
        currentProfileId = profiles[0].id;
    }
}

function saveProfiles() {
    localStorage.setItem('caa_profiles', JSON.stringify(profiles));
    localStorage.setItem('caa_current_profile', currentProfileId);
}

function renderProfileSelector() {
    if (!selectProfile) return;
    selectProfile.innerHTML = profiles.map(function(p) {
        var selected = p.id === currentProfileId ? 'selected' : '';
        return '<option value="' + p.id + '" ' + selected + '>' + p.name + '</option>';
    }).join('');
}

function renderProfilesList() {
    if (!profilesList) return;
    profilesList.innerHTML = profiles.map(function(p) {
        var isCurrent = p.id === currentProfileId;
        var deleteBtn = '';
        if (p.id !== 'default') {
            deleteBtn = `
                <button type="button" class="btn-delete-profile" data-id="${p.id}" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px; display: flex; align-items: center;" title="Excluir Perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" style="color: var(--color-danger);"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
            `;
        }
        var activeBadge = isCurrent ? '<span style="font-size: 0.8rem; background-color: var(--color-primary); color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;">Ativo</span>' : '';
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                    <span style="font-weight: 600; font-size: 0.95rem; cursor: pointer;" onclick="switchProfile('${p.id}')">${p.name}</span>
                    ${activeBadge}
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button type="button" class="btn-rename-profile" data-id="${p.id}" data-name="${p.name}" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center;" title="Renomear Perfil">✏️</button>
                    ${deleteBtn}
                </div>
            </div>
        `;
    }).join('');
}

function switchProfile(profileId) {
    if (profileId === currentProfileId) return;
    currentProfileId = profileId;
    saveProfiles();
    
    // Clear selection
    selectedCards = [];
    
    // Load and clean cards for this profile
    var savedCards = localStorage.getItem('caa_custom_cards_' + currentProfileId);
    if (savedCards) {
        try {
            setAndCleanCards(JSON.parse(savedCards));
        } catch (e) {
            setAndCleanCards([]);
        }
    } else {
        setAndCleanCards([]);
    }
    
    // Set theme for this profile
    var savedTheme = localStorage.getItem('caa_theme_' + currentProfileId) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Setup inputs
    var syncDriveId = localStorage.getItem('caa_sync_drive_id_' + currentProfileId) || '';
    var syncAppsScriptUrl = localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId) || DEFAULT_APPS_SCRIPT_URL;
    var autoBackup = localStorage.getItem('caa_auto_backup_' + currentProfileId) !== 'false';
    
    if (syncDriveIdInput) syncDriveIdInput.value = syncDriveId;
    if (syncAppsScriptUrlInput) syncAppsScriptUrlInput.value = syncAppsScriptUrl;
    if (checkAutoBackup) checkAutoBackup.checked = autoBackup;
    
    // Render
    renderCards();
    updateSentenceBuilder();
    renderProfileSelector();
    renderProfilesList();
    
    if (modalProfiles) modalProfiles.classList.remove('open');
}
window.switchProfile = switchProfile;

// Load app data
function init() {
    loadProfiles();
    renderProfileSelector();
    renderProfilesList();

    // Migrate old settings if existing
    var oldCards = localStorage.getItem('caa_custom_cards');
    if (oldCards && !localStorage.getItem('caa_custom_cards_default')) {
        localStorage.setItem('caa_custom_cards_default', oldCards);
    }
    var oldTheme = localStorage.getItem('caa_theme');
    if (oldTheme && !localStorage.getItem('caa_theme_default')) {
        localStorage.setItem('caa_theme_default', oldTheme);
    }
    var oldDriveId = localStorage.getItem('caa_sync_drive_id');
    if (oldDriveId && !localStorage.getItem('caa_sync_drive_id_default')) {
        localStorage.setItem('caa_sync_drive_id_default', oldDriveId);
    }
    var oldScriptUrl = localStorage.getItem('caa_sync_apps_script_url');
    if (oldScriptUrl && !localStorage.getItem('caa_sync_apps_script_url_default')) {
        localStorage.setItem('caa_sync_apps_script_url_default', oldScriptUrl);
    }
    var oldAutoBackup = localStorage.getItem('caa_auto_backup');
    if (oldAutoBackup && !localStorage.getItem('caa_auto_backup_default')) {
        localStorage.setItem('caa_auto_backup_default', oldAutoBackup);
    }

    // Load custom cards for current profile
    var savedCards = localStorage.getItem('caa_custom_cards_' + currentProfileId);
    if (savedCards) {
        try {
            var parsed = JSON.parse(savedCards);
            setAndCleanCards(parsed);
        } catch (e) {
            console.error('Erro ao ler cartões salvos: ', e);
            setAndCleanCards([]);
        }
        saveCardsToStorage(false);
    } else {
        setAndCleanCards([]);
        saveCardsToStorage(false);
    }

    // Set Theme
    var savedTheme = localStorage.getItem('caa_theme_' + currentProfileId) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Increment Access Counter
    var accesses = parseInt(localStorage.getItem('caa_access_count') || '0', 10);
    accesses++;
    localStorage.setItem('caa_access_count', accesses.toString());
    if (accessCounterVal) {
        accessCounterVal.textContent = accesses;
    }

    // Render interface elements
    renderCards();
    updateSentenceBuilder();

    // Setup event listeners
    setupEventListeners();

    // Check Google Drive & Apps Script Sync on Startup
    var syncDriveId = localStorage.getItem('caa_sync_drive_id_' + currentProfileId);
    var syncAppsScriptUrl = localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId) || DEFAULT_APPS_SCRIPT_URL;
    var autoBackup = localStorage.getItem('caa_auto_backup_' + currentProfileId) !== 'false';

    if (syncDriveId && syncDriveIdInput) syncDriveIdInput.value = syncDriveId;
    if (syncAppsScriptUrlInput) syncAppsScriptUrlInput.value = syncAppsScriptUrl;
    if (checkAutoBackup) checkAutoBackup.checked = autoBackup;

    var currentProfileObj = profiles.find(function(p) { return p.id === currentProfileId; });
    var profileName = currentProfileObj ? currentProfileObj.name : 'Padrão';

    // Record Access in Cloud synchronously if online
    if (navigator.onLine && syncAppsScriptUrl) {
        ajaxRequest(syncAppsScriptUrl, 'POST', { action: 'recordAccess', profile: profileName, accesses: accesses }).catch(function(e) {
            console.warn('Erro ao registrar acesso na nuvem:', e);
        });
    }

    if (navigator.onLine) {
        var hasCustomUrl = !!localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId);
        var isNewDevice = !localStorage.getItem('caa_custom_cards_' + currentProfileId);
        if (syncAppsScriptUrl && (hasCustomUrl || isNewDevice)) {
            syncWithAppsScript(syncAppsScriptUrl);
        } else if (syncDriveId) {
            syncWithGoogleDrive(syncDriveId);
        }
    } else if (syncStatusText) {
        syncStatusText.className = 'sync-status-text success';
        syncStatusText.textContent = 'Offline (Usando figuras salvas em cache) 💾';
    }
}

function saveCardsToStorage(triggerCloudUpload) {
    if (triggerCloudUpload === undefined) triggerCloudUpload = true;
    localStorage.setItem('caa_custom_cards_' + currentProfileId, JSON.stringify(cards));
    if (triggerCloudUpload) {
        uploadBackupToCloud();
    }
}

// Render Main AAC Cards Grid
function renderCards() {
    var searchQuery = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';

    // Filter cards based on search query
    var filtered = cards.filter(function(card) {
        return card.text.toLowerCase().indexOf(searchQuery) !== -1;
    });

    if (filtered.length === 0) {
        cardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary); width: 100%;">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display: block; color: var(--text-secondary);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p>Nenhuma figura encontrada para "${searchQuery}".</p>
            </div>
        `;
        return;
    }

    // Group cards by category
    var cardsByCategory = {};
    filtered.forEach(function(card) {
        var cat = card.category || 'custom';
        if (!cardsByCategory[cat]) {
            cardsByCategory[cat] = [];
        }
        cardsByCategory[cat].push(card);
    });

    // Generate HTML
    var html = '';
    
    // We want to preserve the order of CATEGORIES
    var categoriesOrder = [...CATEGORIES.filter(function(c) { return c.id !== 'all'; }), { id: 'custom', name: 'Personalizados', icon: '🎨', class: 'cat-custom' }];
    
    categoriesOrder.forEach(function(cat) {
        var catCards = cardsByCategory[cat.id];
        if (catCards && catCards.length > 0) {
            // Add category section header
            html += `
                <div class="category-group-header">
                    <h3><span>${cat.icon}</span> ${cat.name.toUpperCase()}</h3>
                </div>
            `;
            
            // Add cards
            catCards.forEach(function(card) {
                var catObj = CATEGORIES.find(function(c) { return c.id === (card.category || 'custom'); });
                var catClass = catObj ? catObj.class : 'cat-custom';
                var catName = catObj ? catObj.name : 'Personalizado';
                
                var visualContent = '';
                if (card.type === 'emoji') {
                    visualContent = '<div class="card-emoji">' + card.value + '</div>';
                } else {
                    visualContent = '<img src="' + card.value + '" alt="' + card.text + '" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22lucide lucide-image-off%22><line x1=%222%22 y1=%222%22 x2=%2222%22 y2=%2222%22/><path d=%22M10.41 10.41a2 2 0 1 1-2.83-2.83%22/><path d=%22M21 21H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.37a2 2 0 0 1 1.04.3l1.18.7a2 2 0 0 0 1.04.3H21a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z%22/><path d=%22m3 16 4-4a2 2 0 0 1 2.82 0l1.18 1.18%22/><path d=%22M16 16 14.5 14.5%22/></svg>\'">';
                }

                var indexInCards = cards.findIndex(function(c) { return c.text === card.text; });

                html += `
                    <div class="aac-card ${catClass}" data-index="${indexInCards}" data-text="${card.text}">
                        <span class="card-category-tag">${catName}</span>
                        ${visualContent}
                        <span>${card.text}</span>
                    </div>
                `;
            });
        }
    });

    cardsGrid.innerHTML = html;
}

// Update Sentence Builder Output
function updateSentenceBuilder() {
    sentenceList.innerHTML = selectedCards.map(function(card, idx) {
        var visualContent = '';
        if (card.type === 'emoji') {
            visualContent = '<div class="card-emoji">' + card.value + '</div>';
        } else {
            visualContent = '<img src="' + card.value + '" alt="' + card.text + '">';
        }
        return `
            <div class="sentence-card" data-idx="${idx}">
                ${visualContent}
                <span>${card.text}</span>
            </div>
        `;
    }).join('');

    updateFloatingBar();
}

// Update Floating Bottom Bar visibility & preview
function updateFloatingBar() {
    if (!floatingBottomBar) return;

    if (selectedCards.length > 0 && window.scrollY > 150) {
        floatingBottomBar.classList.remove('d-none');
        
        // Build preview text with emojis
        var textPreview = selectedCards.map(function(c) {
            if (c.type === 'emoji') {
                return c.value + ' ' + c.text;
            }
            return c.text;
        }).join(' + ');
        
        floatingSentencePreview.textContent = textPreview;
    } else {
        floatingBottomBar.classList.add('d-none');
    }
}

// Sync figures list with public Google Drive JSON file
function syncWithGoogleDrive(fileId, showFeedback) {
    if (showFeedback === undefined) showFeedback = false;
    if (!fileId) {
        if (showFeedback && syncStatusText) {
            syncStatusText.className = 'sync-status-text error';
            syncStatusText.textContent = 'Por favor, insira o ID do arquivo.';
        }
        return Promise.resolve(false);
    }

    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Sincronizando figuras... 🔄';
    }

    var url;
    if (fileId.indexOf('http://') === 0 || fileId.indexOf('https://') === 0) {
        url = fileId;
    } else {
        url = 'https://drive.google.com/uc?export=download&id=' + fileId;
    }

    return ajaxRequest(url)
        .then(function(remoteCards) {
            if (!Array.isArray(remoteCards)) {
                throw new Error('O arquivo carregado não é uma lista JSON válida.');
            }

            var prevRemoteCardsStr = localStorage.getItem('caa_remote_cards');
            var prevRemoteCards = [];
            if (prevRemoteCardsStr) {
                try {
                    prevRemoteCards = JSON.parse(prevRemoteCardsStr);
                } catch (e) {
                    console.error('Erro ao ler figuras salvas anteriores: ', e);
                }
            }

            var addedCards = remoteCards.filter(function(newCard) {
                return !prevRemoteCards.some(function(oldCard) { return oldCard.text === newCard.text; });
            });

            var removedCards = prevRemoteCards.filter(function(oldCard) {
                return !remoteCards.some(function(newCard) { return newCard.text === oldCard.text; });
            });

            localStorage.setItem('caa_remote_cards', JSON.stringify(remoteCards));
            localStorage.setItem('caa_sync_drive_id', fileId);

            var customLocalCards = cards.filter(function(c) {
                return !DEFAULT_CARDS.some(function(d) { return d.text === c.text; });
            });
            
            var mergedCards = customLocalCards.concat(remoteCards);
            
            cards = mergedCards;
            saveCardsToStorage();
            renderCards();

            if (prevRemoteCards.length > 0 && (addedCards.length > 0 || removedCards.length > 0)) {
                showChangelogModal(addedCards, removedCards);
            }

            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text success';
                syncStatusText.textContent = 'Sincronizado com sucesso! (Nuvem) ✅';
            }
            return true;
        })
        .catch(function(error) {
            console.error('Erro na sincronização: ', error);
            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text error';
                syncStatusText.textContent = 'Erro ao sincronizar. Verifique a internet e o ID. ❌';
            }
            if (showFeedback) {
                showCustomAlert('Falha na sincronização. Certifique-se de que o arquivo no Google Drive está compartilhado como "Qualquer pessoa com o link" (público) e o ID está correto.');
            }
            return false;
        });
}

// Wrapper function to fetch data correctly depending on protocol
function fetchSyncData(url) {
    if (window.location.protocol === 'file:') {
        return fetchJSONP(url);
    }

    return ajaxRequest(url).catch(function(e) {
        console.warn('Standard fetch failed, falling back to JSONP: ', e);
        return fetchJSONP(url);
    });
}

// Helper function for JSONP fetch (to bypass CORS on file:// protocol)
function fetchJSONP(url, callbackName) {
    if (callbackName === undefined) {
        callbackName = 'callback_' + Math.round(new Date().getTime() * Math.random());
    }
    return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        
        window[callbackName] = function(data) {
            resolve(data);
            cleanup();
        };

        script.onerror = function() {
            reject(new Error('Falha ao se conectar com o servidor do Google (CORS/Redirecionamento).'));
            cleanup();
        };

        var connector = url.indexOf('?') >= 0 ? '&' : '?';
        script.src = url + connector + 'callback=' + callbackName;
        
        document.body.appendChild(script);

        function cleanup() {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            delete window[callbackName];
        }
    });
}

// Sync figures list with Google Apps Script Web App (GET via JSONP)
function syncWithAppsScript(scriptUrl, showFeedback) {
    if (showFeedback === undefined) showFeedback = false;
    var urlToUse = scriptUrl || localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId) || DEFAULT_APPS_SCRIPT_URL;
    if (!urlToUse) return Promise.resolve(false);

    setCloudStatus('loading');
    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Sincronizando com o Drive... 🔄';
    }

    var currentProfileObj = profiles.find(function(p) { return p.id === currentProfileId; });
    var profileName = currentProfileObj ? currentProfileObj.name : 'Padrão';
    var connector = urlToUse.indexOf('?') >= 0 ? '&' : '?';
    var urlWithProfile = urlToUse + connector + 'profile=' + encodeURIComponent(profileName);

    return fetchSyncData(urlWithProfile)
        .then(function(remoteCards) {
            if (!Array.isArray(remoteCards)) {
                throw new Error('O arquivo retornado não é uma lista JSON válida.');
            }

            // Se o backup na nuvem está vazio, significa que é um perfil novo ou sem backup ainda.
            // Em vez de apagar os dados locais, nós salvamos o estado local atual na nuvem.
            if (remoteCards.length === 0) {
                setCloudStatus('success');
                if (syncStatusText) {
                    syncStatusText.className = 'sync-status-text success';
                    syncStatusText.textContent = 'Sincronizado! (Backup criado na nuvem) ✅';
                }
                uploadBackupToCloud();
                return true;
            }

            var prevCardsStr = localStorage.getItem('caa_custom_cards_' + currentProfileId);
            var prevCards = [];
            if (prevCardsStr) {
                try { prevCards = JSON.parse(prevCardsStr); } catch (e) {}
            }

            var addedCards = remoteCards.filter(function(newCard) {
                return !prevCards.some(function(oldCard) { return oldCard.text === newCard.text; });
            });
            var removedCards = prevCards.filter(function(oldCard) {
                return !remoteCards.some(function(newCard) { return newCard.text === oldCard.text; });
            });

            setAndCleanCards(remoteCards);
            saveCardsToStorage(false);
            renderCards();
            renderManageCustomCards();

            if (prevCards.length > 0 && (addedCards.length > 0 || removedCards.length > 0)) {
                showChangelogModal(addedCards, removedCards);
            }

            setCloudStatus('success');
            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text success';
                syncStatusText.textContent = 'Sincronizado com sucesso! ✅';
            }
            if (showFeedback) {
                showCustomAlert('Sincronização concluída com sucesso! Suas figuras estão atualizadas. ☁️👍');
            }
            return true;
        })
        .catch(function(error) {
            console.error('Erro na sincronização automática: ', error);
            setCloudStatus('error');
            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text error';
                syncStatusText.textContent = 'Erro ao sincronizar com o Apps Script. ❌';
            }
            if (showFeedback) {
                showCustomAlert('Falha ao sincronizar com o Google Apps Script. Verifique a URL e a internet.');
            }
            return false;
        });
}

// Sync with Google Drive (JSON Backup File download)
function syncWithGoogleDrive(fileId, showFeedback) {
    if (showFeedback === undefined) showFeedback = false;
    var driveFileId = fileId || localStorage.getItem('caa_sync_drive_id_' + currentProfileId);
    if (!driveFileId) return Promise.resolve(false);

    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Sincronizando com o Drive... 🔄';
    }

    var corsBypassUrl = 'https://docs.google.com/uc?export=download&id=' + driveFileId;

    return fetchSyncData(corsBypassUrl)
        .then(function(remoteCards) {
            if (!Array.isArray(remoteCards)) {
                throw new Error('O arquivo retornado não é uma lista JSON válida.');
            }

            var prevCardsStr = localStorage.getItem('caa_custom_cards_' + currentProfileId);
            var prevCards = [];
            if (prevCardsStr) {
                try { prevCards = JSON.parse(prevCardsStr); } catch (e) {}
            }

            var addedCards = remoteCards.filter(function(newCard) {
                return !prevCards.some(function(oldCard) { return oldCard.text === newCard.text; });
            });
            var removedCards = prevCards.filter(function(oldCard) {
                return !remoteCards.some(function(newCard) { return newCard.text === oldCard.text; });
            });

            setAndCleanCards(remoteCards);
            saveCardsToStorage(false);
            renderCards();
            renderManageCustomCards();

            if (prevCards.length > 0 && (addedCards.length > 0 || removedCards.length > 0)) {
                showChangelogModal(addedCards, removedCards);
            }

            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text success';
                syncStatusText.textContent = 'Sincronizado com sucesso! ✅';
            }
            if (showFeedback) {
                showCustomAlert('Sincronização concluída com sucesso! Suas figuras estão atualizadas. ☁️👍');
            }
            return true;
        })
        .catch(function(error) {
            console.error('Erro na sincronização automática: ', error);
            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text error';
                syncStatusText.textContent = 'Erro ao sincronizar. Verifique a internet e o ID. ❌';
            }
            if (showFeedback) {
                showCustomAlert('Falha na sincronização. Certifique-se de que o arquivo no Google Drive está compartilhado como "Qualquer pessoa com o link" (público) e o ID está correto.');
            }
            return false;
        });
}

// Upload backup to Google Apps Script Web App (POST)
function uploadBackupToCloud() {
    var scriptUrl = localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId) || DEFAULT_APPS_SCRIPT_URL;
    var autoBackup = localStorage.getItem('caa_auto_backup_' + currentProfileId) !== 'false';

    if (!scriptUrl || !autoBackup || !navigator.onLine) return Promise.resolve();

    setCloudStatus('loading');
    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Enviando backup para nuvem... 🔄';
    }

    var currentProfileObj = profiles.find(function(p) { return p.id === currentProfileId; });
    var profileName = currentProfileObj ? currentProfileObj.name : 'Padrão';
    var connector = scriptUrl.indexOf('?') >= 0 ? '&' : '?';
    var uploadUrl = scriptUrl + connector + 'profile=' + encodeURIComponent(profileName);

    return ajaxRequest(uploadUrl, 'POST', cards)
        .then(function() {
            setCloudStatus('success');
            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text success';
                syncStatusText.textContent = 'Backup salvo na nuvem! ✅';
            }
        })
        .catch(function(error) {
            console.log('Envio de backup concluído/processado');
            setCloudStatus('success');
            if (syncStatusText) {
                syncStatusText.className = 'sync-status-text success';
                syncStatusText.textContent = 'Backup enviado! ✅';
            }
        });
}

// Show popup explaining what changed in the cloud figures
function showChangelogModal(addedCards, removedCards) {
    if (!modalChangelog) return;

    // Populate added list
    if (addedCards.length > 0) {
        changelogAddedSection.classList.remove('d-none');
        changelogAddedList.innerHTML = addedCards.map(function(c) {
            var displayVal = c.type === 'emoji' ? `${c.value} ` : '';
            return '<li>' + displayVal + c.text + '</li>';
        }).join('');
    } else {
        changelogAddedSection.classList.add('d-none');
    }

    // Populate removed list
    if (removedCards.length > 0) {
        changelogRemovedSection.classList.remove('d-none');
        changelogRemovedList.innerHTML = removedCards.map(function(c) {
            var displayVal = c.type === 'emoji' ? `${c.value} ` : '';
            return '<li>' + displayVal + c.text + '</li>';
        }).join('');
    } else {
        changelogRemovedSection.classList.add('d-none');
    }

    // Close tutor settings modal to prevent layout stack confusion
    if (modalSettings) modalSettings.classList.remove('open');

    // Open Changelog Modal
    modalChangelog.classList.add('open');
}

// Listen to scroll to show/hide bottom bar
window.addEventListener('scroll', function() {
    updateFloatingBar();
});

// Keep references to utterances in a global array to prevent garbage collection on older iOS/Safari
window.activeUtterances = [];
var speechUnlocked = false;

// Function to prime/unlock speech synthesis on first user gesture
function unlockSpeech() {
    if (speechUnlocked) return;
    try {
        var u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.activeUtterances.push(u);
        u.onend = function() {
            var idx = window.activeUtterances.indexOf(u);
            if (idx !== -1) window.activeUtterances.splice(idx, 1);
        };
        synth.speak(u);
        speechUnlocked = true;
        console.log('Speech synthesis primed/unlocked.');
    } catch(e) {
        console.warn('Erro ao desbloquear fala: ', e);
    }
}

// Bind unlock to first interaction
document.addEventListener('click', unlockSpeech, { once: true });
document.addEventListener('touchstart', unlockSpeech, { once: true });

// Speak text using Web Speech Synthesis API
function speakText(text) {
    if (!text) return;
    
    try {
        // Cancel any current speaking or pending speech to clear the queue
        synth.cancel();
    } catch (e) {
        console.warn('Erro ao cancelar fala anterior: ', e);
    }

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Save reference to prevent garbage collection
    window.activeUtterances.push(utterance);
    
    var cleanup = function() {
        var idx = window.activeUtterances.indexOf(utterance);
        if (idx !== -1) {
            window.activeUtterances.splice(idx, 1);
        }
    };
    
    utterance.onend = cleanup;
    utterance.onerror = cleanup;
    
    // Choose a local PT-BR voice if available
    var voices = [];
    try {
        voices = synth.getVoices();
    } catch(e) {
        console.warn('Erro ao obter vozes: ', e);
    }
    
    var ptVoice = voices.find(function(voice) { 
        return voice.lang && (voice.lang.toLowerCase().indexOf('pt-br') !== -1 || voice.lang.toLowerCase().indexOf('pt_br') !== -1); 
    });
    
    if (ptVoice) {
        utterance.voice = ptVoice;
    }
    
    // We use a small delay (150ms) to allow Safari's speech queue to clear after synth.cancel()
    // A delay of 150ms is short enough to preserve user gesture authorization on iOS.
    setTimeout(function() {
        try {
            synth.speak(utterance);
        } catch(e) {
            console.error('Erro ao chamar speak(): ', e);
        }
    }, 150);
}

// Play recorded card voice or fall back to system speech synthesis
function playCardVoice(card) {
    if (!card) return;
    if (card.audio) {
        try {
            if (synth) synth.cancel();
            var audio = new Audio(card.audio);
            audio.play().catch(function(err) {
                console.warn('Falha ao reproduzir áudio gravado, usando síntese:', err);
                speakText(card.text);
            });
        } catch(e) {
            console.error('Erro ao tocar áudio:', e);
            speakText(card.text);
        }
    } else {
        speakText(card.text);
    }
}

// Handle Theme Change
function updateThemeIcon(theme) {
    var sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    var moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

    btnToggleTheme.innerHTML = `${theme === 'dark' ? sunSvg : moonSvg} <span>Alternar Tema</span>`;
}

function toggleTheme() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('caa_theme_' + currentProfileId, newTheme);
    updateThemeIcon(newTheme);
}

// Open category subchoice modal (abrir por cima)
function openSubChoiceModal(actionText, categoryId) {
    var subCards = [];
    
    if (categoryId === 'food') {
        subChoiceTitle.textContent = 'O que você quer comer?';
        subCards = cards.filter(function(c) { return c.category === 'food' && c.text !== 'Água' && c.text !== 'Suco'; });
    } else if (categoryId === 'drink') {
        subChoiceTitle.textContent = 'O que você quer beber?';
        subCards = cards.filter(function(c) { return c.category === 'food' && (c.text === 'Água' || c.text === 'Suco'); });
    } else if (categoryId === 'person') {
        subChoiceTitle.textContent = 'Com quem você quer falar?';
        subCards = cards.filter(function(c) { return c.category === 'person'; });
    } else if (categoryId === 'place') {
        subChoiceTitle.textContent = 'Aonde você quer ir?';
        subCards = cards.filter(function(c) { return c.category === 'place'; });
    } else {
        subChoiceTitle.textContent = `Escolha um(a) ${actionText}`;
        subCards = cards.filter(function(c) { return c.category === categoryId; });
    }

    if (subCards.length === 0) return;

    subChoiceGrid.innerHTML = subCards.map(function(card) {
        var visualContent = '';
        if (card.type === 'emoji') {
            visualContent = '<div class="card-emoji">' + card.value + '</div>';
        } else {
            visualContent = '<img src="' + card.value + '" alt="' + card.text + '">';
        }

        var catObj = CATEGORIES.find(function(c) { return c.id === (card.category || 'custom'); });
        var catClass = catObj ? catObj.class : 'cat-custom';

        return `
            <div class="aac-card ${catClass}" data-text="${card.text}">
                ${visualContent}
                <span>${card.text}</span>
            </div>
        `;
    }).join('');

    modalSubChoice.classList.add('open');
}

// Event Listeners Setup
function setupEventListeners() {

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (searchInput.value.trim() !== '') {
                if (btnClearSearch) btnClearSearch.classList.remove('d-none');
            } else {
                if (btnClearSearch) btnClearSearch.classList.add('d-none');
            }
            renderCards();
        });
    }

    // Clear search button listener
    if (btnClearSearch) {
        btnClearSearch.addEventListener('click', function() {
            searchInput.value = '';
            btnClearSearch.classList.add('d-none');
            renderCards();
            searchInput.focus();
        });
    }

    // Card click (add to sentence and speak immediately)
    cardsGrid.addEventListener('click', function(e) {
        var cardEl = e.target.closest('.aac-card');
        if (!cardEl) return;

        var text = cardEl.dataset.text;
        var index = cards.findIndex(function(c) { return c.text === text; });
        
        if (index !== -1) {
            var clickedCard = cards[index];
            selectedCards.push(clickedCard);
            updateSentenceBuilder();
            playCardVoice(clickedCard);

            // Automatic sub-choice modal if card has goToCategory defined (abrir por cima)
            if (clickedCard.goToCategory) {
                openSubChoiceModal(clickedCard.text, clickedCard.goToCategory);
            }
        }
    });

    // Sentence builder card click (click to remove)
    sentenceList.addEventListener('click', function(e) {
        var sentCard = e.target.closest('.sentence-card');
        if (!sentCard) return;
        
        var idx = parseInt(sentCard.dataset.idx, 10);
        selectedCards.splice(idx, 1);
        updateSentenceBuilder();
    });

    // Speak sentence
    btnSpeak.addEventListener('click', function() {
        if (selectedCards.length === 0) return;
        
        // Combine text of all selected cards
        var fullSentence = selectedCards.map(function(c) { return c.text; }).join(' ');
        speakText(fullSentence);
    });

    // Clear all
    btnClearAll.addEventListener('click', function() {
        selectedCards = [];
        updateSentenceBuilder();
    });

    // Theme toggle
    btnToggleTheme.addEventListener('click', toggleTheme);

    // Settings Modal controls
    btnSettings.addEventListener('click', function() {
        modalSettings.classList.add('open');
        renderManageCustomCards();
    });

    // Delete custom card event listener
    var customCardsList = document.getElementById('custom-cards-list');
    if (customCardsList) {
        customCardsList.addEventListener('click', function(e) {
            var deleteBtn = e.target.closest('.btn-delete-card');
            if (!deleteBtn) return;

            var cardText = deleteBtn.dataset.text;
            showCustomConfirm('Deseja realmente excluir a figura "' + cardText + '"?').then(function(confirmed) {
                if (confirmed) {
                    cards = cards.filter(function(c) { return c.text !== cardText; });
                    saveCardsToStorage();
                    renderCards();
                    renderManageCustomCards();
                    showCustomAlert(`Figura "${cardText}" excluída com sucesso! 🗑️`);
                }
            });
        });
    }

    var closeSettingsModal = function() {
        modalSettings.classList.remove('open');
        formAddCard.reset();
        imagePreview.innerHTML = '<span>Nenhuma imagem selecionada</span>';
        uploadedImageBase64 = null;
        recordedAudioBase64 = null;
        if (audioPreview) {
            audioPreview.src = '';
            audioPreview.classList.add('d-none');
        }
        if (recordStatus) {
            recordStatus.textContent = '';
        }
        if (groupAudioRecord) {
            groupAudioRecord.classList.add('d-none');
        }
        groupEmoji.classList.remove('d-none');
        groupUpload.classList.add('d-none');
    };

    btnCloseSettings.addEventListener('click', closeSettingsModal);

    // Close modal if clicking outside the card content
    modalSettings.addEventListener('click', function(e) {
        if (e.target === modalSettings) {
            closeSettingsModal();
        }
    });

    // Support Modal controls
    var btnSupport = document.getElementById('btn-support');
    var modalSupport = document.getElementById('modal-support');
    var btnCloseSupport = document.getElementById('btn-close-support');
    var btnCopyPix = document.getElementById('btn-copy-pix');
    var pixKeyInput = document.getElementById('pix-key-input');

    if (btnSupport && modalSupport && btnCloseSupport) {
        btnSupport.addEventListener('click', function() {
            modalSupport.classList.add('open');
        });

        var closeSupportModal = function() {
            modalSupport.classList.remove('open');
        };

        btnCloseSupport.addEventListener('click', closeSupportModal);

        modalSupport.addEventListener('click', function(e) {
            if (e.target === modalSupport) {
                closeSupportModal();
            }
        });
    }

    if (btnCopyPix && pixKeyInput) {
        btnCopyPix.addEventListener('click', function() {
            var keyText = pixKeyInput.getAttribute('data-payload') || pixKeyInput.value.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(keyText)
                    .then(function() {
                        showCustomAlert('Chave Pix copiada com sucesso! 💸\nMuito obrigado pelo seu apoio.');
                    })
                    .catch(function(err) {
                        console.error('Erro ao copiar Pix: ', err);
                        fallbackCopyPix(keyText);
                    });
            } else {
                fallbackCopyPix(keyText);
            }
        });
    }

    function fallbackCopyPix(text) {
        var tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        try {
            document.execCommand('copy');
            showCustomAlert('Chave Pix copiada com sucesso! 💸\nMuito obrigado pelo seu apoio.');
        } catch (e) {
            showCustomAlert('Não foi possível copiar automaticamente. A chave é:\n\n' + text);
        }
        document.body.removeChild(tempTextarea);
    }

    // Form inputs radio changes inside settings
    for (var i_radio = 0; i_radio < imageTypeRadios.length; i_radio++) { var radio = imageTypeRadios[i_radio];
        radio.addEventListener('change', function(e) {
            if (e.target.value === 'emoji') {
                groupEmoji.classList.remove('d-none');
                groupUpload.classList.add('d-none');
            } else {
                groupEmoji.classList.add('d-none');
                groupUpload.classList.remove('d-none');
            }
        });
    }

    // Image file selection inside settings
    cardImageFileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageBase64 = event.target.result;
            imagePreview.innerHTML = `<img src="${uploadedImageBase64}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    });

    // Audio type radio changes inside settings
    var audioTypeRadios = document.getElementsByName('audio-type');
    for (var i_audio = 0; i_audio < audioTypeRadios.length; i_audio++) {
        audioTypeRadios[i_audio].addEventListener('change', function(e) {
            if (e.target.value === 'record') {
                groupAudioRecord.classList.remove('d-none');
            } else {
                groupAudioRecord.classList.add('d-none');
            }
        });
    }

    // Audio recording logic
    if (btnRecordAudio) {
        btnRecordAudio.addEventListener('click', function() {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                // Parar gravação
                mediaRecorder.stop();
                btnRecordAudio.classList.remove('record-btn-active');
                btnRecordAudio.innerHTML = '🎤 Iniciar Gravação';
                recordStatus.textContent = 'Processando gravação...';
            } else {
                // Iniciar gravação
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    showCustomAlert('Seu navegador ou dispositivo não suporta gravação de áudio.');
                    return;
                }

                audioChunks = [];
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.addEventListener('dataavailable', function(event) {
                            audioChunks.push(event.data);
                        });

                        mediaRecorder.addEventListener('stop', function() {
                            var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                recordedAudioBase64 = e.target.result;
                                if (audioPreview) {
                                    audioPreview.src = recordedAudioBase64;
                                    audioPreview.classList.remove('d-none');
                                }
                                recordStatus.textContent = 'Gravação concluída! 🎧';
                            };
                            reader.readAsDataURL(audioBlob);

                            // Parar todas as faixas do stream para liberar o microfone
                            stream.getTracks().forEach(function(track) { track.stop(); });
                        });

                        mediaRecorder.start();
                        btnRecordAudio.classList.add('record-btn-active');
                        btnRecordAudio.innerHTML = '🛑 Parar Gravação';
                        recordStatus.textContent = 'Gravando... fale agora!';
                    })
                    .catch(function(err) {
                        console.error('Erro ao acessar microfone:', err);
                        showCustomAlert('Erro ao acessar o microfone. Certifique-se de dar permissão.');
                    });
            }
        });
    }

    // Auto-suggest emoji while typing card text
    if (cardTextInput && cardEmojiInput) {
        cardTextInput.addEventListener('input', function() {
            var text = cardTextInput.value;
            var fullNormalized = normalizeText(text);
            
            // 1. Match exato da frase inteira
            if (EMOJI_DICTIONARY[fullNormalized]) {
                cardEmojiInput.value = EMOJI_DICTIONARY[fullNormalized];
                return;
            }
            
            // 2. Match palavra por palavra (da direita para a esquerda)
            var words = text.split(/\s+/).map(normalizeText);
            for (var i = words.length - 1; i >= 0; i--) {
                var word = words[i];
                if (word && EMOJI_DICTIONARY[word]) {
                    cardEmojiInput.value = EMOJI_DICTIONARY[word];
                    break;
                }
            }
        });
    }

    // Add card submission inside settings
    formAddCard.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var text = document.getElementById('card-text').value.trim();
        var category = detectCategory(text);
        var imageType = document.querySelector('input[name="image-type"]:checked').value;
        
        var value = '';
        if (imageType === 'emoji') {
            value = document.getElementById('card-emoji').value.trim() || '✨';
        } else {
            if (!uploadedImageBase64) {
                showCustomAlert('Por favor, envie ou selecione uma imagem.');
                return;
            }
            value = uploadedImageBase64;
        }

        var audioType = document.querySelector('input[name="audio-type"]:checked').value;
        var audio = null;
        if (audioType === 'record') {
            if (!recordedAudioBase64) {
                showCustomAlert('Por favor, grave um áudio ou selecione a voz do sistema.');
                return;
            }
            audio = recordedAudioBase64;
        }

        var newCardObj = { text: text, category: category, type: imageType, value: value };
        if (audio) {
            newCardObj.audio = audio;
        }

        // Prepend custom card
        cards.unshift(newCardObj);
        saveCardsToStorage();
        renderCards();
        showCustomAlert('Figura "' + text + '" criada e salva com sucesso! 🎨').then(function() {
            closeSettingsModal();
        });
    });

    // Reset default cards button inside settings
    btnResetCards.addEventListener('click', function() {
        showCustomConfirm('Deseja realmente apagar todos os cartões personalizados e restaurar o padrão original?').then(function(confirmed) {
            if (confirmed) {
                localStorage.removeItem('caa_custom_cards_' + currentProfileId);
                cards = [...DEFAULT_CARDS];
                renderCards();
                closeSettingsModal();
            }
        });
    });

    // Download full backup as JSON file
    if (btnDownloadBackup) {
        btnDownloadBackup.addEventListener('click', function() {
            if (cards.length === 0) {
                showCustomAlert('Nenhum cartão para exportar!');
                return;
            }
            var currentProfileObj = profiles.find(function(p) { return p.id === currentProfileId; });
            var profileName = currentProfileObj ? currentProfileObj.name : 'Padrão';
            var jsonStr = JSON.stringify(cards, null, 2);
            var blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            var url = URL.createObjectURL(blob);
            var downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", url);
            downloadAnchor.setAttribute("download", "backup_comunicador_caa_" + profileName.toLowerCase().replace(/\s+/g, '_') + ".json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            URL.revokeObjectURL(url);
        });
    }

    // Trigger file input for importing backup
    if (btnImportBackupTrigger && inputImportBackup) {
        btnImportBackupTrigger.addEventListener('click', function() {
            inputImportBackup.click();
        });
    }

    // Handle importing the file
    if (inputImportBackup) {
        inputImportBackup.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function(event) {
                try {
                    var importedCards = JSON.parse(event.target.result);
                    
                    // Basic validation
                    if (!Array.isArray(importedCards)) {
                        throw new Error("O arquivo não contém uma lista válida de figuras.");
                    }
                    
                    var isValid = importedCards.every(function(card) {
                        return card && typeof card.text === 'string' && typeof card.type === 'string' && typeof card.value === 'string';
                    });

                    if (!isValid) {
                        throw new Error("Alguns cartões no arquivo estão inválidos ou corrompidos.");
                    }

                    showCustomConfirm('Deseja importar os ' + importedCards.length + ' cartões deste arquivo? Isso substituirá todas as figuras personalizadas configuradas neste dispositivo.').then(function(confirmed) {
                        if (confirmed) {
                            setAndCleanCards(importedCards);
                            saveCardsToStorage();
                            renderCards();
                            showCustomAlert("Backup importado com sucesso!").then(function() {
                                closeSettingsModal();
                            });
                        }
                    });
                } catch (error) {
                    showCustomAlert("Erro ao ler o arquivo de backup: " + error.message);
                }
                // Clear input value so same file can be selected again
                inputImportBackup.value = '';
            };
            reader.readAsText(file);
        });
    }

    // Export custom cards button inside settings
    if (btnExportCards) {
        btnExportCards.addEventListener('click', function() {
            // Filter only custom cards (which are not part of the initial DEFAULT_CARDS)
            var customCardsOnly = cards.filter(function(card) {
                return !DEFAULT_CARDS.some(function(defaultCard) { return defaultCard.text === card.text; });
            });

            if (customCardsOnly.length === 0) {
                showCustomAlert('Nenhum cartão personalizado criado para exportar!');
                return;
            }

            var jsonStr = JSON.stringify(customCardsOnly, null, 2);
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(jsonStr)
                    .then(function() {
                        showCustomAlert('Lista de cartões personalizados copiada com sucesso!\n\nAgora você só precisa colar (Ctrl+V ou "Colar" no celular) na conversa do WhatsApp ou e-mail e enviar para o desenvolvedor.');
                    })
                    .catch(function(err) {
                        console.error('Erro ao copiar para a área de transferência: ', err);
                        fallbackCopy(jsonStr);
                    });
            } else {
                fallbackCopy(jsonStr);
            }
        });
    }

    function fallbackCopy(jsonStr) {
        // Fallback to prompting user to select and copy text
        var exportTextarea = document.createElement('textarea');
        exportTextarea.value = jsonStr;
        document.body.appendChild(exportTextarea);
        exportTextarea.select();
        try {
            document.execCommand('copy');
            showCustomAlert('Lista de cartões personalizados copiada com sucesso!\n\nAgora você só precisa colar na conversa do WhatsApp ou e-mail e enviar para o desenvolvedor.');
        } catch (e) {
            showCustomAlert('Não foi possível copiar automaticamente. Por favor, copie o texto abaixo:\n\n' + jsonStr);
        }
        document.body.removeChild(exportTextarea);
    }

    // Quick Add button inside subchoice modal
    btnAddSubChoice.addEventListener('click', function() {
        modalSubChoice.classList.remove('open');
        modalSettings.classList.add('open');
        
        // Focus text input
        setTimeout(function() {
            document.getElementById('card-text').focus();
        }, 150);
    });

    // Sub-choice grid item click
    subChoiceGrid.addEventListener('click', function(e) {
        var cardEl = e.target.closest('.aac-card');
        if (!cardEl) return;

        var text = cardEl.dataset.text;
        var index = cards.findIndex(function(c) { return c.text === text; });
        
        if (index !== -1) {
            var clickedCard = cards[index];
            selectedCards.push(clickedCard);
            updateSentenceBuilder();
            playCardVoice(clickedCard);
            modalSubChoice.classList.remove('open');
        }
    });

    // Close sub-choice modal
    btnCloseSubChoice.addEventListener('click', function() {
        modalSubChoice.classList.remove('open');
    });

    modalSubChoice.addEventListener('click', function(e) {
        if (e.target === modalSubChoice) {
            modalSubChoice.classList.remove('open');
        }
    });

    // Floating bottom bar buttons
    if (btnSpeakFloat) {
        btnSpeakFloat.addEventListener('click', function() {
            if (selectedCards.length === 0) return;
            var fullSentence = selectedCards.map(function(c) { return c.text; }).join(' ');
            speakText(fullSentence);
        });
    }

    if (btnClearFloat) {
        btnClearFloat.addEventListener('click', function() {
            selectedCards = [];
            updateSentenceBuilder();
        });
    }

    // Google Drive & Apps Script Sync button
    if (btnSyncNow) {
        btnSyncNow.addEventListener('click', function() {
            var fileId = syncDriveIdInput.value.trim();
            var scriptUrl = syncAppsScriptUrlInput.value.trim();

            if (scriptUrl) {
                localStorage.setItem('caa_sync_apps_script_url_' + currentProfileId, scriptUrl);
                syncWithAppsScript(scriptUrl, true);
            } else if (fileId) {
                localStorage.setItem('caa_sync_drive_id_' + currentProfileId, fileId);
                syncWithGoogleDrive(fileId, true);
            } else {
                showCustomAlert('Por favor, insira uma URL de Apps Script ou ID do Google Drive para sincronizar.');
            }
        });
    }

    // Save Apps Script URL dynamically
    if (syncAppsScriptUrlInput) {
        syncAppsScriptUrlInput.addEventListener('input', function() {
            var val = syncAppsScriptUrlInput.value.trim();
            // Evita que o link seja colado duplicado
            if (val.indexOf('https://') !== -1 && val.indexOf('https://') !== val.lastIndexOf('https://')) {
                val = val.substring(0, val.lastIndexOf('https://')).trim();
                syncAppsScriptUrlInput.value = val;
            }
            localStorage.setItem('caa_sync_apps_script_url_' + currentProfileId, val);
        });
    }

    // Save Google Drive ID dynamically
    if (syncDriveIdInput) {
        syncDriveIdInput.addEventListener('input', function() {
            var val = syncDriveIdInput.value.trim();
            localStorage.setItem('caa_sync_drive_id_' + currentProfileId, val);
        });
    }

    // Save Auto Backup setting dynamically
    if (checkAutoBackup) {
        checkAutoBackup.addEventListener('change', function() {
            localStorage.setItem('caa_auto_backup_' + currentProfileId, checkAutoBackup.checked);
            if (checkAutoBackup.checked) {
                uploadBackupToCloud();
            }
        });
    }

    // Profile Modal Event Listeners
    if (btnManageProfiles && modalProfiles && btnCloseProfiles) {
        btnManageProfiles.addEventListener('click', function() {
            renderProfilesList();
            modalProfiles.classList.add('open');
        });
        
        btnCloseProfiles.addEventListener('click', function() {
            modalProfiles.classList.remove('open');
        });
        
        modalProfiles.addEventListener('click', function(e) {
            if (e.target === modalProfiles) {
                modalProfiles.classList.remove('open');
            }
        });
    }

    if (selectProfile) {
        selectProfile.addEventListener('change', function(e) {
            switchProfile(e.target.value);
        });
    }

    if (btnCreateProfile && inputNewProfileName) {
        btnCreateProfile.addEventListener('click', function() {
            var name = inputNewProfileName.value.trim();
            if (!name) return;
            
            var id = 'profile_' + new Date().getTime();
            profiles.push({ id: id, name: name });
            saveProfiles();
            renderProfileSelector();
            renderProfilesList();
            
            inputNewProfileName.value = '';
            showCustomAlert('Perfil "' + name + '" criado com sucesso!');
        });
    }

    function formatBytes(bytes) {
        if (bytes === null || bytes === undefined) return 'Sem dados';
        if (bytes === 0) return '0 Bytes';
        var k = 1024;
        var dm = 1;
        var sizes = ['Bytes', 'KB', 'MB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    if (btnSyncProfilesCloud) {
        btnSyncProfilesCloud.addEventListener('click', function() {
            var syncAppsScriptUrl = localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId) || DEFAULT_APPS_SCRIPT_URL;
            if (!syncAppsScriptUrl) {
                showCustomAlert('Por favor, configure a URL do Apps Script primeiro nas Configurações Avançadas.');
                return;
            }
            
            btnSyncProfilesCloud.disabled = true;
            var originalText = btnSyncProfilesCloud.innerHTML;
            btnSyncProfilesCloud.innerHTML = '<span>🔄</span> Buscando perfis...';
            
            var connector = syncAppsScriptUrl.indexOf('?') >= 0 ? '&' : '?';
            var url = syncAppsScriptUrl + connector + 'action=listProfiles';
            
            fetchSyncData(url)
                .then(function(cloudProfiles) {
                    btnSyncProfilesCloud.disabled = false;
                    btnSyncProfilesCloud.innerHTML = originalText;
                    
                    if (!Array.isArray(cloudProfiles)) {
                        throw new Error('Lista de perfis inválida recebida da nuvem.');
                    }
                    
                    if (cloudProfilesList) {
                        cloudProfilesList.classList.remove('d-none');
                        
                        var validCloudProfiles = cloudProfiles.filter(function(cp) {
                            var isDefault = cp.name.toLowerCase() === 'padrao' || cp.name.toLowerCase() === 'padrão';
                            return !isDefault;
                        });
                        
                        if (validCloudProfiles.length === 0) {
                            cloudProfilesList.innerHTML = '<div style="text-align: center; padding: 10px; color: var(--text-secondary); font-size: 0.85rem;">Nenhum perfil encontrado no Drive.</div>';
                            return;
                        }
                        
                        cloudProfilesList.innerHTML = validCloudProfiles.map(function(cp) {
                            var exists = profiles.some(function(p) {
                                return p.name.toLowerCase() === cp.name.toLowerCase();
                            });
                            
                            var dateText = cp.lastUpdated ? cp.lastUpdated.split(' ')[0] : 'Sem data';
                            var sizeText = cp.size ? formatBytes(cp.size) : 'Vazio';
                            
                            var btnHtml = '';
                            if (exists) {
                                btnHtml = '<span style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">Já Importado ✅</span>';
                            } else {
                                btnHtml = `<button type="button" class="btn-import-cloud-profile" data-name="${cp.name}" style="background-color: var(--color-primary); color: white; border: none; padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 700; cursor: pointer;">Importar 📥</button>`;
                            }
                            
                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; gap: 8px;">
                                    <div style="display: flex; flex-direction: column; overflow: hidden; text-align: left;">
                                        <strong style="color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${cp.name}</strong>
                                        <span style="font-size: 0.75rem; color: var(--text-secondary);">${dateText} • ${sizeText}</span>
                                    </div>
                                    <div style="flex-shrink: 0;">
                                        ${btnHtml}
                                    </div>
                                </div>
                            `;
                        }).join('');
                        
                        // Adicionar evento para os botões de importar recém-gerados
                        var importBtns = cloudProfilesList.querySelectorAll('.btn-import-cloud-profile');
                        importBtns.forEach(function(btn) {
                            btn.addEventListener('click', function() {
                                var pName = btn.dataset.name;
                                var id = 'profile_' + new Date().getTime() + Math.floor(Math.random() * 1000);
                                profiles.push({ id: id, name: pName });
                                localStorage.setItem('caa_sync_apps_script_url_' + id, syncAppsScriptUrl);
                                saveProfiles();
                                renderProfileSelector();
                                renderProfilesList();
                                
                                // Substitui botão por "Já Importado ✅"
                                var parentDiv = btn.parentNode;
                                parentDiv.innerHTML = '<span style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">Já Importado ✅</span>';
                                showCustomAlert('Perfil "' + pName + '" importado! Selecione-o no menu superior e clique em "Sincronizar Agora" nas opções avançadas para carregar suas figuras.');
                            });
                        });
                    }
                })
                .catch(function(err) {
                    btnSyncProfilesCloud.disabled = false;
                    btnSyncProfilesCloud.innerHTML = originalText;
                    console.error('Erro ao sincronizar perfis: ', err);
                    showCustomAlert('Erro ao buscar perfis do Google Drive. Verifique a URL do Apps Script.');
                });
        });
    }

    if (profilesList) {
        profilesList.addEventListener('click', function(e) {
            var renameBtn = e.target.closest('.btn-rename-profile');
            var deleteBtn = e.target.closest('.btn-delete-profile');
            
            if (renameBtn) {
                var pId = renameBtn.dataset.id;
                var currentName = renameBtn.dataset.name;
                var newName = prompt('Digite o novo nome para o perfil:', currentName);
                if (newName && newName.trim()) {
                    var idx = profiles.findIndex(function(p) { return p.id === pId; });
                    if (idx !== -1) {
                        profiles[idx].name = newName.trim();
                        saveProfiles();
                        renderProfileSelector();
                        renderProfilesList();
                    }
                }
            }
            
            if (deleteBtn) {
                var pId = deleteBtn.dataset.id;
                var idx = profiles.findIndex(function(p) { return p.id === pId; });
                if (idx !== -1) {
                    var name = profiles[idx].name;
                    showCustomConfirm('Deseja realmente excluir o perfil "' + name + '"? Todos os cartões personalizados desse perfil serão excluídos permanentemente.').then(function(confirmed) {
                        if (confirmed) {
                            profiles.splice(idx, 1);
                            // Clear items from localStorage
                            localStorage.removeItem('caa_custom_cards_' + pId);
                            localStorage.removeItem('caa_theme_' + pId);
                            localStorage.removeItem('caa_sync_drive_id_' + pId);
                            localStorage.removeItem('caa_sync_apps_script_url_' + pId);
                            localStorage.removeItem('caa_auto_backup_' + pId);
                            
                            if (currentProfileId === pId) {
                                currentProfileId = 'default';
                            }
                            saveProfiles();
                            switchProfile(currentProfileId);
                            renderProfileSelector();
                            renderProfilesList();
                            showCustomAlert('Perfil "' + name + '" excluído.');
                        }
                    });
                }
            }
        });
    }

    // Changelog Modal controls
    if (btnOkChangelog) {
        btnOkChangelog.addEventListener('click', function() {
            modalChangelog.classList.remove('open');
        });
    }

    if (btnCloseChangelog) {
        btnCloseChangelog.addEventListener('click', function() {
            modalChangelog.classList.remove('open');
        });
    }

    if (modalChangelog) {
        modalChangelog.addEventListener('click', function(e) {
            if (e.target === modalChangelog) {
                modalChangelog.classList.remove('open');
            }
        });
    }
}

// Ensure voice synth is ready on page load
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function() {};
}

// Launch application
window.addEventListener('DOMContentLoaded', init);
