export interface RunConfig {
    targetDir: string;
    dataDir: string;
    rootDir: string;
    publicDir: string;
    i18nBaseDir: string;
}

export interface Step {
    name(): string;
    canRun(verbose: boolean): boolean;
    isAllowedToFail(): boolean;
    run(runConfig: RunConfig): Promise<void>;
}
