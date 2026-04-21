/**
 * LeaderboardManager.js
 * Handles local and global (mock) score tracking and ranking levels.
 */

export class LeaderboardManager {
    constructor() {
        this.mockGlobalScores = [
            { name: 'Shroud', score: 12500, accuracy: 98, mode: 'static' },
            { name: 'TenZ', score: 11800, accuracy: 99, mode: 'gridshot' },
            { name: 'AimGod', score: 10500, accuracy: 95, mode: 'static' },
            { name: 'CasualPlayer', score: 4500, accuracy: 75, mode: 'static' },
            { name: 'NoviceAim', score: 2100, accuracy: 60, mode: 'dynamic' }
        ];
    }

    /**
     * Get the rank name based on score
     */
    getRankTier(score) {
        if (score >= 15000) return { name: 'ASCENDANT', class: 'rank-diamond' };
        if (score >= 10000) return { name: 'DIAMOND', class: 'rank-diamond' };
        if (score >= 7500) return { name: 'PLATINUM', class: 'rank-platinum' };
        if (score >= 5000) return { name: 'GOLD', class: 'rank-gold' };
        if (score >= 2500) return { name: 'SILVER', class: 'rank-silver' };
        return { name: 'BRONZE', class: 'rank-bronze' };
    }

    /**
     * In a real app, this would be:
     * async fetchGlobalScores() { return await fetch('/api/scores'); }
     */
    getGlobalScores(mode) {
        // Filter by mode and sort by score
        return [...this.mockGlobalScores]
            .filter(s => s.mode === mode)
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Logic to "submit" a score globally
     */
    submitScore(name, score, accuracy, mode) {
        console.log(`Submitting score for ${name}: ${score} in ${mode}`);
        // In real app: fetch('/api/submit', { method: 'POST', body: ... })
        this.mockGlobalScores.push({ name, score, accuracy, mode });
    }
}
