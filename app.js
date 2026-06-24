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

// Polyfill for NodeList.prototype.forEach (missing in older browsers like iOS 9 Safari)
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
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

var DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzd4p77phKJbytTG2qdg7BIRGabxWWAh-hopTP2KZOjkgNUj2pmKt6lX4gLejlorE4V/exec';
var isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:' || (window.URLSearchParams ? new URLSearchParams(window.location.search).has('dev') : /[?&]dev\b/.test(window.location.search));
var MAX_FREE_PROFILES = 2;
var DRINK_KEYWORDS = ['agua', 'suco', 'refrigerante', 'refri', 'leite', 'cafe', 'cha', 'bebida', 'beber', 'toddy', 'achocolatado', 'iogurte', 'coca', 'mate', 'chimarrao', 'suquinh'];
var PAIN_KEYWORDS = ['dor de', 'dor na', 'dor no', 'dor nas', 'dor nos', 'doi a', 'doi o', 'doi as', 'doi os', 'machucado'];

// Define pre-configured categories with emojis
var CATEGORIES = [
    { id: 'all', name: 'Todos', icon: '📁', class: '' },
    { id: 'favorites', name: 'Favoritos', icon: '⭐', class: 'cat-favorites' },
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
    { text: 'Dor', category: 'feeling', type: 'emoji', value: '🤕', goToCategory: 'pain' },
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
    { text: 'Amigo', category: 'person', type: 'emoji', value: '👦' },

    // Pain sub-choices
    { text: 'Dor de Cabeça', category: 'pain', type: 'emoji', value: '🤕' },
    { text: 'Dor de Barriga', category: 'pain', type: 'emoji', value: '🤢' },
    { text: 'Dor de Dente', category: 'pain', type: 'emoji', value: '🦷' },
    { text: 'Dor de Ouvido', category: 'pain', type: 'emoji', value: '👂' },
    { text: 'Dor na Garganta', category: 'pain', type: 'emoji', value: '🗣️' },
    { text: 'Dor nas Costas', category: 'pain', type: 'emoji', value: '🧍' },
    { text: 'Dor no Braço', category: 'pain', type: 'emoji', value: '💪' },
    { text: 'Dor na Perna', category: 'pain', type: 'emoji', value: '🦵' }
];

// Translation Dictionaries and Helper Functions (Multi-language i18n support)
var CARD_TRANSLATIONS = {
    en: {
        "Sim": "Yes",
        "Não": "No",
        "Por Favor": "Please",
        "Obrigado": "Thank you",
        "Oi / Olá": "Hi / Hello",
        "Tchau": "Goodbye",
        "Socorro / Ajuda": "Help",
        "Minha vez": "My turn",
        "Sua vez": "Your turn",
        "Mais": "More",
        "Acabou": "Finished",
        "Diferente": "Different",
        "Igual": "Same",
        "Eu Quero": "I want",
        "Não quero": "I don't want",
        "Comer": "Eat",
        "Beber": "Drink",
        "Falar com": "Talk to",
        "Ir": "Go",
        "Parar": "Stop",
        "Ver / Olhar": "See / Look",
        "Gostar": "Like",
        "Não gostar": "Dislike",
        "Brincar": "Play",
        "Dormir": "Sleep",
        "Ouvir": "Hear",
        "Água": "Water",
        "Suco": "Juice",
        "Fruta": "Fruit",
        "Pão": "Bread",
        "Comida": "Food",
        "Bolo": "Cake",
        "Fome": "Hungry",
        "Feliz": "Happy",
        "Triste": "Sad",
        "Cansado": "Tired",
        "Dor": "Pain",
        "Machucado": "Hurt",
        "Bravo": "Angry",
        "Assustado": "Scared",
        "Banheiro": "Bathroom",
        "Casa": "Home",
        "Escola": "School",
        "Parque / Rua": "Park / Street",
        "Quarto": "Bedroom",
        "Eu": "Me",
        "Você": "You",
        "Mamãe": "Mom",
        "Papai": "Dad",
        "Professor(a)": "Teacher",
        "Amigo": "Friend",
        "Dor de Cabeça": "Headache",
        "Dor de Barriga": "Stomachache",
        "Dor de Ouvido": "Earache",
        "Dor na Garganta": "Sore Throat",
        "Dor nas Costas": "Back Pain",
        "Dor no Braço": "Arm Pain",
        "Dor na Perna": "Leg Pain"
    },
    es: {
        "Sim": "Sí",
        "Não": "No",
        "Por Favor": "Por favor",
        "Obrigado": "Gracias",
        "Oi / Olá": "Hola",
        "Tchau": "Adiós",
        "Socorro / Ajuda": "Ayuda",
        "Minha vez": "Mi turno",
        "Sua vez": "Tu turno",
        "Mais": "Más",
        "Acabou": "Terminado",
        "Diferente": "Diferente",
        "Igual": "Igual",
        "Eu Quero": "Yo quiero",
        "Não quero": "No quiero",
        "Comer": "Comer",
        "Beber": "Beber",
        "Falar com": "Hablar con",
        "Ir": "Ir",
        "Parar": "Parar",
        "Ver / Olhar": "Ver / Mirar",
        "Gostar": "Me gusta",
        "Não gostar": "No me gusta",
        "Brincar": "Jugar",
        "Dormir": "Dormir",
        "Ouvir": "Oír",
        "Água": "Agua",
        "Suco": "Jugo",
        "Fruta": "Fruta",
        "Pão": "Pan",
        "Comida": "Comida",
        "Bolo": "Pastel",
        "Fome": "Hambre",
        "Feliz": "Feliz",
        "Triste": "Triste",
        "Cansado": "Cansado",
        "Dor": "Dolor",
        "Machucado": "Lastimado",
        "Bravo": "Enojado",
        "Assustado": "Asustado",
        "Banheiro": "Baño",
        "Casa": "Casa",
        "Escola": "Escuela",
        "Parque / Rua": "Parque / Calle",
        "Quarto": "Habitación",
        "Eu": "Yo",
        "Você": "Tú",
        "Mamãe": "Mamá",
        "Papai": "Papá",
        "Professor(a)": "Profesor(a)",
        "Amigo": "Amigo",
        "Dor de Cabeça": "Dolor de Cabeza",
        "Dor de Barriga": "Dolor de Barriga",
        "Dor de Dente": "Dolor de Muelas",
        "Dor de Ouvido": "Dolor de Oído",
        "Dor na Garganta": "Dolor de Garganta",
        "Dor nas Costas": "Dolor de Espalda",
        "Dor no Braço": "Dolor de Brazo",
        "Dor na Perna": "Dolor de Pierna"
    }
};

var CATEGORY_TRANSLATIONS = {
    pt: { all: 'Todos', favorites: 'Favoritos', essential: 'Essencial', action: 'Ações', food: 'Alimentação', feeling: 'Sentimentos', place: 'Lugares', person: 'Pessoas', custom: 'Personalizados', pain: 'Dor' },
    en: { all: 'All', favorites: 'Favorites', essential: 'Essential', action: 'Actions', food: 'Food', feeling: 'Feelings', place: 'Places', person: 'People', custom: 'Custom', pain: 'Pain' },
    es: { all: 'Todos', favorites: 'Favoritos', essential: 'Esencial', action: 'Acciones', food: 'Alimentación', feeling: 'Sentimientos', place: 'Lugares', person: 'Personas', custom: 'Personalizados', pain: 'Dolor' }
};

var UI_TRANSLATIONS = {
    pt: {
        app_title: "Fale Comigo",
        sentence_placeholder: "Toque nas figuras para montar a frase...",
        btn_speak: "FALAR",
        btn_send: "ENVIAR",
        btn_clear: "LIMPAR",
        search_placeholder: "Buscar figura... 🔍",
        brand_signature: "Desenvolvido por Bruno Serra de Oliveira",
        brand_purpose: "Criado com carinho para ajudar as pessoas a se comunicarem.",
        brand_version_label: "Versão",
        btn_support: "Apoiar Projeto 💖",
        settings_title: "Configurações do Tutor",
        label_theme: "Aparência:",
        label_low_vision: "Baixa Visão:",
        label_language: "Idioma do Perfil:",
        label_voice: "Voz do Sistema:",
        loading_voices: "Carregando vozes...",
        label_voice_rate: "Velocidade da Voz:",
        label_voice_pitch: "Tom da Voz:",
        label_total_accesses: "Total de Acessos:"
    },
    en: {
        app_title: "Talk to Me",
        sentence_placeholder: "Tap the cards to build a sentence...",
        btn_speak: "SPEAK",
        btn_send: "SEND",
        btn_clear: "CLEAR",
        search_placeholder: "Search figure... 🔍",
        brand_signature: "Developed by Bruno Serra de Oliveira",
        brand_purpose: "Created with love to help people communicate.",
        brand_version_label: "Version",
        btn_support: "Support Project 💖",
        settings_title: "Tutor Settings",
        label_theme: "Theme:",
        label_low_vision: "Low Vision:",
        label_language: "Profile Language:",
        label_voice: "System Voice:",
        loading_voices: "Loading voices...",
        label_voice_rate: "Voice Speed:",
        label_voice_pitch: "Voice Pitch:",
        label_total_accesses: "Total Accesses:"
    },
    es: {
        app_title: "Habla Conmigo",
        sentence_placeholder: "Toca las figuras para armar la frase...",
        btn_speak: "HABLAR",
        btn_send: "ENVIAR",
        btn_clear: "LIMPIAR",
        search_placeholder: "Buscar figura... 🔍",
        brand_signature: "Desarrollado por Bruno Serra de Oliveira",
        brand_purpose: "Creado con cariño para ayudar a las personas a comunicarse.",
        brand_version_label: "Versión",
        btn_support: "Apoyar Proyecto 💖",
        settings_title: "Ajustes del Tutor",
        label_theme: "Apariencia:",
        label_low_vision: "Baja Visión:",
        label_language: "Idioma del Perfil:",
        label_voice: "Voz del Sistema:",
        loading_voices: "Cargando voces...",
        label_voice_rate: "Velocidad de Voz:",
        label_voice_pitch: "Tono de Voz:",
        label_total_accesses: "Accesos Totales:"
    }
};

