/**
 * Particle.js
 * Represents a single floating particle in the FX system.
 */

import { CONFIG } from '../constants.js';

export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color || CONFIG.COLORS.PARTICLE;
        this.size = Math.random() * (CONFIG.PARTICLES.MAX_SIZE - CONFIG.PARTICLES.MIN_SIZE) + CONFIG.PARTICLES.MIN_SIZE;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * CONFIG.PARTICLES.SPEED;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.life = 1.0; // Decay from 1 to 0
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= CONFIG.PARTICLES.FRICTION;
        this.vy *= CONFIG.PARTICLES.FRICTION;
        this.life -= this.decay;
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
