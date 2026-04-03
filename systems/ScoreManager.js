import { ReactionTimeTracker } from '../analytics/ReactionTimeTracker.js';
import { CONFIG } from '../constants.js';

export class ScoreManager {
  constructor() {
    this.reactionTracker = new ReactionTimeTracker();
    this.reset();
  }

  reset() {
    this.score = 0;
    this.hits = 0;
    this.misses = 0;
    this.accuracy = 100;
    this.combo = 0;
    this.multiplier = 1.0;
    this.reactionTracker.reset();

    // HUD Elements
    this.scoreVal = document.getElementById('score-val');
    this.accuracyVal = document.getElementById('accuracy-val');
    this.comboVal = document.getElementById('combo-val'); // New HUD element for phase 3
    this.finalScore = document.getElementById('final-score');
    this.finalAccuracy = document.getElementById('final-accuracy');
    this.avgReaction = document.getElementById('avg-reaction');
    this.hitsMissesDisplay = document.getElementById('hits-misses');

    this.updateHUD();
  }

  recordHit(reactionTime) {
    this.hits++;
    this.combo++;
    
    // Increase multiplier (max 5x)
    if (this.multiplier < CONFIG.COMBO.MAX_MULTIPLIER) {
      this.multiplier += CONFIG.COMBO.INCREMENT;
    }

    this.score += Math.round(CONFIG.SCALING.POINTS_PER_HIT * this.multiplier);
    this.reactionTracker.record(reactionTime);
    this.calculateAccuracy();
    this.updateHUD();
  }

  recordMiss() {
    this.misses++;
    this.combo = 0;
    this.multiplier = 1.0;
    this.calculateAccuracy();
    this.updateHUD();
  }

  calculateAccuracy() {
    const totalClicks = this.hits + this.misses;
    if (totalClicks === 0) {
      this.accuracy = 100;
    } else {
      this.accuracy = Math.round((this.hits / totalClicks) * 100);
    }
  }

  getAverageReactionTime() {
    return this.reactionTracker.getAverage();
  }

  updateHUD() {
    try {
        if (this.scoreVal) this.scoreVal.textContent = Math.floor(this.score || 0);
        if (this.accuracyVal) this.accuracyVal.textContent = `${this.accuracy || 100}%`;
        if (this.comboVal) {
            this.comboVal.textContent = `${this.combo || 0}x`;
            this.comboVal.style.color = (this.combo > 10) ? CONFIG.COLORS.ACCENT_GREEN : 'white';
        }
    } catch (err) {
        console.warn("HUD Update Error:", err);
    }
  }

  updateResults() {
    try {
        const avgReaction = this.getAverageReactionTime();
        if (this.finalScore) this.finalScore.textContent = this.score;
        if (this.finalAccuracy) this.finalAccuracy.textContent = `${this.accuracy}%`;
        if (this.avgReaction) this.avgReaction.textContent = `${avgReaction}ms`;
        if (this.hitsMissesDisplay) this.hitsMissesDisplay.textContent = `${this.hits} / ${this.misses}`;
    } catch (err) {
        console.warn("Results Update Error:", err);
    }
  }
}
