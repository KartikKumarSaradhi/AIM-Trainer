import { Target } from '../entities/Target.js';
import { CONFIG } from '../constants.js';
import { ParticleManager } from './ParticleManager.js';
import { AudioManager } from '../engine/AudioManager.js';

export class TargetManager {
  constructor(canvas, scoreManager, timeBonusCallback, shakeCallback) {
    this.canvas = canvas;
    this.scoreManager = scoreManager;
    this.timeBonusCallback = timeBonusCallback;
    this.shakeCallback = shakeCallback;
    this.particles = new ParticleManager();
    this.audio = new AudioManager();
    this.targets = [];
    this.lastSpawnTime = 0;
    this.spawnInterval = CONFIG.TARGET.SPAWN_INTERVAL;
    this.currentRadius = CONFIG.TARGET.DEFAULT_RADIUS;
    this.mode = CONFIG.MODES.STATIC;

    this.init();
  }

  init() {
    this.reset();
  }

  reset() {
    this.targets = [];
    this.particles.clear();
    this.lastSpawnTime = Date.now();
    this.spawnInterval = CONFIG.TARGET.SPAWN_INTERVAL;
    this.currentRadius = CONFIG.TARGET.DEFAULT_RADIUS;

    // Gridshot starts with 3 targets
    if (this.mode === CONFIG.MODES.GRIDSHOT) {
      for(let i=0; i<3; i++) this.spawnTarget();
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  update(delta) {
    const now = Date.now();

    // Normal spawning (non-gridshot)
    if (this.mode !== CONFIG.MODES.GRIDSHOT) {
      if (now - this.lastSpawnTime > this.spawnInterval) {
        this.spawnTarget();
        this.lastSpawnTime = now;
      }
    }

    // Update particles
    this.particles.update();

    // Update existing targets
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      target.update(delta, this.canvas.width, this.canvas.height);

      // If target is dead (lifetime ended), treat as a miss
      if (target.isDead && !target.isHit) {
        this.scoreManager.recordMiss();
        if (this.audio) this.audio.playMiss();
        if (this.shakeCallback) this.shakeCallback(10); // Bigger shake for time-out miss
        this.targets.splice(i, 1);
        
        // Replace target in gridshot
        if (this.mode === CONFIG.MODES.GRIDSHOT) this.spawnTarget();
      } else if (target.isDead) { // Is just dead after hit animation
        this.targets.splice(i, 1);
      }
    }
  }

  render(ctx) {
    this.particles.render(ctx);
    this.targets.forEach(t => t.render(ctx));
  }

  spawnTarget() {
    let marginX = this.currentRadius + 40;
    let marginY = this.currentRadius + 40;
    let width = this.canvas.width - 2 * marginX;
    let height = this.canvas.height - 2 * marginY;
    let offsetX = marginX;
    let offsetY = marginY;

    // Gridshot targets should be more centralized
    if (this.mode === CONFIG.MODES.GRIDSHOT) {
      const gridWidth = this.canvas.width * 0.6;
      const gridHeight = this.canvas.height * 0.6;
      width = gridWidth;
      height = gridHeight;
      offsetX = (this.canvas.width - gridWidth) / 2;
      offsetY = (this.canvas.height - gridHeight) / 2;
    }

    const x = Math.random() * width + offsetX;
    const y = Math.random() * height + offsetY;

    // Pick a random target type
    let type = CONFIG.TARGET_TYPES.NORMAL;
    const rand = Math.random() * 100;
    if (rand < CONFIG.PROBABILITIES.BONUS) {
        type = CONFIG.TARGET_TYPES.BONUS;
    } else if (rand < CONFIG.PROBABILITIES.BONUS + CONFIG.PROBABILITIES.BOMB) {
        type = CONFIG.TARGET_TYPES.BOMB;
    } else if (rand < CONFIG.PROBABILITIES.BONUS + CONFIG.PROBABILITIES.BOMB + CONFIG.PROBABILITIES.ARMOR) {
        type = CONFIG.TARGET_TYPES.ARMOR;
    } else if (rand < CONFIG.PROBABILITIES.BONUS + CONFIG.PROBABILITIES.BOMB + CONFIG.PROBABILITIES.ARMOR + CONFIG.PROBABILITIES.MICRO) {
        type = CONFIG.TARGET_TYPES.MICRO;
    }

    const isDynamic = this.mode === CONFIG.MODES.DYNAMIC;
    const newTarget = new Target(x, y, this.currentRadius, isDynamic, type);
    this.targets.push(newTarget);
  }

  handlePlayerClick(px, py) {
    try {
        this.audio.init();

        let hit = false;
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            if (target.isPointInside(px, py)) {
                const result = target.onHit();
                const reactionTime = result.reactionTime || (Date.now() - target.spawnTime);
                hit = true;

                if (result.destroyed) {
                    this.audio.playHit(this.scoreManager.combo);
                    if (this.shakeCallback) this.shakeCallback(4); // Small shake for hit
                    this.particles.createExplosion(target.x, target.y, CONFIG.COLORS.TARGET_STROKE);
                    this.handleTargetEffect(target, reactionTime);
                    this.adjustDifficulty();
                    if (this.mode === CONFIG.MODES.GRIDSHOT) this.spawnTarget();
                } else {
                    // Non-lethal armor hit still counts towards accuracy but uses distinctive sound
                    this.playArmorFeedback(target);
                }
                break;
            }
        }

        if (!hit) {
            this.scoreManager.recordMiss();
            this.audio.playMiss();
            if (this.shakeCallback) this.shakeCallback(8); // Medium shake for click miss
        }
    } catch (err) {
        console.error("Click Handling Error:", err);
    }
  }

