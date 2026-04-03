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

    // Customization (Phase 3)
    this.reticleSize = 20;
    this.reticleColor = '#00f2ff';
    this.hitmarkerOpacity = 0;
    
    this.init();
  }

  init() {
    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;

      // Update custom cursor
      if (this.cursorElement) {
        this.cursorElement.style.left = `${e.clientX}px`;
        this.cursorElement.style.top = `${e.clientY}px`;
      }
    });

    // Detect click press
    window.addEventListener('mousedown', () => {
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
