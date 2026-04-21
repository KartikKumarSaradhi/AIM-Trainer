/**
 * GameEngine.js
 * The main game loop and engine logic.
 */

import { InputManager } from './InputManager.js';
import { TargetManager } from '../systems/TargetManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { CONFIG } from '../constants.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.inputManager = new InputManager(canvas);
    this.scoreManager = new ScoreManager();
    this.targetManager = new TargetManager(canvas, this.scoreManager, (time) => {
        this.currentTime += time;
    }, (amount) => this.triggerShake(amount));

    this.isPaused = true;
    this.gameActive = false;
    this.sessionDuration = 30; // Default 30s
    this.currentTime = 0;
    this.countdownValue = 0;
    this.lastTickTime = 0;
    this.animationId = null;

    // Phase 3: Screen Shake
    this.shakeAmount = 0;
    this.shakeDecay = 0.9;

    this.init();
  }

  triggerShake(amount = 5) {
    this.shakeAmount = amount;
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Register click event
    this.inputManager.setClickHandler((x, y) => {
      if (this.gameActive) {
        this.targetManager.handlePlayerClick(x, y);
      }
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startGame(mode, duration) {
    this.sessionDuration = duration;
    this.currentTime = duration;
    this.targetManager.setMode(mode);
    this.targetManager.reset();
    this.scoreManager.reset();
    
    this.startCountdown();
  }

  startCountdown() {
    this.countdownValue = 3;
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    
    overlay.classList.remove('hidden');
    
    const count = () => {
        if (this.countdownValue > 0) {
            text.textContent = this.countdownValue;
            text.style.animation = 'none';
            text.offsetHeight; // trigger reflow
            text.style.animation = 'pulseGrow 0.5s ease-out';
            this.countdownValue--;
            setTimeout(count, 1000);
        } else {
            text.textContent = "GO!";
            setTimeout(() => {
                overlay.classList.add('hidden');
                this.beginSession();
            }, 500);
        }
    };
    count();
  }

  beginSession() {
    this.gameActive = true;
    this.isPaused = false;
    this.lastTickTime = performance.now();
    this.startLoop();
  }

  stopGame() {
    this.gameActive = false;
    this.isPaused = true;
    if (this.animationId) cancelAnimationFrame(this.animationId);

    // Release Pointer Lock
    if (document.pointerLockElement === this.canvas) {
        document.exitPointerLock();
    }

    // Show Results
    this.scoreManager.updateResults();
    setTimeout(() => {
        document.getElementById('results-overlay').classList.remove('hidden');
        document.getElementById('results-overlay').classList.add('active');
        document.getElementById('hud').classList.add('hidden');
    }, 500);
  }

  startLoop() {
    const loop = (time) => {
      if (this.isPaused) return;

      const delta = time - this.lastTickTime;
      this.lastTickTime = time;

      this.update(delta);
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  update(delta) {
    if (!this.gameActive) return;

    // Timer countdown
    this.currentTime -= delta / 1000;
    if (this.currentTime <= 0) {
      this.currentTime = 0;
      this.stopGame();
      return;
    }

    this.updateHUD();
    this.targetManager.update(delta);

    // Update screen shake
    if (this.shakeAmount > 0.1) {
      this.shakeAmount *= this.shakeDecay;
    } else {
      this.shakeAmount = 0;
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    
    // Apply Screen Shake
    if (this.shakeAmount > 0) {
      const sx = (Math.random() - 0.5) * this.shakeAmount;
      const sy = (Math.random() - 0.5) * this.shakeAmount;
      this.ctx.translate(sx, sy);
    }

    // Render targets
    this.targetManager.render(this.ctx);

    this.ctx.restore();
  }

  updateHUD() {
    const timerElement = document.getElementById('timer-val');
    if (timerElement) {
      const totalSeconds = Math.max(0, this.currentTime);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const ms = Math.floor((totalSeconds % 1) * 100);
      
      // MM:SS:CC format
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');
      const msStr = ms.toString().padStart(2, '0');
      
      timerElement.textContent = `${mStr}:${sStr}:${msStr}`;
    }
  }
}
