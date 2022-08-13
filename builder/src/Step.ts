export interface RunConfig {
    targetDir: string;
    dataDir: string;
    rootDir: string;
    publicDir: string;
}

export interface Step {
    name(): string;
    canRun(): boolean;
    run(runConfig: RunConfig): Promise<void>;
}
