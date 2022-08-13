export interface RunConfig {
    targetDir: string;
    dataDir: string;
    rootDir: string;
    publicDir: string;
    translationDir: string;
}

export interface Step {
    name(): string;
    canRun(verbose: boolean): boolean;
    isAllowedToFail(): boolean;
    run(runConfig: RunConfig): Promise<void>;
}