function getProfileLanguage() {
    return localStorage.getItem('caa_lang_' + currentProfileId) || 'pt';
}

function loadProfileLanguage() {
    var lang = getProfileLanguage();
    if (seletorIdioma) {
        seletorIdioma.value = lang;
    }
    translatePage();
}

function translatePage() {
    var lang = getProfileLanguage();
    var dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.pt;
    
    var elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(function(el) {
        var key = el.dataset.i18n;
        var translation = dict[key];
        if (translation) {
            var span = el.querySelector('span');
            if (span) {
                span.textContent = translation;
            } else {
                el.textContent = translation;
            }
        }
    });

    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(function(el) {
        var key = el.dataset.i18nPlaceholder;
        var translation = dict[key];
        if (translation && el.placeholder !== undefined) {
            el.placeholder = translation;
        }
    });

    var dataPlaceholders = document.querySelectorAll('[data-i18n-data-placeholder]');
    dataPlaceholders.forEach(function(el) {
        var key = el.dataset.i18nDataPlaceholder;
        var translation = dict[key];
        if (translation) {
            el.setAttribute('data-placeholder', translation);
        }
    });
}

function getCardText(card) {
    if (!card) return '';
    var lang = getProfileLanguage();
    if (lang === 'pt') return card.text;
    var translations = CARD_TRANSLATIONS[lang];
    if (translations && translations[card.text]) {
        return translations[card.text];
    }
    return card.text;
}

function getCategoryName(catId) {
    var lang = getProfileLanguage();
    var catObj = CATEGORY_TRANSLATIONS[lang] || CATEGORY_TRANSLATIONS.pt;
    return catObj[catId] || catId;
}

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
var btnToggleLowVision = document.getElementById('btn-toggle-low-vision');
var seletorVozes = document.getElementById('seletor-vozes');
var seletorIdioma = document.getElementById('seletor-idioma');
var vozesDisponiveis = [];

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

// Elementos de Velocidade e Tom da Voz
var inputVoiceRate = document.getElementById('input-voice-rate');
var valVoiceRate = document.getElementById('val-voice-rate');
var inputVoicePitch = document.getElementById('input-voice-pitch');
var valVoicePitch = document.getElementById('val-voice-pitch');
var btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
var btnShareFloat = document.getElementById('btn-share-float');

// Elementos da API ARASAAC
var groupArasaac = document.getElementById('group-arasaac');
var arasaacSearchInput = document.getElementById('arasaac-search-input');
var btnArasaacSearch = document.getElementById('btn-arasaac-search');
var arasaacResultsContainer = document.getElementById('arasaac-results-container');
var selectedArasaacIdInput = document.getElementById('selected-arasaac-id');
var selectedArasaacBase64 = null;

// Elementos do Histórico de Frases Recentes
var recentSentencesSection = document.getElementById('recent-sentences-section');
var recentSentencesList = document.getElementById('recent-sentences-list');
var recentSentences = [];

function convertImageUrlToBase64(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                var reader = new FileReader();
                reader.onloadend = function() {
                    resolve(reader.result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(xhr.response);
            } else {
                reject(new Error('Falha no download da imagem: HTTP ' + xhr.status));
            }
        };
        xhr.onerror = function() {
            reject(new Error('Erro de rede ao baixar imagem.'));
        };
        xhr.send();
    });
}

function carregarVozConfig() {
    var voiceRate = localStorage.getItem('caa_voice_rate_' + currentProfileId) || '1.0';
    var voicePitch = localStorage.getItem('caa_voice_pitch_' + currentProfileId) || '1.0';
    
    if (inputVoiceRate) inputVoiceRate.value = voiceRate;
    if (valVoiceRate) valVoiceRate.textContent = parseFloat(voiceRate).toFixed(1);
    if (inputVoicePitch) inputVoicePitch.value = voicePitch;
    if (valVoicePitch) valVoicePitch.textContent = parseFloat(voicePitch).toFixed(1);
}

function carregarRecentes() {
    if (!recentSentencesSection || !recentSentencesList) return;
    
    var stored = localStorage.getItem('caa_recent_sentences_' + currentProfileId);
    recentSentences = [];
    if (stored) {
        try {
            recentSentences = JSON.parse(stored);
        } catch (e) {
            console.error('Erro ao fazer parse das frases recentes:', e);
        }
    }
    
    if (!Array.isArray(recentSentences) || recentSentences.length === 0) {
        recentSentencesSection.classList.add('d-none');
        recentSentencesList.innerHTML = '';
        return;
    }
    
    recentSentencesSection.classList.remove('d-none');
    var html = '';
    recentSentences.forEach(function(sentenceCards, idx) {
        var textLabel = sentenceCards.map(function(c) { return c.text; }).join(' ');
        var firstCard = sentenceCards[0];
        var iconHtml = '';
        if (firstCard) {
            if (firstCard.type === 'emoji') {
                iconHtml = '<span style="font-size: 1rem; flex-shrink: 0;">' + firstCard.value + '</span>';
            } else {
                iconHtml = '<img src="' + firstCard.value + '" style="width: 16px; height: 16px; object-fit: contain; border-radius: 4px; flex-shrink: 0;" alt="">';
            }
        }
        
        html += 
            '<button type="button" class="recent-chip" data-idx="' + idx + '">' +
                iconHtml +
                '<span style="overflow: hidden; text-overflow: ellipsis; max-width: 140px; white-space: nowrap;">' + textLabel + '</span>' +
            '</button>';
    });
    
    recentSentencesList.innerHTML = html;
    
    var chips = recentSentencesList.querySelectorAll('.recent-chip');
    chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
            var idx = parseInt(chip.dataset.idx, 10);
            var selectedList = recentSentences[idx];
            if (Array.isArray(selectedList)) {
                selectedCards = selectedList.slice();
                updateSentenceBuilder();
                
                var fullSentence = selectedCards.map(function(c) { return getCardText(c); }).join(' ');
                speakText(fullSentence);
            }
        });
    });
}

function adicionarFraseRecente(cardsArray) {
    if (!Array.isArray(cardsArray) || cardsArray.length === 0) return;
    
    var currentText = cardsArray.map(function(c) { return c.text; }).join(' ').trim();
    if (!currentText) return;
    
    var stored = localStorage.getItem('caa_recent_sentences_' + currentProfileId);
    var list = [];
    if (stored) {
        try { list = JSON.parse(stored); } catch (e) {}
    }
    if (!Array.isArray(list)) list = [];
    
    list = list.filter(function(sentenceCards) {
        var text = sentenceCards.map(function(c) { return c.text; }).join(' ').trim();
        return text !== currentText;
    });
    
    list.unshift(cardsArray);
    
    if (list.length > 5) {
        list = list.slice(0, 5);
    }
    
    localStorage.setItem('caa_recent_sentences_' + currentProfileId, JSON.stringify(list));
    carregarRecentes();
}

function carregarEstatisticas() {
    var statsContainer = document.getElementById('stats-usage-list');
    if (!statsContainer) return;
    
    var stored = localStorage.getItem('caa_stats_' + currentProfileId);
    var stats = {};
    if (stored) {
        try { stats = JSON.parse(stored); } catch(e) {}
    }
    
    var statsArray = [];
    for (var key in stats) {
        if (stats.hasOwnProperty(key)) {
            statsArray.push({ text: key, count: stats[key] });
        }
    }
    
    statsArray.sort(function(a, b) { return b.count - a.count; });
    
    if (statsArray.length === 0) {
        statsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-secondary); text-align: center; display: block; padding: 10px 0;">Nenhum uso registrado ainda.</span>';
        return;
    }
    
    var topStats = statsArray.slice(0, 7);
    var html = '';
    topStats.forEach(function(item) {
        var card = cards.find(function(c) { return c.text === item.text; });
        var iconHtml = '🖼️';
        if (card) {
            if (card.type === 'emoji') {
                iconHtml = card.value;
            } else {
                iconHtml = '<img src="' + card.value + '" style="width: 18px; height: 18px; object-fit: contain; border-radius: 4px; flex-shrink: 0;" alt="">';
            }
        }
        
        html += 
            '<div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; padding: 6px 0; border-bottom: 1px solid var(--border-color);">' +
                '<div style="display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">' +
                    '<span style="font-size: 1.1rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px;">' + iconHtml + '</span>' +
                    '<span style="font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis;">' + item.text + '</span>' +
                '</div>' +
                '<span style="font-weight: 700; color: var(--color-primary); flex-shrink: 0;">' + item.count + ' ' + (item.count === 1 ? 'toque' : 'toques') + '</span>' +
            '</div>';
    });
    
    statsContainer.innerHTML = html;
}

