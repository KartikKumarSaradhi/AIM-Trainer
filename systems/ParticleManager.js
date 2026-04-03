import { Particle } from '../entities/Particle.js';
import { CONFIG } from '../constants.js';

class ScorePopup {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.opacity = 1;
        this.life = 1.0;
        this.vy = -2; // rise up
    }

    update() {
        this.y += this.vy;
        this.life -= 0.02;
        this.opacity = this.life;
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 20px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

export class ParticleManager {
    constructor() {
        this.particles = [];
        this.popups = [];
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < CONFIG.PARTICLES.COUNT; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    createPopup(x, y, text, color = '#fff') {
        this.popups.push(new ScorePopup(x, y, text, color));
    }

    update() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (!particle.update()) {
                this.particles.splice(i, 1);
            }
        }
        // Update popups
        for (let i = this.popups.length - 1; i >= 0; i--) {
            if (!this.popups[i].update()) {
                this.popups.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(p => p.render(ctx));
        this.popups.forEach(p => p.render(ctx));
    }

    clear() {
        this.particles = [];
        this.popups = [];
    }
}
