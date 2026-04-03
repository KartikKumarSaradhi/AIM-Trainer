import { CONFIG } from '../constants.js';

export class Target {
  constructor(x, y, radius, isDynamic = false, type = CONFIG.TARGET_TYPES.NORMAL) {
    this.x = x;
    this.y = y;
    this.initialRadius = radius;
    this.radius = radius;
    this.isDynamic = isDynamic;
    this.type = type;

    // Armor needs 2 hits
    this.health = (type === CONFIG.TARGET_TYPES.ARMOR) ? 2 : 1;

    // Movement properties for dynamic mode
    this.dx = (Math.random() - 0.5) * 4; // Velocity components
    this.dy = (Math.random() - 0.5) * 4;

    this.spawnTime = Date.now();
    this.lifetime = CONFIG.TARGET.DISSIPATE_TIME;
    this.isDead = false;
    this.isHit = false;

    // Animation state
    this.opacity = 1.0;
    this.scale = 0.5; // Start small for pop-in effect
  }

  update(delta, canvasWidth, canvasHeight) {
    // Pop-in effect
    if (this.scale < 1.0) {
      this.scale += 0.05;
      if (this.scale > 1.0) this.scale = 1.0;
    }

    // Dynamic movement (bouncing)
    if (this.isDynamic) {
      this.x += this.dx;
      this.y += this.dy;

      // Bounce off walls
      if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
        this.dx *= -1;
      }
      if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
        this.dy *= -1;
      }
    }

    // Check if lifetime is over
    const elapsed = Date.now() - this.spawnTime;
    if (elapsed > this.lifetime && !this.isHit) {
      this.isDead = true;
    }

    // Fading out animation if hit
    if (this.isHit) {
      this.opacity -= 0.1;
      this.radius += 2; // Expand slightly for feedback
      if (this.opacity <= 0) this.isDead = true;
    }
  }

  render(ctx) {
    if (this.isDead) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // Style based on type
    let strokeColor = CONFIG.COLORS.TARGET_STROKE;
    let fillColor = CONFIG.COLORS.TARGET_FILL;

    if (this.type === CONFIG.TARGET_TYPES.BOMB) {
        strokeColor = CONFIG.COLORS.ACCENT_RED;
        fillColor = 'rgba(255, 62, 62, 0.3)';
    } else if (this.type === CONFIG.TARGET_TYPES.BONUS) {
        strokeColor = CONFIG.COLORS.ACCENT_GREEN;
        fillColor = 'rgba(57, 255, 20, 0.3)';
    } else if (this.type === CONFIG.TARGET_TYPES.ARMOR) {
        strokeColor = CONFIG.COLORS.ACCENT_ARMOR;
        fillColor = 'rgba(0, 204, 255, 0.3)';
    }

    // Outer ring
    ctx.lineWidth = (this.type === CONFIG.TARGET_TYPES.ARMOR && this.health > 1) ? 6 : 2;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary ring for Armor
    if (this.type === CONFIG.TARGET_TYPES.ARMOR && this.health > 1) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius - 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Main circle fill
    ctx.fillStyle = fillColor;
    ctx.shadowBlur = (this.type === CONFIG.TARGET_TYPES.BONUS) ? 20 : 10;
    ctx.shadowColor = strokeColor;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
    ctx.fill();

    // Bomb icon or Warning cross
    if (this.type === CONFIG.TARGET_TYPES.BOMB) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, 8);
    } else {
        // Inner glowing dot
        ctx.fillStyle = CONFIG.COLORS.TARGET_INNER;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Collision detection
   */
  isPointInside(px, py) {
    if (this.isHit || this.isDead) return false;
    const distance = Math.sqrt((px - this.x) ** 2 + (py - this.y) ** 2);
    return distance <= this.radius;
  }

  onHit() {
    this.health--;
    if (this.health <= 0) {
        this.isHit = true;
        return { reactionTime: Date.now() - this.spawnTime, destroyed: true };
    }
    // Just a visual flash for non-lethal hits
    this.scale = 1.3;
    return { reactionTime: Date.now() - this.spawnTime, destroyed: false };
  }
}