function registrarUsoFigura(text) {
    if (!text) return;
    
    var stored = localStorage.getItem('caa_stats_' + currentProfileId);
    var stats = {};
    if (stored) {
        try { stats = JSON.parse(stored); } catch(e) {}
    }
    
    stats[text] = (stats[text] || 0) + 1;
    
    localStorage.setItem('caa_stats_' + currentProfileId, JSON.stringify(stats));
    
    var modalSettingsEl = document.getElementById('modal-settings');
    if (modalSettingsEl && modalSettingsEl.classList.contains('open')) {
        carregarEstatisticas();
    }
}

// Function to load Portuguese voices
function carregarVozes() {
    if (!seletorVozes || !synth) return;
    try {
        vozesDisponiveis = synth.getVoices();
    } catch(e) {
        console.warn('Erro ao obter vozes:', e);
        return;
    }
    seletorVozes.innerHTML = '';
    
    // Filter voices based on active language
    var lang = getProfileLanguage();
    var langPrefix = 'pt';
    if (lang === 'en') langPrefix = 'en';
    else if (lang === 'es') langPrefix = 'es';

    var vozesFiltradas = vozesDisponiveis.filter(function(voz) {
        return voz.lang && voz.lang.toLowerCase().indexOf(langPrefix) !== -1;
    });

    if (vozesFiltradas.length === 0) {
        var noVoiceText = 'Nenhuma voz PT encontrada';
        if (lang === 'en') noVoiceText = 'No EN voice found';
        else if (lang === 'es') noVoiceText = 'No se encontró voz ES';
        
        seletorVozes.innerHTML = '<option value="">' + noVoiceText + '</option>';
        return;
    }

    var savedVoiceName = localStorage.getItem('caa_selected_voice_' + currentProfileId) || '';
    
    vozesFiltradas.forEach(function(voz) {
        var opcao = document.createElement('option');
        opcao.value = voz.name;
        opcao.textContent = voz.name + ' (' + voz.lang + ')';
        if (voz.name === savedVoiceName) {
            opcao.selected = true;
        }
        seletorVozes.appendChild(opcao);
    });
}

if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = carregarVozes;
}

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

// Lock App Mode State & DOM Elements
var isAppLocked = false;
var currentLockAnswer = 0;
var btnLockApp = document.getElementById('btn-lock-app');
var modalLockChallenge = document.getElementById('modal-lock-challenge');
var lockMathQuestion = document.getElementById('lock-math-question');
var lockMathAnswer = document.getElementById('lock-math-answer');
var btnLockCancel = document.getElementById('btn-lock-cancel');
var btnLockSubmit = document.getElementById('btn-lock-submit');

// Premium & Reordering Mode State & DOM Elements
var isReorderModeActive = false;
var btnToggleReorder = document.getElementById('btn-toggle-reorder');
var premiumCodeInput = document.getElementById('premium-code-input');
var premiumStatusLabel = document.getElementById('premium-status-label');

function checkPremiumStatus() {
    return true;
}

function updatePremiumUI() {
    if (premiumStatusLabel) {
        premiumStatusLabel.innerHTML = 'Status: Versão Completa 🌟';
        premiumStatusLabel.style.color = "var(--color-primary)";
    }
    if (premiumCodeInput) {
        var parent = premiumCodeInput.parentElement;
        if (parent) {
            parent.style.display = 'none';
        }
    }
}


function updateLockUI() {
    var openLockSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';
    var closedLockSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    if (isAppLocked) {
        document.body.classList.add('is-locked');
        if (btnLockApp) {
            btnLockApp.innerHTML = closedLockSvg;
            btnLockApp.title = "Desbloquear Configurações";
        }
    } else {
        document.body.classList.remove('is-locked');
        if (btnLockApp) {
            btnLockApp.innerHTML = openLockSvg;
            btnLockApp.title = "Bloquear Configurações";
        }
    }
}

function generateLockChallenge() {
    var num1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    var num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    currentLockAnswer = num1 + num2;
    if (lockMathQuestion) {
        lockMathQuestion.textContent = num1 + " + " + num2 + " = ?";
    }
    if (lockMathAnswer) {
        lockMathAnswer.value = '';
    }
}

// IndexedDB Helper for storing card data locally (bypassing 5MB localStorage limit)
var dbHelper = {
    dbName: 'caa_db',
    dbVersion: 1,
    db: null,

    init: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (!window.indexedDB) {
                console.warn('IndexedDB não é suportado pelo seu navegador.');
                resolve(null);
                return;
            }
            var request = indexedDB.open(self.dbName, self.dbVersion);

            request.onupgradeneeded = function(e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains('profiles_data')) {
                    db.createObjectStore('profiles_data', { keyPath: 'id' });
                }
            };

            request.onsuccess = function(e) {
                self.db = e.target.result;
                resolve(self.db);
            };

            request.onerror = function(e) {
                console.error('Erro ao abrir IndexedDB:', e.target.error);
                resolve(null);
            };
        });
    },

    get: function(key) {
        var self = this;
        return new Promise(function(resolve) {
            if (!self.db) {
                resolve(null);
                return;
            }
            try {
                var transaction = self.db.transaction(['profiles_data'], 'readonly');
                var store = transaction.objectStore('profiles_data');
                var request = store.get(key);

                request.onsuccess = function(e) {
                    resolve(e.target.result ? e.target.result.value : null);
                };

                request.onerror = function() {
                    resolve(null);
                };
            } catch(err) {
                console.error('Erro no IndexedDB get:', err);
                resolve(null);
            }
        });
    },

    set: function(key, value) {
        var self = this;
        return new Promise(function(resolve) {
            if (!self.db) {
                resolve(false);
                return;
            }
            try {
                var transaction = self.db.transaction(['profiles_data'], 'readwrite');
                var store = transaction.objectStore('profiles_data');
                var request = store.put({ id: key, value: value });

                request.onsuccess = function() {
                    resolve(true);
                };

                request.onerror = function(e) {
                    console.error('Erro no IndexedDB set:', e.target.error);
                    resolve(false);
                };
            } catch(err) {
                console.error('Erro no IndexedDB set:', err);
                resolve(false);
            }
        });
    },

    delete: function(key) {
        var self = this;
        return new Promise(function(resolve) {
            if (!self.db) {
                resolve(false);
                return;
            }
            try {
                var transaction = self.db.transaction(['profiles_data'], 'readwrite');
                var store = transaction.objectStore('profiles_data');
                var request = store.delete(key);

                request.onsuccess = function() {
                    resolve(true);
                };

                request.onerror = function() {
                    resolve(false);
                };
            } catch(err) {
                console.error('Erro no IndexedDB delete:', err);
                resolve(false);
            }
        });
    }
};

// Render loading skeletons in the grid
function showSkeletonLoading() {
    if (!cardsGrid) return;
    var html = '';
    for (var i = 0; i < 8; i++) {
        html += 
            '<div class="skeleton-card">' +
                '<div class="skeleton-visual"></div>' +
                '<div class="skeleton-text"></div>' +
            '</div>';
    }
    cardsGrid.innerHTML = html;
}

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

function isDrinkCard(card) {
    if (card.category === 'drink') return true;
    var norm = normalizeText(card.text);
    return DRINK_KEYWORDS.some(function(kw) {
        return norm === kw || norm.indexOf(kw) !== -1;
    });
}

// Função para identificar a categoria correspondente a partir do texto digitado
function detectCategory(text) {
    var normalized = normalizeText(text);
    
    // Dor (pain)
    if (PAIN_KEYWORDS.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'pain';
    }

    // Bebida (drink)
    if (DRINK_KEYWORDS.some(function(keyword) { return normalized === keyword || normalized.indexOf(keyword) !== -1; })) {
        return 'drink';
    }

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

function fallbackCopyText(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showCustomAlert('Frase copiada para a área de transferência! 📋');
    } catch (err) {
        console.error('Erro ao copiar texto: ', err);
    }
    document.body.removeChild(textArea);
}

