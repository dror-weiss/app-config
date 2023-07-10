export type TransformOptions = {
    src: string;
    filename: string;
    options: {
        customTransformOptions: {
            [key: string]: any;
        };
        dev: boolean;
        hot: boolean;
        inlinePlatform: boolean;
        minify: boolean;
        platform: string;
        experimentalImportSupport: boolean;
        type: string;
        inlineRequires: boolean;
        enableBabelRCLookup: boolean;
        enableBabelRuntime: boolean;
        projectRoot: string;
        publicPath: string;
    };
};
export type Transformer = {
    transform(options: TransformOptions): void;
};
export type LegacyTransformer = {
    transform(src: string, filename: string, options: any): void;
};
export declare const upstreamTransformer: Transformer;
