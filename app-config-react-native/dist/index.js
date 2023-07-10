"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = void 0;
const config_1 = require("@app-config/config");
const node_1 = require("@app-config/node");
const utils_1 = require("@app-config/utils");
const path_1 = require("path");
const upstream_transformer_1 = require("./upstream-transformer");
/**
 * Transform is called by Metro for each package resolved in the React Native project
 */
const transform = async ({ src, filename, options }) => {
    // Get the relative path to app-config's entry point
    const appConfigPath = (0, path_1.relative)(options.projectRoot, require.resolve('@app-config/main', {
        // Search relative to the project's root
        paths: [options.projectRoot],
    }));
    // If the current module isn't app-config, pass-through to the default upstream transformer
    if (filename !== appConfigPath) {
        return upstream_transformer_1.upstreamTransformer.transform({ src, filename, options });
    }
    // Parse config and overwrite app-config's entry point with exported config JSON
    const { fullConfig } = await (0, config_1.loadValidatedConfig)();
    const modifiedSrc = (0, utils_1.generateModuleText)(fullConfig, {
        environment: (0, node_1.currentEnvironment)(),
        useGlobalNamespace: false,
        validationFunctionCode: undefined,
        esmValidationCode: false,
    });
    return upstream_transformer_1.upstreamTransformer.transform({ src: modifiedSrc, filename, options });
};
exports.transform = transform;
//# sourceMappingURL=index.js.map