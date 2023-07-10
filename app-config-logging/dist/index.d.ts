export declare enum LogLevel {
    Verbose = "verbose",
    Info = "info",
    Warn = "warn",
    Error = "error",
    None = "none"
}
export declare function isTestEnvAndShouldNotPrompt(newValue?: boolean): boolean;
export declare function checkTTY(): boolean;
export declare function getInitialLogLevel(): LogLevel;
type Writer = (message: string) => void;
interface Logger {
    setWriter(write: Writer): void;
    setLevel(level: LogLevel): void;
    verbose(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
}
export declare const logger: Logger;
export declare const setLogLevel: (level: LogLevel) => void;
export declare const setLogWriter: (write: Writer) => void;
export {};