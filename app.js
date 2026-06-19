const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyDyGjcCb7lJzirtLdicwVoSokPozdo7JWaeeyOw-4kvSDeYYOvlPoH3WW8JrlSvsZf/exec';

// Define pre-configured categories with emojis
const CATEGORIES = [
    { id: 'all', name: 'Todos', icon: '📁', class: '' },
    { id: 'essential', name: 'Essencial', icon: '⭐', class: 'cat-essential' },
    { id: 'action', name: 'Ações', icon: '🟢', class: 'cat-action' },
    { id: 'food', name: 'Alimentação', icon: '🍏', class: 'cat-food' },
    { id: 'feeling', name: 'Sentimentos', icon: '❤️', class: 'cat-feeling' },
    { id: 'place', name: 'Lugares', icon: '🏠', class: 'cat-place' },
    { id: 'person', name: 'Pessoas', icon: '👥', class: 'cat-person' }
];

// Initial default cards
const DEFAULT_CARDS = [
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
let cards = [];
let selectedCards = [];

// DOM Elements
const cardsGrid = document.getElementById('cards-grid');
const sentenceList = document.getElementById('sentence-list');
const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');

// Main Buttons
const btnSpeak = document.getElementById('btn-speak');
const btnClearAll = document.getElementById('btn-clear-all');
const btnToggleTheme = document.getElementById('btn-toggle-theme');

// Settings Modal Elements
const btnSettings = document.getElementById('btn-settings');
const modalSettings = document.getElementById('modal-settings');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnResetCards = document.getElementById('btn-reset-cards');
const btnExportCards = document.getElementById('btn-export-cards');
const btnDownloadBackup = document.getElementById('btn-download-backup');
const btnImportBackupTrigger = document.getElementById('btn-import-backup-trigger');
const inputImportBackup = document.getElementById('input-import-backup');

// Add Card Form Elements inside Settings
const formAddCard = document.getElementById('form-add-card');
const cardTextInput = document.getElementById('card-text');
const cardEmojiInput = document.getElementById('card-emoji');
const imageTypeRadios = document.getElementsByName('image-type');
const groupEmoji = document.getElementById('group-emoji');
const groupUpload = document.getElementById('group-upload');
const cardImageFileInput = document.getElementById('card-image-file');
const imagePreview = document.getElementById('image-preview');

// Temporary image storage (base64)
let uploadedImageBase64 = null;

// Sub Choice Modal Elements
const modalSubChoice = document.getElementById('modal-sub-choice');
const subChoiceGrid = document.getElementById('sub-choice-grid');
const subChoiceTitle = document.getElementById('sub-choice-title');
const btnCloseSubChoice = document.getElementById('btn-close-sub-choice');
const btnAddSubChoice = document.getElementById('btn-add-sub-choice');

// Floating Bottom Bar Elements
const floatingBottomBar = document.getElementById('floating-bottom-bar');
const floatingSentencePreview = document.getElementById('floating-sentence-preview');
const btnSpeakFloat = document.getElementById('btn-speak-float');
const btnClearFloat = document.getElementById('btn-clear-float');

// Google Drive Sync Elements
const syncDriveIdInput = document.getElementById('sync-drive-id');
const syncAppsScriptUrlInput = document.getElementById('sync-apps-script-url');
const checkAutoBackup = document.getElementById('check-auto-backup');
const btnSyncNow = document.getElementById('btn-sync-now');
const syncStatusText = document.getElementById('sync-status');

// Changelog Modal Elements
const modalChangelog = document.getElementById('modal-changelog');
const btnCloseChangelog = document.getElementById('btn-close-changelog');
const btnOkChangelog = document.getElementById('btn-ok-changelog');
const changelogAddedSection = document.getElementById('changelog-added-section');
const changelogAddedList = document.getElementById('changelog-added-list');
const changelogRemovedSection = document.getElementById('changelog-removed-section');
const changelogRemovedList = document.getElementById('changelog-removed-list');

// Initialize Web Speech Synthesis
const synth = window.speechSynthesis;

// Dicionário de sugestão de emojis em português
const EMOJI_DICTIONARY = {
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
    const normalized = normalizeText(text);
    
    // Pessoas (person)
    const personKeywords = [
        'eu', 'voce', 'mamae', 'mae', 'papai', 'pai', 'vovo', 'vovo', 'irmao', 'irma', 'amigo', 'amiga', 
        'professor', 'professora', 'medico', 'medica', 'bebe', 'tio', 'tia', 'primo', 'prima',
        'pessoa', 'gente', 'crianca', 'filho', 'filha', 'tutor', 'terapeuta', 'fono'
    ];
    if (personKeywords.some(keyword => normalized === keyword || normalized.includes(keyword))) {
        return 'person';
    }

    // Lugares (place)
    const placeKeywords = [
        'casa', 'escola', 'parque', 'rua', 'quarto', 'banheiro', 'cozinha', 'sala', 'quintal', 
        'praia', 'shopping', 'shopping', 'hospital', 'cinema', 'mercado', 'igreja', 'clube', 'piscina'
    ];
    if (placeKeywords.some(keyword => normalized === keyword || normalized.includes(keyword))) {
        return 'place';
    }

    // Alimentação (food)
    const foodKeywords = [
        'agua', 'suco', 'refrigerante', 'refri', 'leite', 'cafe', 'cha', 'pao', 'bolo', 
        'chocolate', 'biscoito', 'bolacha', 'queijo', 'fruta', 'maca', 'banana', 'uva', 
        'laranja', 'morango', 'melancia', 'abacaxi', 'limao', 'pera', 'pessego', 'cereja', 
        'coco', 'comida', 'arroz', 'feijao', 'sopa', 'salada', 'carne', 'frango', 'peixe', 
        'ovo', 'batata', 'pizza', 'hamburguer', 'pastel', 'sorvete', 'comer', 'beber', 'fome'
    ];
    if (foodKeywords.some(keyword => normalized === keyword || normalized.includes(keyword))) {
        return 'food';
    }

    // Sentimentos (feeling)
    const feelingKeywords = [
        'feliz', 'alegre', 'triste', 'cansado', 'sono', 'dor', 'machucado', 'doente', 
        'bravo', 'irritado', 'assustado', 'medo', 'surpreso', 'nojo', 'vergonha', 'amor',
        'gostar', 'amar', 'odiar'
    ];
    if (feelingKeywords.some(keyword => normalized === keyword || normalized.includes(keyword))) {
        return 'feeling';
    }

    // Ações (action)
    const actionKeywords = [
        'ir', 'correr', 'brincar', 'dormir', 'ouvir', 'ver', 'olhar', 'falar', 'cantar', 
        'dancar', 'escrever', 'desenhar', 'ler', 'estudar', 'banho', 'escovar', 'sentar', 
        'levantar', 'parar', 'ajudar', 'socorro', 'limpar', 'pegar', 'dar', 'abrir', 'fechar'
    ];
    if (actionKeywords.some(keyword => normalized === keyword || normalized.includes(keyword))) {
        return 'action';
    }

    // Default to custom
    return 'custom';
}

// Custom alert modal using HTML (bypasses native alert blocks on iOS WebView)
function showCustomAlert(message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('modal-custom-dialog');
        const title = document.getElementById('custom-dialog-title');
        const msg = document.getElementById('custom-dialog-message');
        const buttonsContainer = document.getElementById('custom-dialog-buttons');

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

        const btnOk = document.getElementById('btn-dialog-ok');
        btnOk.addEventListener('click', () => {
            dialog.classList.remove('open');
            resolve();
        }, { once: true });
    });
}

