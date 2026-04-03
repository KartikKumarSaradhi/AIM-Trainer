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

    reset() {
        this.reactionTimes = [];
    }
}
