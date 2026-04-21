import { GameEngine } from './engine/GameEngine.js';
import { CONFIG } from './constants.js';
import { LeaderboardManager } from './systems/LeaderboardManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const engine = new GameEngine(canvas);
    const leaderboard = new LeaderboardManager();

    // DOM Elements
    const menuOverlay = document.getElementById('menu-overlay');
    const resultsOverlay = document.getElementById('results-overlay');
    const hud = document.getElementById('hud');

    // Buttons
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const diffBtns = document.querySelectorAll('.diff-btn');

    // Game Session Config
    let selectedMode = CONFIG.MODES.STATIC;
    let selectedDuration = 30;

    // Phase 2 & 3 Persistence
    let highScores = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.HIGH_SCORES) || '{}');
    let userSettings = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS) || JSON.stringify(CONFIG.SETTINGS));
    let lastUserName = localStorage.getItem('aimpulse_username') || '';

    if (lastUserName) document.getElementById('user-name').value = lastUserName;

    const updatePBDisplay = () => {
        const pbVal = document.getElementById('pb-val');
        const key = `${selectedMode}_${selectedDuration}`;
        pbVal.textContent = highScores[key] || 0;
    };

    updatePBDisplay();

    /**
     * Set up UI Event Listeners
     */

    // Mode Selection Buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMode = btn.dataset.mode;
            updatePBDisplay();
        });
    });

    // Duration Selection Buttons
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            diffBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDuration = parseInt(btn.dataset.time);
            updatePBDisplay();
        });
    });

    // SFX Toggle
    const sfxToggle = document.getElementById('sfx-toggle');
    sfxToggle.addEventListener('change', (e) => {
        engine.targetManager.audio.toggle(e.target.checked);
    });

    /**
     * Leaderboard UI Logic
     */
    const leaderboardOverlay = document.getElementById('leaderboard-overlay');
    const leaderboardBody = document.getElementById('leaderboard-body');

    const showLeaderboard = () => {
        leaderboardBody.innerHTML = '';
        const scores = leaderboard.getGlobalScores(selectedMode);
        
        // Add current user to leaderboard for display
        const userName = document.getElementById('user-name').value || 'YOU';
        scores.push({ name: userName, score: engine.scoreManager.score, accuracy: engine.scoreManager.accuracy, isCurrent: true });
        scores.sort((a, b) => b.score - a.score);

        scores.forEach((s, index) => {
            const row = document.createElement('tr');
            if (s.isCurrent) row.classList.add('current-user');
            row.innerHTML = `
                <td>#${index + 1}</td>
                <td>${s.name}</td>
                <td>${s.score}</td>
                <td>${s.accuracy}%</td>
            `;
            leaderboardBody.appendChild(row);
        });

        leaderboardOverlay.classList.remove('hidden');
        leaderboardOverlay.classList.add('active');
    };

    document.getElementById('view-leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
        leaderboardOverlay.classList.remove('active');
        leaderboardOverlay.classList.add('hidden');
    });

    /**
     * Settings Logic (Phase 3)
     */
    const settingsOverlay = document.getElementById('settings-overlay');
    const sensSlider = document.getElementById('sensitivity-slider');
    const reticleSlider = document.getElementById('reticle-size-slider');
    const reticleColorPicker = document.getElementById('reticle-color-picker');
    const targetColorPicker = document.getElementById('target-color-picker');
    const volumeSlider = document.getElementById('volume-slider');

    const applySettings = () => {
        engine.inputManager.updateSettings({
            sensitivity: userSettings.SENSITIVITY,
            reticleSize: userSettings.RETICLE_SIZE,
            reticleColor: userSettings.RETICLE_COLOR
        });
        engine.targetManager.audio.setVolume(userSettings.VOLUME);
        // Update visual constants
        CONFIG.COLORS.TARGET_STROKE = userSettings.TARGET_COLOR;
        CONFIG.COLORS.TARGET_FILL = userSettings.TARGET_COLOR + '66'; // add alpha
    };

    const loadSettingsUI = () => {
        sensSlider.value = userSettings.SENSITIVITY;
        reticleSlider.value = userSettings.RETICLE_SIZE;
        reticleColorPicker.value = userSettings.RETICLE_COLOR;
        targetColorPicker.value = userSettings.TARGET_COLOR;
        volumeSlider.value = userSettings.VOLUME;
        document.getElementById('sens-val').textContent = userSettings.SENSITIVITY;
        document.getElementById('reticle-val').textContent = `${userSettings.RETICLE_SIZE}px`;
        document.getElementById('volume-val').textContent = `${Math.round(userSettings.VOLUME * 100)}%`;
        applySettings();
    };

    document.getElementById('open-settings-btn').addEventListener('click', () => {
        loadSettingsUI();
        settingsOverlay.classList.remove('hidden');
        settingsOverlay.classList.add('active');
    });

    document.getElementById('close-settings-btn').addEventListener('click', () => {
        userSettings.SENSITIVITY = parseFloat(sensSlider.value);
        userSettings.RETICLE_SIZE = parseInt(reticleSlider.value);
        userSettings.RETICLE_COLOR = reticleColorPicker.value;
        userSettings.TARGET_COLOR = targetColorPicker.value;
        userSettings.VOLUME = parseFloat(volumeSlider.value);

        localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(userSettings));
        applySettings();
        
        settingsOverlay.classList.remove('active');
        settingsOverlay.classList.add('hidden');
    });

    // Live labels
    sensSlider.addEventListener('input', (e) => document.getElementById('sens-val').textContent = e.target.value);
    reticleSlider.addEventListener('input', (e) => document.getElementById('reticle-val').textContent = `${e.target.value}px`);
    volumeSlider.addEventListener('input', (e) => {
        document.getElementById('volume-val').textContent = `${Math.round(e.target.value * 100)}%`;
        engine.targetManager.audio.setVolume(parseFloat(e.target.value));
    });

    loadSettingsUI();

    /**
     * History Logic
     */
    const historyOverlay = document.getElementById('history-overlay');
    const historyBody = document.getElementById('history-body');
    const chartContainer = document.getElementById('history-chart-container');

    const showHistory = () => {
        const history = JSON.parse(localStorage.getItem('aimpulse_history') || '[]');
        historyBody.innerHTML = '';
        chartContainer.innerHTML = '';

        if (history.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No sessions recorded yet.</td></tr>';
        } else {
            // Populate Table (Reverse chronological)
            [...history].reverse().forEach(entry => {
                const row = document.createElement('tr');
                const date = new Date(entry.date).toLocaleDateString();
                row.innerHTML = `
                    <td>${date}</td>
                    <td>${entry.mode.toUpperCase()}</td>
                    <td>${entry.score}</td>
                    <td>${entry.accuracy}%</td>
                    <td>${entry.avgReaction}ms</td>
                `;
                historyBody.appendChild(row);
            });

            // Populate Simple Bar Chart (Chronological)
            const maxScore = Math.max(...history.map(h => h.score), 1);
            history.forEach(entry => {
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                const height = (entry.score / maxScore) * 100;
                bar.style.height = `${height}%`;
                bar.setAttribute('data-value', entry.score);
                chartContainer.appendChild(bar);
            });
        }

        historyOverlay.classList.remove('hidden');
        historyOverlay.classList.add('active');
    };

    document.getElementById('open-history-btn').addEventListener('click', showHistory);
    document.getElementById('close-history-btn').addEventListener('click', () => {
        historyOverlay.classList.remove('active');
        historyOverlay.classList.add('hidden');
    });

    // Start Session Action
    startBtn.addEventListener('click', () => {
        menuOverlay.classList.remove('active');
        menuOverlay.classList.add('hidden');
        hud.classList.remove('hidden');

        // Allow some time for animations
        setTimeout(() => {
            engine.startGame(selectedMode, selectedDuration);
        }, 300);
    });

    // Restart Session Action
    restartBtn.addEventListener('click', () => {
        resultsOverlay.classList.remove('active');
        resultsOverlay.classList.add('hidden');
        hud.classList.remove('hidden');

        // Small delay before starting again
        setTimeout(() => {
            engine.startGame(selectedMode, selectedDuration);
        }, 300);
    });

    /**
     * Phase 2 Score Saving
     */
    const saveScore = (score) => {
        const key = `${selectedMode}_${selectedDuration}`;
        if (!highScores[key] || score > highScores[key]) {
            highScores[key] = score;
            localStorage.setItem(CONFIG.STORAGE_KEYS.HIGH_SCORES, JSON.stringify(highScores));
            updatePBDisplay();
        }

        // Save session history for analytics
        const history = JSON.parse(localStorage.getItem('aimpulse_history') || '[]');
        const stats = engine.scoreManager.reactionTracker.getStats();
        history.push({
            date: new Date().toISOString(),
            mode: selectedMode,
            duration: selectedDuration,
            score: score,
            accuracy: engine.scoreManager.accuracy,
            avgReaction: stats.avg,
            bestReaction: stats.best,
            consistency: stats.consistency
        });
        // Keep last 50 sessions
        if (history.length > 50) history.shift();
        localStorage.setItem('aimpulse_history', JSON.stringify(history));
    };

    // Override stopGame to save score and update rank UI
    const originalStopGame = engine.stopGame.bind(engine);
    engine.stopGame = () => {
        const score = engine.scoreManager.score;
        saveScore(score);

        // Update Rank UI
        const rank = leaderboard.getRankTier(score);
        const rankName = document.getElementById('rank-name');
        if (rankName) {
            rankName.textContent = rank.name;
            rankName.className = rank.class;
        }

        originalStopGame();
    };

    // Override handlePlayerClick to show hitmarker
    const originalClickHandler = engine.targetManager.handlePlayerClick.bind(engine.targetManager);
    engine.targetManager.handlePlayerClick = (px, py) => {
        const initialHits = engine.scoreManager.hits;
        originalClickHandler(px, py);
        if (engine.scoreManager.hits > initialHits) {
            engine.inputManager.showHitmarker();
        }
    };

    // Save username when changed
    document.getElementById('user-name').addEventListener('input', (e) => {
        localStorage.setItem('aimpulse_username', e.target.value);
    });

    /**
     * Additional UX: Listen for ESC to return to menu
     */
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menuOverlay.classList.contains('active')) {
            engine.stopGame();
            resultsOverlay.classList.add('hidden');
            hud.classList.add('hidden');
            menuOverlay.classList.remove('hidden');
            menuOverlay.classList.add('active');
        }
    });

    // Handle cursor movement globally for UI interaction
    document.addEventListener('mousemove', (e) => {
        const cursor = document.getElementById('custom-cursor');
        if (cursor) {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
    });
});