function showShareOptions(sentence) {
    if (!sentence) return;
    
    var dialog = document.getElementById('modal-custom-dialog');
    var title = document.getElementById('custom-dialog-title');
    var msg = document.getElementById('custom-dialog-message');
    var buttonsContainer = document.getElementById('custom-dialog-buttons');

    if (!dialog || !msg || !buttonsContainer) {
        var opt = confirm('Deseja enviar no WhatsApp? (Se não, copiará para área de transferência)');
        if (opt) {
            window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(sentence), '_blank');
        } else {
            navigator.clipboard.writeText(sentence);
            alert('Frase copiada!');
        }
        return;
    }

    title.textContent = 'Enviar Frase 📤';
    msg.innerHTML = 'O que deseja fazer com a frase:<br><strong style="font-size: 1.15rem; color: var(--text-primary); display: block; margin-top: 8px;">"' + sentence + '"</strong>';
    
    buttonsContainer.innerHTML = 
        '<button id="btn-share-whatsapp-action" class="btn btn-secondary" style="flex-grow: 1; justify-content: center; font-size: 1rem; padding: 12px; background-color: var(--color-share); color: white; border: none; font-weight: 700; gap: 6px;">' +
            '<span>💬</span> WhatsApp' +
        '</button>' +
        '<button id="btn-share-copy-action" class="btn btn-secondary" style="flex-grow: 1; justify-content: center; font-size: 1rem; padding: 12px; font-weight: 700; gap: 6px;">' +
            '<span>📋</span> Copiar' +
        '</button>' +
        '<button id="btn-share-cancel-action" class="btn btn-secondary" style="flex-grow: 1; justify-content: center; font-size: 1rem; padding: 12px;">' +
            'Fechar' +
        '</button>';

    dialog.classList.add('open');

    var btnWhatsapp = document.getElementById('btn-share-whatsapp-action');
    var btnCopy = document.getElementById('btn-share-copy-action');
    var btnCancel = document.getElementById('btn-share-cancel-action');

    btnWhatsapp.addEventListener('click', function() {
        dialog.classList.remove('open');
        var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(sentence);
        window.open(url, '_blank');
    }, { once: true });

    btnCopy.addEventListener('click', function() {
        dialog.classList.remove('open');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sentence).then(function() {
                showCustomAlert('Frase copiada para a área de transferência! 📋');
            }).catch(function() {
                fallbackCopyText(sentence);
            });
        } else {
            fallbackCopyText(sentence);
        }
    }, { once: true });

    btnCancel.addEventListener('click', function() {
        dialog.classList.remove('open');
    }, { once: true });
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
        buttonsContainer.innerHTML = 
            '<button id="btn-dialog-ok" class="btn btn-primary" style="flex-grow: 1; justify-content: center; font-size: 1.05rem; padding: 12px;">OK</button>';

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
        buttonsContainer.innerHTML = 
            '<button id="btn-dialog-cancel" class="btn btn-secondary" style="flex-grow: 1; justify-content: center; font-size: 1.05rem; padding: 12px;">Cancelar</button>' +
            '<button id="btn-dialog-confirm" class="btn btn-danger" style="flex-grow: 1; justify-content: center; font-size: 1.05rem; padding: 12px;">Confirmar</button>';

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
    
    var isPremium = checkPremiumStatus();
    if (!isPremium) {
        // If not premium, keep ONLY the default cards
        cleaned = cleaned.filter(function(card) {
            return DEFAULT_CARDS.some(function(defaultCard) { return defaultCard.text === card.text; });
        });
    } else {
        // Ensure all default cards are present
        DEFAULT_CARDS.forEach(function(defaultCard) {
            var exists = cleaned.some(function(c) { return c.text === defaultCard.text; });
            if (!exists) {
                cleaned.push(defaultCard);
            }
        });
    }

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
        return 
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">' +
                '<div style="display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">' +
                    '<span style="font-size: 1.2rem; flex-shrink: 0;">' + displayVal + '</span>' +
                    '<span style="font-weight: 600; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis;">' + card.text + '</span>' +
                '</div>' +
                '<button type="button" class="btn-delete-card" data-text="' + card.text + '" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px; display: flex; align-items: center;" title="Excluir Cartão">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" style="color: var(--color-danger);"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>' +
                '</button>' +
            '</div>';
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
            deleteBtn = 
                '<button type="button" class="btn-delete-profile" data-id="' + p.id + '" style="background: none; border: none; color: var(--color-danger); cursor: pointer; padding: 4px; display: flex; align-items: center;" title="Excluir Perfil">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" style="color: var(--color-danger);"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>' +
                '</button>';
        }
        var activeBadge = isCurrent ? '<span style="font-size: 0.8rem; background-color: var(--color-primary); color: white; padding: 2px 6px; border-radius: 10px; font-weight: bold;">Ativo</span>' : '';
        
        return 
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background-color: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">' +
                '<div style="display: flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">' +
                    '<span style="font-weight: 600; font-size: 0.95rem; cursor: pointer;" onclick="switchProfile(\'' + p.id + '\')">' + p.name + '</span>' +
                    activeBadge +
                '</div>' +
                '<div style="display: flex; gap: 6px; align-items: center;">' +
                    '<button type="button" class="btn-rename-profile" data-id="' + p.id + '" data-name="' + p.name + '" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; display: flex; align-items: center;" title="Renomear Perfil">✏️</button>' +
                    deleteBtn +
                '</div>' +
            '</div>';
    }).join('');
}

function loadSpecialProfileBackup(profileName) {
    if (!profileName) return Promise.resolve([]);
    var normalizedName = normalizeText(profileName);
    if (normalizedName === 'mauro') {
        return ajaxRequest('backup_comunicador_caa_mauro.json')
            .then(function(res) {
                if (Array.isArray(res)) return res;
                return [];
            })
            .catch(function(e) {
                console.warn('Erro ao carregar backup do Mauro:', e);
                return [];
            });
    }
    return Promise.resolve([]);
}

function loadProfileCards(profileId) {
    var profileObj = profiles.find(function(p) { return p.id === profileId; });
    var profileName = profileObj ? profileObj.name : '';

    var fetchPromise;
    if (dbHelper.db) {
        fetchPromise = dbHelper.get('caa_custom_cards_' + profileId).then(function(dbCards) {
            if (dbCards) {
                return dbCards;
            }
            // fallback
            var savedCards = localStorage.getItem('caa_custom_cards_' + profileId);
            if (savedCards) {
                try {
                    var parsed = JSON.parse(savedCards);
                    // migrate to db
                    dbHelper.set('caa_custom_cards_' + profileId, parsed);
                    return parsed;
                } catch(e) {}
            }
            return null;
        });
    } else {
        var savedCards = localStorage.getItem('caa_custom_cards_' + profileId);
        if (savedCards) {
            try {
                fetchPromise = Promise.resolve(JSON.parse(savedCards));
            } catch(e) {
                fetchPromise = Promise.resolve(null);
            }
        } else {
            fetchPromise = Promise.resolve(null);
        }
    }

    return fetchPromise.then(function(cardsLoaded) {
        if (cardsLoaded && cardsLoaded.length > 0) {
            return cardsLoaded;
        }
        return loadSpecialProfileBackup(profileName);
    });
}

function switchProfile(profileId) {
    if (profileId === currentProfileId) return;
    currentProfileId = profileId;
    saveProfiles();
    
    // Clear selection
    selectedCards = [];
    
    // Load and clean cards for this profile
    loadProfileCards(currentProfileId).then(function(loadedCards) {
        setAndCleanCards(loadedCards);
        
        // Set theme for this profile
        var savedTheme = localStorage.getItem('caa_theme_' + currentProfileId) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        
        // Set Low Vision Mode for this profile
        var lowVision = localStorage.getItem('caa_low_vision_' + currentProfileId) === 'true';
        if (lowVision) {
            document.body.classList.add('low-vision');
        } else {
            document.body.classList.remove('low-vision');
        }
        updateLowVisionIcon(lowVision);

        // Load language for this profile
        loadProfileLanguage();
        
        // Load voices for this profile
        carregarVozes();
        carregarVozConfig();
        carregarRecentes();
        carregarEstatisticas();
        
        // Setup inputs
        var syncDriveId = localStorage.getItem('caa_sync_drive_id_' + currentProfileId) || '';
        var syncAppsScriptUrl = localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId);
        var oldUrls = [
            'https://script.google.com/macros/s/AKfycbz4-E-jnRD9n0cQXf3ttmiLJWE9MMyQCl7RS_Tl5Va2f5O21jzYDau9vuW8x3Ro0fVh/exec',
            'https://script.google.com/macros/s/AKfycbxKaNfrudkvByEXalv30gB2FdwBsDfih_Awwo2kItRT4oMszKySDtQT3VfxQZ9x5ghp/exec'
        ];
        if (!syncAppsScriptUrl || oldUrls.indexOf(syncAppsScriptUrl) !== -1) {
            syncAppsScriptUrl = DEFAULT_APPS_SCRIPT_URL;
            localStorage.setItem('caa_sync_apps_script_url_' + currentProfileId, DEFAULT_APPS_SCRIPT_URL);
        }
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
    });
}
window.switchProfile = switchProfile;

// Load app data
function init() {
    isAppLocked = localStorage.getItem('caa_app_locked') === 'true';
    updateLockUI();
    updatePremiumUI();

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

    dbHelper.init().then(function() {
        return loadProfileCards(currentProfileId);
    }).then(function(loadedCards) {
        setAndCleanCards(loadedCards);
        // Force save to IndexedDB just in case it was migrated from localStorage
        saveCardsToStorage(false);

        // Set Theme
        var savedTheme = localStorage.getItem('caa_theme_' + currentProfileId) || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        // Set Low Vision Mode
        var lowVision = localStorage.getItem('caa_low_vision_' + currentProfileId) === 'true';
        if (lowVision) {
            document.body.classList.add('low-vision');
        } else {
            document.body.classList.remove('low-vision');
        }
        updateLowVisionIcon(lowVision);

        // Load profile language
        loadProfileLanguage();

        // Load system voices
        carregarVozes();
        carregarVozConfig();
        carregarRecentes();
        carregarEstatisticas();

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
        var syncAppsScriptUrl = localStorage.getItem('caa_sync_apps_script_url_' + currentProfileId);
        var oldUrls = [
            'https://script.google.com/macros/s/AKfycbz4-E-jnRD9n0cQXf3ttmiLJWE9MMyQCl7RS_Tl5Va2f5O21jzYDau9vuW8x3Ro0fVh/exec',
            'https://script.google.com/macros/s/AKfycbxKaNfrudkvByEXalv30gB2FdwBsDfih_Awwo2kItRT4oMszKySDtQT3VfxQZ9x5ghp/exec'
        ];
        if (!syncAppsScriptUrl || oldUrls.indexOf(syncAppsScriptUrl) !== -1) {
            syncAppsScriptUrl = DEFAULT_APPS_SCRIPT_URL;
            localStorage.setItem('caa_sync_apps_script_url_' + currentProfileId, DEFAULT_APPS_SCRIPT_URL);
        }
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
    });
}

