// This is our logger, so we allow console statements here
/* eslint-disable no-console */

export abstract class WithStepLogger {
    abstract name(): string;

    log(...args: unknown[]): void {
        console.log(`[build:${this.name()}]`, ...args);
    }

    error(...args: unknown[]): void {
        console.error(`[build:${this.name()}]`, ...args);
    }

    fatal(...args: unknown[]): never {
        this.error(...args);
        process.exit(1);
    }
}