  playArmorFeedback(target) {
      if (this.audio) this.audio.playArmorHit();
      if (this.particles) this.particles.createPopup(target.x, target.y, "SHIELD", CONFIG.COLORS.ACCENT_ARMOR);
  }

  handleTargetEffect(target, reactionTime) {
    const sm = this.scoreManager;
    let popupColor = '#fff';
    let popupText = "";

    switch(target.type) {
        case CONFIG.TARGET_TYPES.BONUS:
            sm.recordHit(reactionTime);
            if (this.timeBonusCallback) this.timeBonusCallback(CONFIG.SCALING.BONUS_TIME);
            popupText = `+${CONFIG.SCALING.BONUS_TIME}s TIME`;
            popupColor = CONFIG.COLORS.ACCENT_GREEN;
            break;
        case CONFIG.TARGET_TYPES.BOMB:
            sm.recordMiss();
            popupText = "-PENALTY-";
            popupColor = CONFIG.COLORS.ACCENT_RED;
            break;
        case CONFIG.TARGET_TYPES.ARMOR:
            sm.recordHit(reactionTime);
            popupText = "+SCORE";
            popupColor = CONFIG.COLORS.ACCENT_ARMOR;
            break;
        case CONFIG.TARGET_TYPES.MICRO:
            sm.recordHit(reactionTime);
            popupText = "PRECISION!";
            popupColor = CONFIG.COLORS.ACCENT_MICRO;
            break;
        default:
            sm.recordHit(reactionTime);
            const pts = Math.round(CONFIG.SCALING.POINTS_PER_HIT * (sm.multiplier || 1));
            popupText = `+${pts}`;
    }

    if (popupText && this.particles) {
        this.particles.createPopup(target.x, target.y, popupText, popupColor);
    }
  }

  adjustDifficulty() {
    // Faster spawning
    if (this.spawnInterval > CONFIG.TARGET.MIN_SPAWN_INTERVAL) {
      this.spawnInterval -= CONFIG.SCALING.INTERVAL_REDUCTION;
    }

    // Shrinking radius
    if (this.currentRadius > CONFIG.TARGET.MIN_RADIUS) {
      this.currentRadius -= CONFIG.SCALING.RADIUS_REDUCTION;
    }
  }
}