function saveCardsToStorage(triggerCloudUpload) {
    if (triggerCloudUpload === undefined) triggerCloudUpload = true;
    localStorage.setItem('caa_custom_cards_' + currentProfileId, JSON.stringify(cards));
    if (dbHelper.db) {
        dbHelper.set('caa_custom_cards_' + currentProfileId, cards);
    }
    if (triggerCloudUpload) {
        uploadBackupToCloud();
    }
}

function toggleFavorite(cardIndex) {
    if (cardIndex >= 0 && cardIndex < cards.length) {
        var card = cards[cardIndex];
        card.favorite = !card.favorite;
        saveCardsToStorage();
        renderCards();
    }
}

// Render Main AAC Cards Grid
function renderCards() {
    var searchQuery = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';

    // Filter cards based on search query (matches original and translated text)
    var filtered = cards.filter(function(card) {
        var textPT = card.text.toLowerCase();
        var textTranslated = getCardText(card).toLowerCase();
        return textPT.indexOf(searchQuery) !== -1 || textTranslated.indexOf(searchQuery) !== -1;
    });

    if (filtered.length === 0) {
        var lang = getProfileLanguage();
        var noResultsMsg = 'Nenhuma figura encontrada para';
        if (lang === 'en') noResultsMsg = 'No figure found for';
        else if (lang === 'es') noResultsMsg = 'No se encontró figura para';

        cardsGrid.innerHTML = 
            '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary); width: 100%;">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; display: block; color: var(--text-secondary);"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' +
                '<p>' + noResultsMsg + ' "' + searchQuery + '".</p>' +
            '</div>';
        return;
    }

    // Group cards by category
    var cardsByCategory = {};
    
    // Add dynamically the favorites if any card is marked as favorite
    var favoriteCards = filtered.filter(function(card) { return card.favorite === true; });
    if (favoriteCards.length > 0) {
        cardsByCategory['favorites'] = favoriteCards;
    }

    filtered.forEach(function(card) {
        var cat = card.category || 'custom';
        if (cat === 'drink') cat = 'food';
        if (!cardsByCategory[cat]) {
            cardsByCategory[cat] = [];
        }
        cardsByCategory[cat].push(card);
    });

    // Generate HTML
    var html = '';
    
    // We want to preserve the order of CATEGORIES
    var categoriesOrder = CATEGORIES.filter(function(c) { return c.id !== 'all'; }).concat([{ id: 'custom', name: 'Personalizados', icon: '🎨', class: 'cat-custom' }]);
    
    categoriesOrder.forEach(function(cat) {
        var catCards = cardsByCategory[cat.id];
        if (catCards && catCards.length > 0) {
            // Add category section header
            html += 
                '<div class="category-group-header">' +
                    '<h3><span>' + cat.icon + '</span> ' + getCategoryName(cat.id).toUpperCase() + '</h3>' +
                '</div>';
            
            // Add cards
            catCards.forEach(function(card) {
                var catObj = CATEGORIES.find(function(c) { return c.id === (card.category || 'custom'); });
                var catClass = catObj ? catObj.class : 'cat-custom';
                var catName = catObj ? getCategoryName(catObj.id) : getCategoryName('custom');
                
                var visualContent = '';
                if (card.type === 'emoji') {
                    visualContent = '<div class="card-emoji">' + card.value + '</div>';
                } else {
                    visualContent = '<img src="' + card.value + '" alt="' + getCardText(card) + '" onerror="this.src=\'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22lucide lucide-image-off%22><line x1=%222%22 y1=%222%22 x2=%2222%22 y2=%2222%22/><path d=%22M10.41 10.41a2 2 0 1 1-2.83-2.83%22/><path d=%22M21 21H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.37a2 2 0 0 1 1.04.3l1.18.7a2 2 0 0 0 1.04.3H21a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z%22/><path d=%22m3 16 4-4a2 2 0 0 1 2.82 0l1.18 1.18%22/><path d=%22M16 16 14.5 14.5%22/></svg>\'">';
                }

                var indexInCards = cards.findIndex(function(c) { return c.text === card.text; });
                
                // Favorite properties
                var isFav = card.favorite === true;
                var favClass = isFav ? 'active' : '';
                var favStarSymbol = isFav ? '★' : '☆';

                // Keyboard shortcut indicators for first 9 favorites
                var shortcutBadgeHtml = '';
                if (cat.id === 'favorites') {
                    var favIndex = favoriteCards.findIndex(function(c) { return c.text === card.text; });
                    if (favIndex >= 0 && favIndex < 9) {
                        shortcutBadgeHtml = '<div class="card-shortcut-badge">' + (favIndex + 1) + '</div>';
                    }
                }

                var draggableAttr = isReorderModeActive ? 'draggable="true"' : '';
                var apiBadgeHtml = '';
                if (card.fromApi) {
                    apiBadgeHtml = '<div class="card-api-badge" style="position: absolute; bottom: 5px; right: 5px; background-color: var(--color-primary); color: white; font-size: 0.65rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; z-index: 5; opacity: 0.95; pointer-events: none; letter-spacing: 0.5px;">API</div>';
                }

                html += 
                    '<div class="aac-card ' + catClass + '" ' + draggableAttr + ' data-index="' + indexInCards + '" data-text="' + card.text + '">' +
                        shortcutBadgeHtml +
                        apiBadgeHtml +
                        '<button type="button" class="card-favorite-btn ' + favClass + '" data-index="' + indexInCards + '" title="' + (isFav ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos') + '">' + favStarSymbol + '</button>' +
                        '<span class="card-category-tag">' + catName + '</span>' +
                        visualContent +
                        '<span>' + getCardText(card) + '</span>' +
                    '</div>';
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
            visualContent = '<img src="' + card.value + '" alt="' + getCardText(card) + '">';
        }
        return 
            '<div class="sentence-card" data-idx="' + idx + '">' +
                visualContent +
                '<span>' + getCardText(card) + '</span>' +
            '</div>';
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
                return c.value + ' ' + getCardText(c);
            }
            return getCardText(c);
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
    showSkeletonLoading();

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
            renderCards();
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
    showSkeletonLoading();

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
                renderCards();
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

            // Merge local custom cards that are missing from remoteCards to prevent data loss
            var missingLocalCards = prevCards.filter(function(localCard) {
                var isDefault = DEFAULT_CARDS.some(function(d) { return d.text === localCard.text; });
                if (isDefault) return false;
                var inRemote = remoteCards.some(function(rc) { return rc.text === localCard.text; });
                return !inRemote;
            });
            var mergedRemoteCards = remoteCards.concat(missingLocalCards);

            setAndCleanCards(mergedRemoteCards);
            
            // If we merged missing local cards, trigger upload to keep cloud updated
            var hasMissingLocalMerged = missingLocalCards.length > 0;
            saveCardsToStorage(hasMissingLocalMerged);
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
            renderCards();
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
    showSkeletonLoading();

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

            // Merge local custom cards that are missing from remoteCards to prevent data loss
            var missingLocalCards = prevCards.filter(function(localCard) {
                var isDefault = DEFAULT_CARDS.some(function(d) { return d.text === localCard.text; });
                if (isDefault) return false;
                var inRemote = remoteCards.some(function(rc) { return rc.text === localCard.text; });
                return !inRemote;
            });
            var mergedRemoteCards = remoteCards.concat(missingLocalCards);

            setAndCleanCards(mergedRemoteCards);
            
            // If we merged missing local cards, trigger upload to keep cloud updated
            var hasMissingLocalMerged = missingLocalCards.length > 0;
            saveCardsToStorage(hasMissingLocalMerged);
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
            renderCards();
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
            var displayVal = c.type === 'emoji' ? c.value + ' ' : '';
            return '<li>' + displayVal + c.text + '</li>';
        }).join('');
    } else {
        changelogAddedSection.classList.add('d-none');
    }

    // Populate removed list
    if (removedCards.length > 0) {
        changelogRemovedSection.classList.remove('d-none');
        changelogRemovedList.innerHTML = removedCards.map(function(c) {
            var displayVal = c.type === 'emoji' ? c.value + ' ' : '';
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

    var lang = getProfileLanguage();
    var utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'en') {
        utterance.lang = 'en-US';
    } else if (lang === 'es') {
        utterance.lang = 'es-ES';
    } else {
        utterance.lang = 'pt-BR';
    }
    
    // Configura velocidade (rate) e tom (pitch)
    var savedRate = localStorage.getItem('caa_voice_rate_' + currentProfileId) || '1.0';
    var savedPitch = localStorage.getItem('caa_voice_pitch_' + currentProfileId) || '1.0';
    utterance.rate = parseFloat(savedRate);
    utterance.pitch = parseFloat(savedPitch);
    
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
    
    // Choose voice based on language
    var voices = [];
    try {
        voices = synth.getVoices();
    } catch(e) {
        console.warn('Erro ao obter vozes: ', e);
    }
    
    var savedVoiceName = localStorage.getItem('caa_selected_voice_' + currentProfileId) || '';
    var selectedVoiceObj = null;
    if (savedVoiceName && voices.length > 0) {
        selectedVoiceObj = voices.find(function(v) { return v.name === savedVoiceName; });
    }
    
    if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj;
    } else {
        var preferredLangPrefix = 'pt-';
        if (lang === 'en') preferredLangPrefix = 'en-';
        else if (lang === 'es') preferredLangPrefix = 'es-';

        var preferredVoice = voices.find(function(voice) { 
            return voice.lang && voice.lang.toLowerCase().indexOf(preferredLangPrefix) !== -1; 
        });
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
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
                speakText(getCardText(card));
            });
        } catch(e) {
            console.error('Erro ao tocar áudio:', e);
            speakText(getCardText(card));
        }
    } else {
        speakText(getCardText(card));
    }
}

