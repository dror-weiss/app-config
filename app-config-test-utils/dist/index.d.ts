type JoinDir = (filename: string) => string;
export declare function withTempFiles(files: {
    [filename: string]: string;
}, callback: (inDir: JoinDir, dir: string) => Promise<void>): Promise<void>;
export declare function withTempFiles(files: [string, string][], callback: (inDir: JoinDir, dir: string) => Promise<void>): Promise<void>;
export declare function mockedStdin(callback: (send: (text: string) => Promise<void>, end: () => void) => Promise<void>): Promise<void>;
export {};
