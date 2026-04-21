/**
 * Game Configuration Constants
 */

export const CONFIG = {
  // Game Loop
  FPS: 60,
  TICK_RATE: 1000 / 60,

  // Target Settings
  TARGET: {
    MIN_RADIUS: 10,
    MAX_RADIUS: 40,
    DEFAULT_RADIUS: 25,
    SPAWN_INTERVAL: 1000, // ms
    MIN_SPAWN_INTERVAL: 400, // ms
    DECAY_RATE: 0.95, // how fast radius shrinks/difficulty scales
    SPEED_MULTIPLIER: 0.05,
    DISSIPATE_TIME: 1500, // ms before target disappears
  },

  // Game Modes
  MODES: {
    STATIC: 'static',
    DYNAMIC: 'dynamic',
    GRIDSHOT: 'gridshot',
  },

  // Particle Settings
  PARTICLES: {
    COUNT: 8,
    MIN_SIZE: 1,
    MAX_SIZE: 3,
    SPEED: 4,
    FRICTION: 0.95,
  },

  // Target Types
  TARGET_TYPES: {
    NORMAL: 'normal',
    ARMOR: 'armor',
    BONUS: 'bonus',
    BOMB: 'bomb',
    MICRO: 'micro',
  },

  // Target Probabilities (percent)
  PROBABILITIES: {
    ARMOR: 10,
    BONUS: 5,
    BOMB: 7,
    MICRO: 15,
  },

  // UI Colors
  COLORS: {
    PRIMARY: '#00f2ff',
    SECONDARY: '#7000ff',
    ACCENT_RED: '#ff3e3e',
    ACCENT_GREEN: '#39ff14',
    ACCENT_ARMOR: '#00ccff',
    ACCENT_MICRO: '#ff00ff',
    TARGET_FILL: 'rgba(0, 242, 255, 0.4)',
    TARGET_STROKE: '#00f2ff',
    TARGET_INNER: '#ffffff',
    PARTICLE: '#00ccff',
  },

  // Dynamic Audio
  AUDIO: {
    BASE_PITCH: 800,
    PITCH_STEP: 20, // Increase pitch by 20Hz per combo
    MAX_PITCH: 2000,
  },

  // Difficulty Scaling
  SCALING: {
    POINTS_PER_HIT: 100,
    INTERVAL_REDUCTION: 10,
    RADIUS_REDUCTION: 0.1,
    BONUS_TIME: 3, // Seconds gained from bonus target
  },

  // Persistence
  STORAGE_KEYS: {
    HIGH_SCORES: 'aimpulse_highscores',
    SETTINGS: 'aimpulse_settings'
  },

  // Combo System
  COMBO: {
    MAX_MULTIPLIER: 5,
    INCREMENT: 0.1, // multiplier increases by 0.1 per hit
  },

  // Default Player Settings
  SETTINGS: {
    SENSITIVITY: 1.0,
    RETICLE_SIZE: 15,
    RETICLE_COLOR: '#00f2ff',
    TARGET_COLOR: '#00f2ff',
    VOLUME: 0.5,
  }
};
