# AimPulse - Premium Aim Trainer

AimPulse is a high-performance FPS aim trainer built with JavaScript and HTML5 Canvas. It features smooth 60 FPS gameplay, dynamic difficulty scaling, and real-time performance analytics.

## Features

- **Smooth 60 FPS Game Loop**: Optimized rendering using `requestAnimationFrame`.
- **Accurate Hit Detection**: Real-time collision detection for pixel-perfect aim training.
- **Dynamic Difficulty**: Targets get smaller and spawn faster as you improve.
- **Two Game Modes**:
  - **Static**: Stationary targets for precision training.
  - **Dynamic**: Moving targets for tracking practice.
- **Real-Time HUD**: Track your score, timer, and accuracy during the session.
- **Session Results**: Review your hits, misses, accuracy, and average reaction time.
- **Premium Design**: Modern dark UI with glassmorphism and smooth animations.

## Folder Structure

```text
/
├── index.html          # Application entry point & UI structure
├── index.css           # Premium styles & themes
├── main.js             # Entry logic & UI handling
├── constants.js        # Game configuration
├── engine/
│   ├── GameEngine.js   # Core game loop & state management
│   └── InputManager.js # Input tracking & custom cursor
├── entities/
│   └── Target.js       # Target object & animations
├── systems/
│   ├── TargetManager.js# Spawning & physics
│   └── ScoreManager.js # Stats & HUD logic
└── analytics/         # (Future expansions)
```

## How to Run Locally

Since the project uses **ES6 Modules**, it must be served through a web server (it will not work if opened directly as a file).

### Option 1: Using VS Code (Recommended)
1. Install the **Live Server** extension.
2. Right-click `index.html` and select **Open with Live Server**.

### Option 2: Using Node.js
If you have Node.js installed, run one of the following in this directory:

```bash
npx serve .
```
OR
```bash
npx live-server .
```

### Option 3: Python
```bash
python -m http.server 8000
```

Open your browser at `http://localhost:8000`.

## Controls

- **Left Click**: Shoot targets.
- **Escape**: Return to Main Menu.
