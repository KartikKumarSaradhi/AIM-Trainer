/**
 * AudioManager.js
 * Handles procedural sound effects using the Web Audio API.
 * No external audio files required!
 */

import { CONFIG } from '../constants.js';

export class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.5;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    playHit(combo = 0) {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Pitch gets higher with combo
        const frequency = Math.min(
            CONFIG.AUDIO.BASE_PITCH + (combo * CONFIG.AUDIO.PITCH_STEP),
            CONFIG.AUDIO.MAX_PITCH
        );

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playArmorHit() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playMiss() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1 * this.volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle(state) {
        this.enabled = state === undefined ? !this.enabled : state;
    }
}
