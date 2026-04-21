/**
 * ReactionTimeTracker.js
 * Basic reaction time tracking and averaging.
 */

export class ReactionTimeTracker {
    constructor() {
        this.reactionTimes = [];
    }

    record(timeMs) {
        this.reactionTimes.push(timeMs);
    }

    getAverage() {
        if (this.reactionTimes.length === 0) return 0;
        const total = this.reactionTimes.reduce((acc, curr) => acc + curr, 0);
        return Math.round(total / this.reactionTimes.length);
    }

    getBest() {
        if (this.reactionTimes.length === 0) return 0;
        return Math.min(...this.reactionTimes);
    }

    /**
     * Consistency is measured by Standard Deviation.
     * Lower is better (more consistent).
     */
    getConsistency() {
        if (this.reactionTimes.length < 2) return 0;
        const avg = this.getAverage();
        const squareDiffs = this.reactionTimes.map(time => {
            const diff = time - avg;
            return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        return Math.round(Math.sqrt(avgSquareDiff));
    }

    getStats() {
        return {
            avg: this.getAverage(),
            best: this.getBest(),
            consistency: this.getConsistency(),
            count: this.reactionTimes.length
        };
    }

    reset() {
        this.reactionTimes = [];
    }
}
