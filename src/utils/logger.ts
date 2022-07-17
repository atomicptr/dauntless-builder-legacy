export enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}

const MAX_LOCAL_STORAGE_LOGS = 500;
const LOCAL_STORAGE_KEY = "logs";

export class Logger {
    private logLevel: LogLevel = LogLevel.Info;

    private print(level: LogLevel, message: string, data: object = {}) {
        const logLevelStr = Logger.prefixByLevel(level);
        const logFunc = Logger.logFunctionByLevel(level);

        const logMessage = `[${logLevelStr}] ${message}`;

        Logger.storeLog(level, logMessage, data);

        if (this.logLevel > level) {
            return;
        }

        if (Object.keys(data).length > 0) {
            logFunc(logMessage, data);
        } else {
            logFunc(logMessage);
        }
    }

    public setLogLevel(level: LogLevel) {
        this.logLevel = level;
    }

    public debug(message: string, data: object = {}) {
        this.print(LogLevel.Debug, message, data);
    }

    public info(message: string, data: object = {}) {
        this.print(LogLevel.Info, message, data);
    }

    public warn(message: string, data: object = {}) {
        this.print(LogLevel.Warn, message, data);
    }

    public error(message: string, data: object = {}) {
        this.print(LogLevel.Error, message, data);
    }

    public timer(label: string) {
        if (this.logLevel > LogLevel.Debug) {
            return;
        }

        /*eslint-disable*/
        console.time(label);
        /*eslint-enable*/
    }

    public timerEnd(label: string) {
        if (this.logLevel > LogLevel.Debug) {
            return;
        }

        /*eslint-disable*/
        console.timeEnd(label);
        /*eslint-enable*/
    }

    private static logFunctionByLevel(level: LogLevel): (...data: unknown[]) => void {
        /*eslint-disable*/
        // we do not allow usage of console commands in the project except for this function
        switch (level) {
            case LogLevel.Trace:
                return (...data: unknown[]) => {
                    console.groupCollapsed(...data);
                    console.trace();
                    console.groupEnd();
                };
            case LogLevel.Debug:
            case LogLevel.Info:
                return console.info;
            case LogLevel.Warn:
                return console.warn;
            case LogLevel.Error:
                return console.error;
        }
        return console.log;
        /*eslint-enable*/
    }

    private static prefixByLevel(level: LogLevel): string {
        switch (level) {
            case LogLevel.Trace:
                return "TRACE";
            case LogLevel.Debug:
                return "DEBUG";
            case LogLevel.Info:
                return "INFO";
            case LogLevel.Warn:
                return "WARN";
            case LogLevel.Error:
                return "ERROR";
        }
        return "???";
    }

    private static storeLog(level: LogLevel, message: string, data: object) {
        const logs = Logger.data();

        while (logs.length >= MAX_LOCAL_STORAGE_LOGS) {
            logs.shift();
        }

        const timestamp = Date.now();

        logs.push({
            data,
            level,
            message,
            timestamp,
        });

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    }

    public static data() {
        return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "[]");
    }
}

const log = new Logger();
export default log;