// Handle Theme Change
function updateThemeIcon(theme) {
    var sunSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
    var moonSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

    btnToggleTheme.innerHTML = (theme === 'dark' ? sunSvg : moonSvg) + ' <span>Alternar Tema</span>';
}

function toggleTheme() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('caa_theme_' + currentProfileId, newTheme);
    updateThemeIcon(newTheme);
}

// Handle Low Vision Mode Change
function updateLowVisionIcon(active) {
    if (!btnToggleLowVision) return;
    btnToggleLowVision.innerHTML = '<span>' + (active ? 'Ativado 👁️' : 'Desativado ❌') + '</span>';
}

function toggleLowVision() {
    var active = document.body.classList.contains('low-vision');
    var newStatus = !active;
    
    if (newStatus) {
        document.body.classList.add('low-vision');
    } else {
        document.body.classList.remove('low-vision');
    }
    
    localStorage.setItem('caa_low_vision_' + currentProfileId, newStatus ? 'true' : 'false');
    updateLowVisionIcon(newStatus);
}

// Open category subchoice modal (abrir por cima)
function openSubChoiceModal(actionText, categoryId) {
    var subCards = [];
    
    if (categoryId === 'food') {
        subChoiceTitle.textContent = 'O que você quer comer?';
        subCards = cards.filter(function(c) { return (c.category === 'food' || c.category === 'drink') && !isDrinkCard(c); });
    } else if (categoryId === 'drink') {
        subChoiceTitle.textContent = 'O que você quer beber?';
        subCards = cards.filter(function(c) { return (c.category === 'food' || c.category === 'drink') && isDrinkCard(c); });
    } else if (categoryId === 'person') {
        subChoiceTitle.textContent = 'Com quem você quer falar?';
        subCards = cards.filter(function(c) { return c.category === 'person'; });
    } else if (categoryId === 'place') {
        subChoiceTitle.textContent = 'Aonde você quer ir?';
        subCards = cards.filter(function(c) { return c.category === 'place'; });
    } else if (categoryId === 'pain') {
        subChoiceTitle.textContent = 'Onde está doendo?';
        subCards = cards.filter(function(c) { return c.category === 'pain'; });
    } else {
        subChoiceTitle.textContent = 'Escolha um(a) ' + actionText;
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

        var apiBadgeHtml = '';
        if (card.fromApi) {
            apiBadgeHtml = '<div class="card-api-badge" style="position: absolute; bottom: 5px; right: 5px; background-color: var(--color-primary); color: white; font-size: 0.65rem; font-weight: bold; padding: 2px 6px; border-radius: 4px; z-index: 5; opacity: 0.95; pointer-events: none; letter-spacing: 0.5px;">API</div>';
        }

        return 
            '<div class="aac-card ' + catClass + '" data-text="' + card.text + '">' +
                apiBadgeHtml +
                visualContent +
                '<span>' + card.text + '</span>' +
            '</div>';
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

    // Card click (add to sentence and speak immediately, or toggle favorite)
    cardsGrid.addEventListener('click', function(e) {
        if (isReorderModeActive) {
            return; // Bloqueia clicks se estiver organizando figuras
        }
        // Toggle favorite if star button clicked
        var favBtn = e.target.closest('.card-favorite-btn');
        if (favBtn) {
            e.stopPropagation();
            var cardIndex = parseInt(favBtn.dataset.index, 10);
            toggleFavorite(cardIndex);
            return;
        }

        var cardEl = e.target.closest('.aac-card');
        if (!cardEl) return;

        var text = cardEl.dataset.text;
        var index = cards.findIndex(function(c) { return c.text === text; });
        
        if (index !== -1) {
            var clickedCard = cards[index];
            selectedCards.push(clickedCard);
            updateSentenceBuilder();
            playCardVoice(clickedCard);
            registrarUsoFigura(clickedCard.text);

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
        var fullSentence = selectedCards.map(function(c) { return getCardText(c); }).join(' ');
        speakText(fullSentence);
        adicionarFraseRecente(selectedCards);
    });

    // Clear all
    btnClearAll.addEventListener('click', function() {
        selectedCards = [];
        updateSentenceBuilder();
    });

    // Theme toggle
    btnToggleTheme.addEventListener('click', toggleTheme);

    // Low Vision toggle
    if (btnToggleLowVision) {
        btnToggleLowVision.addEventListener('click', toggleLowVision);
    }

    // Voice selector change
    if (seletorVozes) {
        seletorVozes.addEventListener('change', function() {
            localStorage.setItem('caa_selected_voice_' + currentProfileId, seletorVozes.value);
        });
    }

    // Language selector change
    if (seletorIdioma) {
        seletorIdioma.addEventListener('change', function() {
            var selectedLang = seletorIdioma.value;
            localStorage.setItem('caa_lang_' + currentProfileId, selectedLang);
            translatePage();
            carregarVozes();
            renderCards();
            updateSentenceBuilder();
        });
    }

    // Controle de velocidade e tom da voz
    if (inputVoiceRate) {
        inputVoiceRate.addEventListener('input', function() {
            var val = parseFloat(inputVoiceRate.value).toFixed(1);
            if (valVoiceRate) valVoiceRate.textContent = val;
            localStorage.setItem('caa_voice_rate_' + currentProfileId, val);
        });
    }

    if (inputVoicePitch) {
        inputVoicePitch.addEventListener('input', function() {
            var val = parseFloat(inputVoicePitch.value).toFixed(1);
            if (valVoicePitch) valVoicePitch.textContent = val;
            localStorage.setItem('caa_voice_pitch_' + currentProfileId, val);
        });
    }

    // Compartilhamento / Envio de frases
    if (btnShareWhatsapp) {
        btnShareWhatsapp.addEventListener('click', function() {
            if (selectedCards.length === 0) {
                showCustomAlert('Por favor, monte uma frase primeiro tocando nas figuras! 😊');
                return;
            }
            var fullSentence = selectedCards.map(function(c) { return getCardText(c); }).join(' ');
            showShareOptions(fullSentence);
        });
    }

    if (btnShareFloat) {
        btnShareFloat.addEventListener('click', function() {
            if (selectedCards.length === 0) {
                showCustomAlert('Por favor, monte uma frase primeiro tocando nas figuras! 😊');
                return;
            }
            var fullSentence = selectedCards.map(function(c) { return getCardText(c); }).join(' ');
            showShareOptions(fullSentence);
        });
    }

    // Settings Modal controls
    btnSettings.addEventListener('click', function() {
        modalSettings.classList.add('open');
        renderManageCustomCards();
        carregarEstatisticas();
    });

    // Limpar Estatísticas
    var btnClearStats = document.getElementById('btn-clear-stats');
    if (btnClearStats) {
        btnClearStats.addEventListener('click', function() {
            showCustomConfirm('Deseja realmente apagar o histórico de toques das figuras? 📊').then(function(confirmed) {
                if (confirmed) {
                    localStorage.removeItem('caa_stats_' + currentProfileId);
                    carregarEstatisticas();
                    showCustomAlert('Estatísticas apagadas com sucesso! 🗑️');
                }
            });
        });
    }

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
                    showCustomAlert('Figura "' + cardText + '" excluída com sucesso! 🗑️');
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
        selectedArasaacBase64 = null;
        if (arasaacResultsContainer) {
            arasaacResultsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-secondary); width: 100%; text-align: center; display: block; margin: auto;">Digite um termo e clique em Buscar para ver os desenhos...</span>';
        }
        if (arasaacSearchInput) arasaacSearchInput.value = '';
        if (selectedArasaacIdInput) selectedArasaacIdInput.value = '';
        
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
        if (groupArasaac) groupArasaac.classList.add('d-none');
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
            var val = e.target.value;
            if (val === 'emoji') {
                groupEmoji.classList.remove('d-none');
                if (groupArasaac) groupArasaac.classList.add('d-none');
                groupUpload.classList.add('d-none');
            } else if (val === 'arasaac') {
                groupEmoji.classList.add('d-none');
                if (groupArasaac) groupArasaac.classList.remove('d-none');
                groupUpload.classList.add('d-none');
            } else {
                groupEmoji.classList.add('d-none');
                if (groupArasaac) groupArasaac.classList.add('d-none');
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
            imagePreview.innerHTML = '<img src="' + uploadedImageBase64 + '" alt="Preview">';
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
    var emojiDebounceTimer = null;
    if (cardTextInput && cardEmojiInput) {
        cardEmojiInput.addEventListener('input', function() {
            cardEmojiInput.dataset.fromApi = 'false';
        });

        cardTextInput.addEventListener('input', function() {
            var text = cardTextInput.value.trim();
            if (!text) return;
            var fullNormalized = normalizeText(text);
            
            // 1. Match exato da frase inteira na lista local
            if (EMOJI_DICTIONARY[fullNormalized]) {
                cardEmojiInput.value = EMOJI_DICTIONARY[fullNormalized];
                cardEmojiInput.dataset.fromApi = 'false';
                return;
            }
            
            // 2. Match palavra por palavra local
            var words = text.split(/\s+/).map(normalizeText);
            var foundLocal = false;
            for (var i = words.length - 1; i >= 0; i--) {
                var word = words[i];
                if (word && EMOJI_DICTIONARY[word]) {
                    cardEmojiInput.value = EMOJI_DICTIONARY[word];
                    cardEmojiInput.dataset.fromApi = 'false';
                    foundLocal = true;
                    break;
                }
            }
            
            if (foundLocal) return;

            // 3. Se não achou na lista local, busca na API dinamicamente (com debounce)
            if (text.length >= 3) {
                if (emojiDebounceTimer) clearTimeout(emojiDebounceTimer);
                emojiDebounceTimer = setTimeout(function() {
                    var apiKey = 'd2de36964848b8e14e2b16a7ba69449635f4bb38';
                    var searchWord = words[words.length - 1];
                    var url = 'https://emoji-api.com/emojis?search=' + encodeURIComponent(searchWord) + '&access_key=' + apiKey;
                    
                    ajaxRequest(url)
                        .then(function(data) {
                            if (Array.isArray(data) && data.length > 0) {
                                var emojiCharacter = data[0].character;
                                if (emojiCharacter) {
                                    cardEmojiInput.value = emojiCharacter;
                                    cardEmojiInput.dataset.fromApi = 'true';
                                }
                            }
                        })
                        .catch(function(e) {
                            console.warn('Erro ao buscar emoji na API:', e);
                        });
                }, 600);
            }
        });
    }

    // Add card submission inside settings
    formAddCard.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!checkPremiumStatus()) {
            showCustomAlert("Recurso Premium! 🌟\n\nCriar cartões personalizados é um recurso exclusivo da versão Premium.\n\nPara liberar esse recurso, insira o seu código de ativação no campo 'Ativação Premium' dentro das Opções Avançadas de Configurações.");
            return;
        }
        
        var text = document.getElementById('card-text').value.trim();
        var category = detectCategory(text);
        var imageType = document.querySelector('input[name="image-type"]:checked').value;
        
        var value = '';
        var finalType = imageType;
        if (imageType === 'emoji') {
            value = document.getElementById('card-emoji').value.trim() || '✨';
        } else if (imageType === 'arasaac') {
            var selectedId = selectedArasaacIdInput ? selectedArasaacIdInput.value : '';
            if (!selectedId) {
                showCustomAlert('Por favor, busque e selecione um desenho do ARASAAC. 🎨');
                return;
            }
            if (!selectedArasaacBase64) {
                showCustomAlert('Aguarde o download do desenho para uso offline... ⏳');
                return;
            }
            value = selectedArasaacBase64;
            finalType = 'image'; // Salvar como imagem para carregar via tag img
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

        var newCardObj = { text: text, category: category, type: finalType, value: value };
        if (imageType === 'emoji' && cardEmojiInput.dataset.fromApi === 'true') {
            newCardObj.fromApi = true;
        }
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

    // Lógica de busca do ARASAAC
    if (btnArasaacSearch && arasaacSearchInput) {
        var executarBuscaArasaac = function() {
            var term = arasaacSearchInput.value.trim();
            if (!term) {
                showCustomAlert('Por favor, digite um termo para buscar. 🔍');
                return;
            }
            if (arasaacResultsContainer) {
                arasaacResultsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-secondary); width: 100%; text-align: center; display: block; margin: auto;">Buscando desenhos... 🔍</span>';
            }
            selectedArasaacBase64 = null;
            if (selectedArasaacIdInput) selectedArasaacIdInput.value = '';
            
            ajaxRequest('https://api.arasaac.org/api/pictograms/pt/search/' + encodeURIComponent(term))
                .then(function(data) {
                    if (!arasaacResultsContainer) return;
                    if (!Array.isArray(data) || data.length === 0) {
                        arasaacResultsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--color-danger); width: 100%; text-align: center; display: block; margin: auto;">Nenhum desenho encontrado para essa palavra. 😢</span>';
                        return;
                    }
                    
                    var results = data.slice(0, 15);
                    var html = '';
                    results.forEach(function(item) {
                        var id = item._id;
                        html += 
                            '<div class="arasaac-item" data-id="' + id + '" style="width: 60px; height: 60px; border: 2px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; justify-content: center; background-color: white; padding: 4px; position: relative; transition: all 0.2s; flex-shrink: 0; box-sizing: border-box;">' +
                                '<img src="https://api.arasaac.org/api/pictograms/' + id + '" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="' + term + '">' +
                            '</div>';
                    });
                    arasaacResultsContainer.innerHTML = html;
                    
                    var items = arasaacResultsContainer.querySelectorAll('.arasaac-item');
                    items.forEach(function(item) {
                        item.addEventListener('click', function() {
                            // Desmarcar anteriores
                            items.forEach(function(el) {
                                el.style.borderColor = 'var(--border-color)';
                                el.style.boxShadow = 'none';
                            });
                            
                            // Selecionar atual
                            item.style.borderColor = 'var(--color-primary)';
                            item.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
                            
                            var id = item.dataset.id;
                            if (selectedArasaacIdInput) selectedArasaacIdInput.value = id;
                            
                            selectedArasaacBase64 = null;
                            item.style.opacity = '0.5';
                            
                            var imgUrl = 'https://api.arasaac.org/api/pictograms/' + id;
                            convertImageUrlToBase64(imgUrl)
                                .then(function(base64) {
                                    selectedArasaacBase64 = base64;
                                    item.style.opacity = '1';
                                })
                                .catch(function(err) {
                                    console.warn('Erro ao baixar pictograma para base64, usando URL direta:', err);
                                    // Fallback para link direto
                                    selectedArasaacBase64 = imgUrl;
                                    item.style.opacity = '1';
                                });
                        });
                    });
                })
                .catch(function(err) {
                    console.error(err);
                    if (arasaacResultsContainer) {
                        arasaacResultsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--color-danger); width: 100%; text-align: center; display: block; margin: auto;">Erro ao carregar desenhos. Verifique sua conexão. 🌐</span>';
                    }
                });
        };
        
        btnArasaacSearch.addEventListener('click', executarBuscaArasaac);
        arasaacSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                executarBuscaArasaac();
            }
        });
    }

    // Reset default cards button inside settings
    btnResetCards.addEventListener('click', function() {
        showCustomConfirm('Deseja realmente apagar todos os cartões personalizados e restaurar o padrão original?').then(function(confirmed) {
            if (confirmed) {
                localStorage.removeItem('caa_custom_cards_' + currentProfileId);
                cards = DEFAULT_CARDS.slice();
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
            registrarUsoFigura(clickedCard.text);
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
            var fullSentence = selectedCards.map(function(c) { return getCardText(c); }).join(' ');
            speakText(fullSentence);
            adicionarFraseRecente(selectedCards);
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
            
            if (!checkPremiumStatus() && profiles.length >= MAX_FREE_PROFILES) {
                showCustomAlert("Limite de perfis atingido! 👥\n\nNa versão gratuita você pode ter no máximo " + MAX_FREE_PROFILES + " perfis.\n\nAtive a versão Premium para criar perfis ilimitados.");
                return;
            }
            
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
                                btnHtml = '<button type="button" class="btn-import-cloud-profile" data-name="' + cp.name + '" style="background-color: var(--color-primary); color: white; border: none; padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 700; cursor: pointer;">Importar 📥</button>';
                            }
                            
                            return 
                                '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; gap: 8px;">' +
                                    '<div style="display: flex; flex-direction: column; overflow: hidden; text-align: left;">' +
                                        '<strong style="color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">' + cp.name + '</strong>' +
                                        '<span style="font-size: 0.75rem; color: var(--text-secondary);">' + dateText + ' • ' + sizeText + '</span>' +
                                    '</div>' +
                                    '<div style="flex-shrink: 0;">' +
                                        btnHtml +
                                    '</div>' +
                                '</div>';
                        }).join('');
                        
                        // Adicionar evento para os botões de importar recém-gerados
                        var importBtns = cloudProfilesList.querySelectorAll('.btn-import-cloud-profile');
                        importBtns.forEach(function(btn) {
                            btn.addEventListener('click', function() {
                                if (!checkPremiumStatus() && profiles.length >= MAX_FREE_PROFILES) {
                                    showCustomAlert("Limite de perfis atingido! 👥\n\nNa versão gratuita você pode ter no máximo " + MAX_FREE_PROFILES + " perfis.\n\nAtive a versão Premium para importar perfis ilimitados.");
                                    return;
                                }
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

    // Lock app controls & Modal challenge handlers
    if (btnLockApp) {
        btnLockApp.addEventListener('click', function() {
            if (isAppLocked) {
                // Open modal challenge
                generateLockChallenge();
                if (modalLockChallenge) {
                    modalLockChallenge.classList.add('open');
                }
                if (lockMathAnswer) {
                    setTimeout(function() { lockMathAnswer.focus(); }, 150);
                }
            } else {
                // Lock app immediately
                isAppLocked = true;
                localStorage.setItem('caa_app_locked', 'true');
                updateLockUI();
                showCustomAlert("Configurações bloqueadas! 🔒\nO menu do tutor e seletor de perfil estão ocultos.");
            }
        });
    }

    if (btnLockCancel && modalLockChallenge) {
        btnLockCancel.addEventListener('click', function() {
            modalLockChallenge.classList.remove('open');
        });
    }

    var submitUnlockAnswer = function() {
        if (!lockMathAnswer) return;
        var userAnswer = parseInt(lockMathAnswer.value, 10);
        if (userAnswer === currentLockAnswer) {
            isAppLocked = false;
            localStorage.setItem('caa_app_locked', 'false');
            updateLockUI();
            if (modalLockChallenge) {
                modalLockChallenge.classList.remove('open');
            }
            showCustomAlert("Configurações desbloqueadas! 🔓");
        } else {
            showCustomAlert("Resposta incorreta! Tente novamente. ❌");
            generateLockChallenge();
            if (lockMathAnswer) {
                lockMathAnswer.focus();
            }
        }
    };

    if (btnLockSubmit) {
        btnLockSubmit.addEventListener('click', submitUnlockAnswer);
    }

    if (lockMathAnswer) {
        lockMathAnswer.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                submitUnlockAnswer();
            }
        });
    }

    // Reorder Mode toggle
    if (btnToggleReorder) {
        btnToggleReorder.addEventListener('click', function() {
            if (!checkPremiumStatus()) {
                showCustomAlert("Recurso Premium! 🌟\n\nOrganizar e reordenar as figuras é um recurso exclusivo da versão Premium.\n\nPara liberar esse recurso, insira o seu código de ativação no campo 'Ativação Premium' dentro das Opções Avançadas de Configurações.");
                return;
            }

            isReorderModeActive = !isReorderModeActive;
            if (isReorderModeActive) {
                document.body.classList.add('is-reordering');
                showCustomAlert("Modo de Organização Ativo! ⇄\nArraste as figuras para mudar a ordem.");
            } else {
                document.body.classList.remove('is-reordering');
            }
            renderCards();
        });
    }

    // License key input listener
    if (premiumCodeInput) {
        premiumCodeInput.addEventListener('input', function() {
            var val = premiumCodeInput.value.trim().toLowerCase().replace(/\s+/g, '');
            if (val === 'vip99') {
                localStorage.setItem('caa_premium_active', 'true');
                localStorage.removeItem('caa_dev_mode');
                updatePremiumUI();
                showCustomAlert("Premium Ativado! 🌟\n\nMuito obrigado por apoiar o projeto. Os recursos exclusivos estão liberados.");
            } else if (val === 'dev99' || val === 'mimidev') {
                localStorage.setItem('caa_premium_active', 'true');
                localStorage.setItem('caa_dev_mode', 'true');
                updatePremiumUI();
                showCustomAlert("Modo Desenvolvedor Ativado! 🛠️\n\nPremium liberado para testes. Você pode desativar este modo a qualquer momento no painel de configurações para testar a versão gratuita.");
            }
        });
    }

    // Drag & Drop HTML5 Events
    var dragStartIndex = null;

    cardsGrid.addEventListener('dragstart', function(e) {
        if (!isReorderModeActive) return;
        var card = e.target.closest('.aac-card');
        if (!card) return;
        
        dragStartIndex = parseInt(card.dataset.index, 10);
        card.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragStartIndex);
    });

    cardsGrid.addEventListener('dragover', function(e) {
        if (!isReorderModeActive) return;
        e.preventDefault();
        var card = e.target.closest('.aac-card');
        if (card) {
            card.classList.add('drag-over');
        }
    });

    cardsGrid.addEventListener('dragleave', function(e) {
        if (!isReorderModeActive) return;
        var card = e.target.closest('.aac-card');
        if (card) {
            card.classList.remove('drag-over');
        }
    });

    cardsGrid.addEventListener('drop', function(e) {
        if (!isReorderModeActive) return;
        e.preventDefault();
        
        var targetCard = e.target.closest('.aac-card');
        if (targetCard) {
            targetCard.classList.remove('drag-over');
            var dragEndIndex = parseInt(targetCard.dataset.index, 10);
            
            if (dragStartIndex !== null && dragStartIndex !== dragEndIndex) {
                // Swap cards
                var temp = cards[dragStartIndex];
                cards[dragStartIndex] = cards[dragEndIndex];
                cards[dragEndIndex] = temp;
                
                saveCardsToStorage();
                renderCards();
            }
        }
        dragStartIndex = null;
    });

    cardsGrid.addEventListener('dragend', function(e) {
        if (!isReorderModeActive) return;
        var card = e.target.closest('.aac-card');
        if (card) {
            card.classList.remove('is-dragging');
        }
        
        // Clean up any remaining hover states
        var overs = cardsGrid.querySelectorAll('.drag-over');
        overs.forEach(function(o) { o.classList.remove('drag-over'); });
    });

    // Touch Reordering Events (Mobile/Tablet Support)
    var touchStartIndex = null;
    var currentTouchTarget = null;

    cardsGrid.addEventListener('touchstart', function(e) {
        if (!isReorderModeActive) return;
        
        var card = e.target.closest('.aac-card');
        if (!card) return;
        
        touchStartIndex = parseInt(card.dataset.index, 10);
        card.classList.add('is-dragging');
        currentTouchTarget = card;
    }, { passive: true });

    cardsGrid.addEventListener('touchmove', function(e) {
        if (!isReorderModeActive) return;
        if (touchStartIndex === null) return;
        
        // Prevent scrolling while dragging
        if (e.cancelable) e.preventDefault();
        
        var touch = e.touches[0];
        var element = document.elementFromPoint(touch.clientX, touch.clientY);
        var targetCard = element ? element.closest('.aac-card') : null;
        
        // Remove hover from previous target
        var previousOvers = cardsGrid.querySelectorAll('.drag-over');
        previousOvers.forEach(function(o) { 
            if (o !== targetCard) o.classList.remove('drag-over'); 
        });
        
        if (targetCard && targetCard !== currentTouchTarget) {
            targetCard.classList.add('drag-over');
        }
    }, { passive: false });

    cardsGrid.addEventListener('touchend', function(e) {
        if (!isReorderModeActive) return;
        if (touchStartIndex === null) return;
        
        var previousOvers = cardsGrid.querySelectorAll('.drag-over');
        previousOvers.forEach(function(o) { o.classList.remove('drag-over'); });
        
        if (currentTouchTarget) {
            currentTouchTarget.classList.remove('is-dragging');
        }
        
        // We look at the last touch position to find the target card
        var touch = e.changedTouches[0];
        var element = document.elementFromPoint(touch.clientX, touch.clientY);
        var targetCard = element ? element.closest('.aac-card') : null;
        
        if (targetCard) {
            var touchEndIndex = parseInt(targetCard.dataset.index, 10);
            if (touchStartIndex !== touchEndIndex) {
                // Swap
                var temp = cards[touchStartIndex];
                cards[touchStartIndex] = cards[touchEndIndex];
                cards[touchEndIndex] = temp;
                
                saveCardsToStorage();
                renderCards();
            }
        }
        
        touchStartIndex = null;
        currentTouchTarget = null;
    });

    // Keyboard shortcuts for favorites (keys 1 to 9)
    document.addEventListener('keydown', function(e) {
        var activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea') {
            return;
        }

        if (e.key >= '1' && e.key <= '9') {
            var shortcutNum = parseInt(e.key, 10);
            var favoriteCards = cards.filter(function(c) { return c.favorite === true; });
            if (favoriteCards.length >= shortcutNum) {
                var card = favoriteCards[shortcutNum - 1];
                selectedCards.push(card);
                updateSentenceBuilder();
                playCardVoice(card);
                
                if (card.goToCategory) {
                    openSubChoiceModal(card.text, card.goToCategory);
                }
            }
        }
    });

    // Lógica do formulário de feedback (Web3Forms)
    var feedbackForm = document.getElementById('form');
    if (feedbackForm) {
        var feedbackSubmitBtn = feedbackForm.querySelector('button[type="submit"]');
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var formData = new FormData(feedbackForm);
            formData.append("access_key", "4f2eccbe-593a-4c25-871b-103e3931b8ff");

            var originalText = feedbackSubmitBtn.innerHTML;
            feedbackSubmitBtn.innerHTML = "<span>Carregando... ⏳</span>";
            feedbackSubmitBtn.disabled = true;

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "https://api.web3forms.com/submit", true);
            xhr.onload = function() {
                var data;
                try {
                    data = JSON.parse(xhr.responseText);
                } catch(e) {
                    data = {};
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    feedbackForm.reset();
                    
                    var oldMsg = feedbackForm.querySelector('.feedback-success-msg');
                    if (oldMsg) oldMsg.remove();

                    var successMsg = document.createElement('div');
                    successMsg.className = 'feedback-success-msg';
                    successMsg.textContent = 'Ideia enviada! Obrigado por ajudar a construir o projeto.';
                    successMsg.style.backgroundColor = 'var(--color-primary)';
                    successMsg.style.color = '#ffffff';
                    successMsg.style.padding = '12px';
                    successMsg.style.borderRadius = 'var(--radius-sm)';
                    successMsg.style.marginTop = '10px';
                    successMsg.style.fontWeight = 'bold';
                    successMsg.style.textAlign = 'center';
                    successMsg.style.opacity = '0';
                    successMsg.style.transition = 'opacity 0.3s ease';
                    
                    feedbackForm.appendChild(successMsg);
                    
                    setTimeout(function() {
                        successMsg.style.opacity = '1';
                    }, 50);
                    
                    setTimeout(function() {
                        successMsg.style.opacity = '0';
                        setTimeout(function() {
                            if (successMsg.parentNode) {
                                successMsg.parentNode.removeChild(successMsg);
                            }
                        }, 300);
                    }, 4000);
                } else {
                    showCustomAlert("Erro: " + (data.message || "Não foi possível enviar no momento."));
                }
            };
            xhr.onerror = function() {
                showCustomAlert("Algo deu errado. Por favor, tente novamente.");
            };
            xhr.onloadend = function() {
                feedbackSubmitBtn.innerHTML = originalText;
                feedbackSubmitBtn.disabled = false;
            };
            xhr.send(formData);
        });
    }
}

// Ensure voice synth is ready on page load
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function() {};
}

// Launch application
window.addEventListener('DOMContentLoaded', init);