// Custom confirm modal using HTML (bypasses native confirm blocks on iOS WebView)
function showCustomConfirm(message) {
    return new Promise((resolve) => {
        const dialog = document.getElementById('modal-custom-dialog');
        const title = document.getElementById('custom-dialog-title');
        const msg = document.getElementById('custom-dialog-message');
        const buttonsContainer = document.getElementById('custom-dialog-buttons');

        if (!dialog || !msg || !buttonsContainer) {
            const res = confirm(message);
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

        const btnCancel = document.getElementById('btn-dialog-cancel');
        const btnConfirm = document.getElementById('btn-dialog-confirm');

        btnCancel.addEventListener('click', () => {
            dialog.classList.remove('open');
            resolve(false);
        }, { once: true });

        btnConfirm.addEventListener('click', () => {
            dialog.classList.remove('open');
            resolve(true);
        }, { once: true });
    });
}

// Set cards, clean obsolete ones, sync properties and ensure DEFAULT_CARDS are always present
function setAndCleanCards(newCards) {
    let cleaned = [...newCards];
    // Remove obsolete cards
    cleaned = cleaned.filter(c => c.text !== 'Dor / Machucado');
    
    // Sync default properties
    cleaned = cleaned.map(savedCard => {
        const defaultCard = DEFAULT_CARDS.find(d => d.text === savedCard.text);
        if (defaultCard) {
            if (defaultCard.goToCategory) {
                savedCard.goToCategory = defaultCard.goToCategory;
            }
        }
        return savedCard;
    });
    
    // Ensure all default cards are present
    DEFAULT_CARDS.forEach(defaultCard => {
        const exists = cleaned.some(c => c.text === defaultCard.text);
        if (!exists) {
            cleaned.push(defaultCard);
        }
    });

    cards = cleaned;
}

// Render the list of custom cards inside settings for management
function renderManageCustomCards() {
    const listContainer = document.getElementById('custom-cards-list');
    if (!listContainer) return;

    // Filter only custom cards (not present in DEFAULT_CARDS)
    const customCards = cards.filter(c => !DEFAULT_CARDS.some(d => d.text === c.text));

    if (customCards.length === 0) {
        listContainer.innerHTML = '<span style="font-size: 0.9rem; color: var(--text-secondary); font-style: italic; display: block; text-align: center; padding: 10px;">Nenhum cartão personalizado criado.</span>';
        return;
    }

    listContainer.innerHTML = customCards.map((card) => {
        const displayVal = card.type === 'emoji' ? card.value : '🖼️';
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

// Load app data
function init() {
    // Load custom cards or use default
    const savedCards = localStorage.getItem('caa_custom_cards');
    if (savedCards) {
        try {
            const parsed = JSON.parse(savedCards);
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
    const savedTheme = localStorage.getItem('caa_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Render interface elements
    renderCards();
    updateSentenceBuilder();

    // Setup event listeners
    setupEventListeners();

    // Check Google Drive & Apps Script Sync on Startup
    const syncDriveId = localStorage.getItem('caa_sync_drive_id');
    const syncAppsScriptUrl = localStorage.getItem('caa_sync_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
    const autoBackup = localStorage.getItem('caa_auto_backup') !== 'false';

    if (syncDriveId && syncDriveIdInput) syncDriveIdInput.value = syncDriveId;
    if (syncAppsScriptUrlInput) syncAppsScriptUrlInput.value = syncAppsScriptUrl;
    if (checkAutoBackup) checkAutoBackup.checked = autoBackup;

    if (navigator.onLine) {
        const hasCustomUrl = !!localStorage.getItem('caa_sync_apps_script_url');
        const isNewDevice = !localStorage.getItem('caa_custom_cards');
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

function saveCardsToStorage(triggerCloudUpload = true) {
    localStorage.setItem('caa_custom_cards', JSON.stringify(cards));
    if (triggerCloudUpload) {
        uploadBackupToCloud();
    }
}

// Render Main AAC Cards Grid
function renderCards() {
    const searchQuery = (searchInput && searchInput.value) ? searchInput.value.toLowerCase().trim() : '';

    // Filter cards based on search query
    const filtered = cards.filter(card => {
        return card.text.toLowerCase().includes(searchQuery);
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
    const cardsByCategory = {};
    filtered.forEach(card => {
        const cat = card.category || 'custom';
        if (!cardsByCategory[cat]) {
            cardsByCategory[cat] = [];
        }
        cardsByCategory[cat].push(card);
    });

    // Generate HTML
    let html = '';
    
    // We want to preserve the order of CATEGORIES
    const categoriesOrder = [...CATEGORIES.filter(c => c.id !== 'all'), { id: 'custom', name: 'Personalizados', icon: '🎨', class: 'cat-custom' }];
    
    categoriesOrder.forEach(cat => {
        const catCards = cardsByCategory[cat.id];
        if (catCards && catCards.length > 0) {
            // Add category section header
            html += `
                <div class="category-group-header">
                    <h3><span>${cat.icon}</span> ${cat.name.toUpperCase()}</h3>
                </div>
            `;
            
            // Add cards
            catCards.forEach(card => {
                const catObj = CATEGORIES.find(c => c.id === (card.category || 'custom'));
                const catClass = catObj ? catObj.class : 'cat-custom';
                const catName = catObj ? catObj.name : 'Personalizado';
                
                let visualContent = '';
                if (card.type === 'emoji') {
                    visualContent = `<div class="card-emoji">${card.value}</div>`;
                } else {
                    visualContent = `<img src="${card.value}" alt="${card.text}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 class=%22lucide lucide-image-off%22><line x1=%222%22 y1=%222%22 x2=%2222%22 y2=%2222%22/><path d=%22M10.41 10.41a2 2 0 1 1-2.83-2.83%22/><path d=%22M21 21H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.37a2 2 0 0 1 1.04.3l1.18.7a2 2 0 0 0 1.04.3H21a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z%22/><path d=%22m3 16 4-4a2 2 0 0 1 2.82 0l1.18 1.18%22/><path d=%22M16 16 14.5 14.5%22/></svg>'">`;
                }

                const indexInCards = cards.findIndex(c => c.text === card.text);

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
    sentenceList.innerHTML = selectedCards.map((card, idx) => {
        let visualContent = '';
        if (card.type === 'emoji') {
            visualContent = `<div class="card-emoji">${card.value}</div>`;
        } else {
            visualContent = `<img src="${card.value}" alt="${card.text}">`;
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
        const textPreview = selectedCards.map(c => {
            if (c.type === 'emoji') {
                return `${c.value} ${c.text}`;
            }
            return c.text;
        }).join(' + ');
        
        floatingSentencePreview.textContent = textPreview;
    } else {
        floatingBottomBar.classList.add('d-none');
    }
}

// Sync figures list with public Google Drive JSON file
async function syncWithGoogleDrive(fileId, showFeedback = false) {
    if (!fileId) {
        if (showFeedback && syncStatusText) {
            syncStatusText.className = 'sync-status-text error';
            syncStatusText.textContent = 'Por favor, insira o ID do arquivo.';
        }
        return false;
    }

    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Sincronizando figuras... 🔄';
    }

    try {
        let url;
        if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
            url = fileId;
        } else {
            // Direct download URL for public Google Drive file
            url = `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro ao baixar arquivo (HTTP ${response.status})`);
        }

        const remoteCards = await response.json();
        
        if (!Array.isArray(remoteCards)) {
            throw new Error('O arquivo carregado não é uma lista JSON válida.');
        }

        // Retrieve previous remote cards to compare
        const prevRemoteCardsStr = localStorage.getItem('caa_remote_cards');
        let prevRemoteCards = [];
        if (prevRemoteCardsStr) {
            try {
                prevRemoteCards = JSON.parse(prevRemoteCardsStr);
            } catch (e) {
                console.error('Erro ao ler figuras salvas anteriores: ', e);
            }
        }

        // Compare cards lists
        const addedCards = remoteCards.filter(newCard => {
            return !prevRemoteCards.some(oldCard => oldCard.text === newCard.text);
        });

        const removedCards = prevRemoteCards.filter(oldCard => {
            return !remoteCards.some(newCard => newCard.text === oldCard.text);
        });

        // Save remote cards to storage
        localStorage.setItem('caa_remote_cards', JSON.stringify(remoteCards));
        localStorage.setItem('caa_sync_drive_id', fileId);

        // Merge remote cards with locally created custom cards
        const customLocalCards = cards.filter(c => !DEFAULT_CARDS.some(d => d.text === c.text));
        
        // Combine them
        const mergedCards = [...customLocalCards, ...remoteCards];
        
        cards = mergedCards;
        saveCardsToStorage();
        renderCards();

        // Trigger Changelog Modal if there are differences and it's not the first sync
        if (prevRemoteCards.length > 0 && (addedCards.length > 0 || removedCards.length > 0)) {
            showChangelogModal(addedCards, removedCards);
        }

        if (syncStatusText) {
            syncStatusText.className = 'sync-status-text success';
            syncStatusText.textContent = 'Sincronizado com sucesso! (Nuvem) ✅';
        }
        return true;
    } catch (error) {
        console.error('Erro na sincronização: ', error);
        if (syncStatusText) {
            syncStatusText.className = 'sync-status-text error';
            syncStatusText.textContent = 'Erro ao sincronizar. Verifique a internet e o ID. ❌';
        }
        if (showFeedback) {
            showCustomAlert('Falha na sincronização. Certifique-se de que o arquivo no Google Drive está compartilhado como "Qualquer pessoa com o link" (público) e o ID está correto.');
        }
        return false;
    }
}

// Wrapper function to fetch data correctly depending on protocol
async function fetchSyncData(url) {
    // If running from local files (file:// protocol), we must use JSONP to bypass CORS
    if (window.location.protocol === 'file:') {
        return await fetchJSONP(url);
    }

    // Otherwise, try standard fetch (cleaner and avoids tracking blockers on Netlify/Vercel)
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (e) {
        console.warn('Standard fetch failed, falling back to JSONP: ', e);
        return await fetchJSONP(url);
    }
}

// Helper function for JSONP fetch (to bypass CORS on file:// protocol)
function fetchJSONP(url, callbackName = 'callback_' + Math.round(new Date().getTime() * Math.random())) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        
        window[callbackName] = function(data) {
            resolve(data);
            cleanup();
        };

        script.onerror = function() {
            reject(new Error('Falha ao se conectar com o servidor do Google (CORS/Redirecionamento).'));
            cleanup();
        };

        const connector = url.indexOf('?') >= 0 ? '&' : '?';
        script.src = `${url}${connector}callback=${callbackName}`;
        
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
async function syncWithAppsScript(scriptUrl, showFeedback = false) {
    const urlToUse = scriptUrl || localStorage.getItem('caa_sync_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
    if (!urlToUse) return false;

    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Sincronizando com o Drive... 🔄';
    }

    try {
        // Use standard fetch or JSONP depending on how the app is hosted
        const remoteCards = await fetchSyncData(urlToUse);
        if (!Array.isArray(remoteCards)) {
            throw new Error('O arquivo retornado não é uma lista JSON válida.');
        }

        // Compare cards lists
        const prevCardsStr = localStorage.getItem('caa_custom_cards');
        let prevCards = [];
        if (prevCardsStr) {
            try { prevCards = JSON.parse(prevCardsStr); } catch (e) {}
        }

        // Compare length/contents to trigger changelog
        const addedCards = remoteCards.filter(newCard => !prevCards.some(oldCard => oldCard.text === newCard.text));
        const removedCards = prevCards.filter(oldCard => !remoteCards.some(newCard => newCard.text === oldCard.text));

        setAndCleanCards(remoteCards);
        saveCardsToStorage(false); // Save locally without triggering recursive upload
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
    } catch (error) {
        console.error('Erro na sincronização automática: ', error);
        if (syncStatusText) {
            syncStatusText.className = 'sync-status-text error';
            syncStatusText.textContent = 'Erro ao sincronizar com o Apps Script. ❌';
        }
        if (showFeedback) {
            showCustomAlert('Falha ao sincronizar com o Google Apps Script. Verifique a URL e a internet.');
        }
        return false;
    }
}

// Upload backup to Google Apps Script Web App (POST)
async function uploadBackupToCloud() {
    const scriptUrl = localStorage.getItem('caa_sync_apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
    const autoBackup = localStorage.getItem('caa_auto_backup') !== 'false';

    if (!scriptUrl || !autoBackup || !navigator.onLine) return;

    if (syncStatusText) {
        syncStatusText.className = 'sync-status-text loading';
        syncStatusText.textContent = 'Enviando backup para nuvem... 🔄';
    }

    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Apps Script web app redirect behavior
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cards)
        });

        if (syncStatusText) {
            syncStatusText.className = 'sync-status-text success';
            syncStatusText.textContent = 'Backup salvo na nuvem! ✅';
        }
    } catch (error) {
        console.error('Erro ao enviar backup: ', error);
        if (syncStatusText) {
            syncStatusText.className = 'sync-status-text error';
            syncStatusText.textContent = 'Falha no backup automático. ❌';
        }
    }
}

// Show popup explaining what changed in the cloud figures
function showChangelogModal(addedCards, removedCards) {
    if (!modalChangelog) return;

    // Populate added list
    if (addedCards.length > 0) {
        changelogAddedSection.classList.remove('d-none');
        changelogAddedList.innerHTML = addedCards.map(c => {
            const displayVal = c.type === 'emoji' ? `${c.value} ` : '';
            return `<li>${displayVal}${c.text}</li>`;
        }).join('');
    } else {
        changelogAddedSection.classList.add('d-none');
    }

    // Populate removed list
    if (removedCards.length > 0) {
        changelogRemovedSection.classList.remove('d-none');
        changelogRemovedList.innerHTML = removedCards.map(c => {
            const displayVal = c.type === 'emoji' ? `${c.value} ` : '';
            return `<li>${displayVal}${c.text}</li>`;
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
window.addEventListener('scroll', () => {
    updateFloatingBar();
});

// Speak text using Web Speech Synthesis API
function speakText(text) {
    if (!text) return;
    
    // Cancel any current speaking
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    // Choose a local PT-BR voice if available
    const voices = synth.getVoices();
    const ptVoice = voices.find(voice => voice.lang.toLowerCase().includes('pt-br') || voice.lang.toLowerCase().includes('pt_br'));
    if (ptVoice) {
        utterance.voice = ptVoice;
    }
    
    synth.speak(utterance);
}

// Handle Theme Change
function updateThemeIcon(theme) {
    const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

    btnToggleTheme.innerHTML = `${theme === 'dark' ? sunSvg : moonSvg} <span>Alternar Tema</span>`;
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('caa_theme', newTheme);
    updateThemeIcon(newTheme);
}

// Open category subchoice modal (abrir por cima)
function openSubChoiceModal(actionText, categoryId) {
    let subCards = [];
    
    if (categoryId === 'food') {
        subChoiceTitle.textContent = 'O que você quer comer?';
        subCards = cards.filter(c => c.category === 'food' && c.text !== 'Água' && c.text !== 'Suco');
    } else if (categoryId === 'drink') {
        subChoiceTitle.textContent = 'O que você quer beber?';
        subCards = cards.filter(c => c.category === 'food' && (c.text === 'Água' || c.text === 'Suco'));
    } else if (categoryId === 'person') {
        subChoiceTitle.textContent = 'Com quem você quer falar?';
        subCards = cards.filter(c => c.category === 'person');
    } else if (categoryId === 'place') {
        subChoiceTitle.textContent = 'Aonde você quer ir?';
        subCards = cards.filter(c => c.category === 'place');
    } else {
        subChoiceTitle.textContent = `Escolha um(a) ${actionText}`;
        subCards = cards.filter(c => c.category === categoryId);
    }

    if (subCards.length === 0) return;

    subChoiceGrid.innerHTML = subCards.map((card) => {
        let visualContent = '';
        if (card.type === 'emoji') {
            visualContent = `<div class="card-emoji">${card.value}</div>`;
        } else {
            visualContent = `<img src="${card.value}" alt="${card.text}">`;
        }

        const catObj = CATEGORIES.find(c => c.id === (card.category || 'custom'));
        const catClass = catObj ? catObj.class : 'cat-custom';

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
        searchInput.addEventListener('input', () => {
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
        btnClearSearch.addEventListener('click', () => {
            searchInput.value = '';
            btnClearSearch.classList.add('d-none');
            renderCards();
            searchInput.focus();
        });
    }

    // Card click (add to sentence and speak immediately)
    cardsGrid.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.aac-card');
        if (!cardEl) return;

        const text = cardEl.dataset.text;
        const index = cards.findIndex(c => c.text === text);
        
        if (index !== -1) {
            const clickedCard = cards[index];
            selectedCards.push(clickedCard);
            updateSentenceBuilder();
            speakText(clickedCard.text);

            // Automatic sub-choice modal if card has goToCategory defined (abrir por cima)
            if (clickedCard.goToCategory) {
                openSubChoiceModal(clickedCard.text, clickedCard.goToCategory);
            }
        }
    });

    // Sentence builder card click (click to remove)
    sentenceList.addEventListener('click', (e) => {
        const sentCard = e.target.closest('.sentence-card');
        if (!sentCard) return;
        
        const idx = parseInt(sentCard.dataset.idx, 10);
        selectedCards.splice(idx, 1);
        updateSentenceBuilder();
    });

    // Speak sentence
    btnSpeak.addEventListener('click', () => {
        if (selectedCards.length === 0) return;
        
        // Combine text of all selected cards
        const fullSentence = selectedCards.map(c => c.text).join(' ');
        speakText(fullSentence);
    });

    // Clear all
    btnClearAll.addEventListener('click', () => {
        selectedCards = [];
        updateSentenceBuilder();
    });

    // Theme toggle
    btnToggleTheme.addEventListener('click', toggleTheme);

    // Settings Modal controls
    btnSettings.addEventListener('click', () => {
        modalSettings.classList.add('open');
        renderManageCustomCards();
    });

    // Delete custom card event listener
    const customCardsList = document.getElementById('custom-cards-list');
    if (customCardsList) {
        customCardsList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-card');
            if (!deleteBtn) return;

            const cardText = deleteBtn.dataset.text;
            showCustomConfirm(`Deseja realmente excluir a figura "${cardText}"?`).then(confirmed => {
                if (confirmed) {
                    cards = cards.filter(c => c.text !== cardText);
                    saveCardsToStorage();
                    renderCards();
                    renderManageCustomCards();
                    showCustomAlert(`Figura "${cardText}" excluída com sucesso! 🗑️`);
                }
            });
        });
    }

    const closeSettingsModal = () => {
        modalSettings.classList.remove('open');
        formAddCard.reset();
        imagePreview.innerHTML = '<span>Nenhuma imagem selecionada</span>';
        uploadedImageBase64 = null;
        groupEmoji.classList.remove('d-none');
        groupUpload.classList.add('d-none');
    };

    btnCloseSettings.addEventListener('click', closeSettingsModal);

    // Close modal if clicking outside the card content
    modalSettings.addEventListener('click', (e) => {
        if (e.target === modalSettings) {
            closeSettingsModal();
        }
    });

    // Form inputs radio changes inside settings
    for (let radio of imageTypeRadios) {
        radio.addEventListener('change', (e) => {
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
    cardImageFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            uploadedImageBase64 = event.target.result;
            imagePreview.innerHTML = `<img src="${uploadedImageBase64}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    });

    // Auto-suggest emoji while typing card text
    if (cardTextInput && cardEmojiInput) {
        cardTextInput.addEventListener('input', () => {
            const text = cardTextInput.value;
            const fullNormalized = normalizeText(text);
            
            // 1. Match exato da frase inteira
            if (EMOJI_DICTIONARY[fullNormalized]) {
                cardEmojiInput.value = EMOJI_DICTIONARY[fullNormalized];
                return;
            }
            
            // 2. Match palavra por palavra (da direita para a esquerda)
            const words = text.split(/\s+/).map(normalizeText);
            for (let i = words.length - 1; i >= 0; i--) {
                const word = words[i];
                if (word && EMOJI_DICTIONARY[word]) {
                    cardEmojiInput.value = EMOJI_DICTIONARY[word];
                    break;
                }
            }
        });
    }

    // Add card submission inside settings
    formAddCard.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const text = document.getElementById('card-text').value.trim();
        const category = detectCategory(text);
        const imageType = document.querySelector('input[name="image-type"]:checked').value;
        
        let value = '';
        if (imageType === 'emoji') {
            value = document.getElementById('card-emoji').value.trim() || '✨';
        } else {
            if (!uploadedImageBase64) {
                showCustomAlert('Por favor, envie ou selecione uma imagem.');
                return;
            }
            value = uploadedImageBase64;
        }

        // Prepend custom card
        // Prepend custom card
        cards.unshift({ text, category, type: imageType, value });
        saveCardsToStorage();
        renderCards();
        showCustomAlert(`Figura "${text}" criada e salva com sucesso! 🎨`).then(() => {
            closeSettingsModal();
        });
    });

    // Reset default cards button inside settings
    btnResetCards.addEventListener('click', () => {
        showCustomConfirm('Deseja realmente apagar todos os cartões personalizados e restaurar o padrão original?').then(confirmed => {
            if (confirmed) {
                localStorage.removeItem('caa_custom_cards');
                localStorage.removeItem('caa_custom_categories');
                cards = [...DEFAULT_CARDS];
                renderCards();
                closeSettingsModal();
            }
        });
    });

    // Download full backup as JSON file
    if (btnDownloadBackup) {
        btnDownloadBackup.addEventListener('click', () => {
            if (cards.length === 0) {
                showCustomAlert('Nenhum cartão para exportar!');
                return;
            }
            const jsonStr = JSON.stringify(cards, null, 2);
            const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", url);
            downloadAnchor.setAttribute("download", "backup_comunicador_caa.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            URL.revokeObjectURL(url);
        });
    }

    // Trigger file input for importing backup
    if (btnImportBackupTrigger && inputImportBackup) {
        btnImportBackupTrigger.addEventListener('click', () => {
            inputImportBackup.click();
        });
    }

    // Handle importing the file
    if (inputImportBackup) {
        inputImportBackup.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedCards = JSON.parse(event.target.result);
                    
                    // Basic validation
                    if (!Array.isArray(importedCards)) {
                        throw new Error("O arquivo não contém uma lista válida de figuras.");
                    }
                    
                    const isValid = importedCards.every(card => {
                        return card && typeof card.text === 'string' && typeof card.type === 'string' && typeof card.value === 'string';
                    });

                    if (!isValid) {
                        throw new Error("Alguns cartões no arquivo estão inválidos ou corrompidos.");
                    }

                    showCustomConfirm(`Deseja importar os ${importedCards.length} cartões deste arquivo? Isso substituirá todas as figuras personalizadas configuradas neste dispositivo.`).then(confirmed => {
                        if (confirmed) {
                            setAndCleanCards(importedCards);
                            saveCardsToStorage();
                            renderCards();
                            showCustomAlert("Backup importado com sucesso!").then(() => {
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
        btnExportCards.addEventListener('click', () => {
            // Filter only custom cards (which are not part of the initial DEFAULT_CARDS)
            const customCardsOnly = cards.filter(card => {
                return !DEFAULT_CARDS.some(defaultCard => defaultCard.text === card.text);
            });

            if (customCardsOnly.length === 0) {
                showCustomAlert('Nenhum cartão personalizado criado para exportar!');
                return;
            }

            const jsonStr = JSON.stringify(customCardsOnly, null, 2);
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(jsonStr)
                    .then(() => {
                        showCustomAlert('Lista de cartões personalizados copiada com sucesso!\n\nAgora você só precisa colar (Ctrl+V ou "Colar" no celular) na conversa do WhatsApp ou e-mail e enviar para o desenvolvedor.');
                    })
                    .catch(err => {
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
        const exportTextarea = document.createElement('textarea');
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
    btnAddSubChoice.addEventListener('click', () => {
        modalSubChoice.classList.remove('open');
        modalSettings.classList.add('open');
        
        // Focus text input
        setTimeout(() => {
            document.getElementById('card-text').focus();
        }, 150);
    });

    // Sub-choice grid item click
    subChoiceGrid.addEventListener('click', (e) => {
        const cardEl = e.target.closest('.aac-card');
        if (!cardEl) return;

        const text = cardEl.dataset.text;
        const index = cards.findIndex(c => c.text === text);
        
        if (index !== -1) {
            const clickedCard = cards[index];
            selectedCards.push(clickedCard);
            updateSentenceBuilder();
            speakText(clickedCard.text);
            modalSubChoice.classList.remove('open');
        }
    });

    // Close sub-choice modal
    btnCloseSubChoice.addEventListener('click', () => {
        modalSubChoice.classList.remove('open');
    });

    modalSubChoice.addEventListener('click', (e) => {
        if (e.target === modalSubChoice) {
            modalSubChoice.classList.remove('open');
        }
    });

    // Floating bottom bar buttons
    if (btnSpeakFloat) {
        btnSpeakFloat.addEventListener('click', () => {
            if (selectedCards.length === 0) return;
            const fullSentence = selectedCards.map(c => c.text).join(' ');
            speakText(fullSentence);
        });
    }

    if (btnClearFloat) {
        btnClearFloat.addEventListener('click', () => {
            selectedCards = [];
            updateSentenceBuilder();
        });
    }

    // Google Drive & Apps Script Sync button
    if (btnSyncNow) {
        btnSyncNow.addEventListener('click', () => {
            const fileId = syncDriveIdInput.value.trim();
            const scriptUrl = syncAppsScriptUrlInput.value.trim();

            if (scriptUrl) {
                localStorage.setItem('caa_sync_apps_script_url', scriptUrl);
                syncWithAppsScript(scriptUrl, true);
            } else if (fileId) {
                localStorage.setItem('caa_sync_drive_id', fileId);
                syncWithGoogleDrive(fileId, true);
            } else {
                showCustomAlert('Por favor, insira uma URL de Apps Script ou ID do Google Drive para sincronizar.');
            }
        });
    }

    // Save Apps Script URL dynamically
    if (syncAppsScriptUrlInput) {
        syncAppsScriptUrlInput.addEventListener('input', () => {
            let val = syncAppsScriptUrlInput.value.trim();
            // Evita que o link seja colado duplicado
            if (val.includes('https://') && val.indexOf('https://') !== val.lastIndexOf('https://')) {
                val = val.substring(0, val.lastIndexOf('https://')).trim();
                syncAppsScriptUrlInput.value = val;
            }
            localStorage.setItem('caa_sync_apps_script_url', val);
        });
    }

    // Save Auto Backup setting dynamically
    if (checkAutoBackup) {
        checkAutoBackup.addEventListener('change', () => {
            localStorage.setItem('caa_auto_backup', checkAutoBackup.checked);
            if (checkAutoBackup.checked) {
                uploadBackupToCloud();
            }
        });
    }

    // Changelog Modal controls
    if (btnOkChangelog) {
        btnOkChangelog.addEventListener('click', () => {
            modalChangelog.classList.remove('open');
        });
    }

    if (btnCloseChangelog) {
        btnCloseChangelog.addEventListener('click', () => {
            modalChangelog.classList.remove('open');
        });
    }

    if (modalChangelog) {
        modalChangelog.addEventListener('click', (e) => {
            if (e.target === modalChangelog) {
                modalChangelog.classList.remove('open');
            }
        });
    }
}

// Ensure voice synth is ready on page load
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {};
}

// Launch application
window.addEventListener('DOMContentLoaded', init);
