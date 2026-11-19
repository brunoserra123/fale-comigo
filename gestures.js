import {profileKey} from './storage.js';
export function setupGestures() {
    let audio;
    document.addEventListener('click',event => {
        if (!event.target.closest('.aac-card,#core-words button,#pinned-replies button,.sentence-card')) return;
        if (localStorage.getItem(profileKey('haptics')) === 'true' && navigator.vibrate) navigator.vibrate(18);
        if (localStorage.getItem(profileKey('click_sound')) !== 'true') return;
        const Engine = window.AudioContext || window.webkitAudioContext;
        if (!Engine) return;
        try {
            audio = audio || new Engine();
            audio.resume().catch(() => {});
            const oscillator = audio.createOscillator(), gain = audio.createGain();
            oscillator.frequency.value = 620;
            gain.gain.setValueAtTime(.035,audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime + .045);
            oscillator.connect(gain); gain.connect(audio.destination);
            oscillator.start(); oscillator.stop(audio.currentTime + .05);
        } catch (_) { /* Speech remains available if feedback is unsupported. */ }
    });
}
