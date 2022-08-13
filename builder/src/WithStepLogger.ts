// This is our logger, so we allow console statements here
/* eslint-disable no-console */

export abstract class WithStepLogger {
    abstract name(): string;

    log(...args: unknown[]) {
        console.log(`[build:${this.name()}]`, ...args);
    }

    error(...args: unknown[]) {
        console.error(`[build:${this.name()}]`, ...args);
    }

    fatal(...args: unknown[]) {
        this.error(...args);
        process.exit(1);
    }
}
