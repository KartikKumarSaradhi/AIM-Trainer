/**
 * InputManager.js
 * Tracks mouse position, clicks, and manages the custom cursor overlay.
 */

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.mousePosition = { x: 0, y: 0 };
    this.isClicking = false;
    this.cursorElement = document.getElementById('custom-cursor');
    this.onClick = null;

    // Customization
    this.reticleSize = 20;
    this.reticleColor = '#00f2ff';
    this.sensitivity = 1.0;
    this.hitmarkerOpacity = 0;
    this.usePointerLock = true; // Phase 2: Use Pointer Lock for true sensitivity

    this.init();
  }

  init() {
    // Pointer Lock Change Listener
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        console.log('Pointer Lock Enabled');
      } else {
        console.log('Pointer Lock Disabled');
      }
    });

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        // Pointer Lock movement
        this.mousePosition.x += e.movementX * this.sensitivity;
        this.mousePosition.y += e.movementY * this.sensitivity;

        // Clamp to canvas bounds
        this.mousePosition.x = Math.max(0, Math.min(this.canvas.width, this.mousePosition.x));
        this.mousePosition.y = Math.max(0, Math.min(this.canvas.height, this.mousePosition.y));
      } else {
        // Standard movement (for menus/pre-start)
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
      }

      // Update custom cursor
      if (this.cursorElement) {
        this.cursorElement.style.left = `${this.mousePosition.x}px`;
        this.cursorElement.style.top = `${this.mousePosition.y}px`;
      }
    });

    // Detect click press
    window.addEventListener('mousedown', (e) => {
      // Request Pointer Lock on first click if in game
      if (this.usePointerLock && document.pointerLockElement !== this.canvas && e.target === this.canvas) {
        this.canvas.requestPointerLock();
      }

      this.isClicking = true;
      if (this.cursorElement) this.cursorElement.classList.add('clicking');

      if (this.onClick) {
        // Pass click coordinate to engine
        this.onClick(this.mousePosition.x, this.mousePosition.y);
      }
    });

    // Detect click release
    window.addEventListener('mouseup', () => {
      this.isClicking = false;
      if (this.cursorElement) this.cursorElement.classList.remove('clicking');
    });
  }

  getMousePosition() {
    // Relative to canvas if needed, otherwise clientX is fine if canvas is full screen
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: this.mousePosition.x - rect.left,
      y: this.mousePosition.y - rect.top
    };
  }

  setClickHandler(callback) {
    this.onClick = callback;
  }

  updateSettings(settings) {
    if (settings.sensitivity) {
        this.sensitivity = settings.sensitivity;
    }
    if (settings.reticleSize) {
        this.reticleSize = settings.reticleSize;
        this.cursorElement.style.width = `${this.reticleSize}px`;
        this.cursorElement.style.height = `${this.reticleSize}px`;
    }
    if (settings.reticleColor) {
        this.reticleColor = settings.reticleColor;
        this.cursorElement.style.borderColor = this.reticleColor;
    }
  }

  showHitmarker() {
    this.hitmarkerOpacity = 1.0;
    this.cursorElement.classList.add('hit');
    
    setTimeout(() => {
        this.cursorElement.classList.remove('hit');
    }, 150);
  }
}
