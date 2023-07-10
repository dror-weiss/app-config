"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@app-config/core");
const extension_utils_1 = require("@app-config/extension-utils");
const node_1 = require("@app-config/node");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ExecError extends core_1.AppConfigError {
    constructor() {
        super(...arguments);
        this.name = 'ExecError';
    }
}
function execParsingExtension() {
    return (0, extension_utils_1.named)('$exec', (0, extension_utils_1.forKey)('$exec', (0, extension_utils_1.validateOptions)((SchemaBuilder) => SchemaBuilder.oneOf(SchemaBuilder.stringSchema(), SchemaBuilder.emptySchema()
        .addString('command')
        .addBoolean('failOnStderr', {}, false)
        .addBoolean('parseOutput', {}, false)
        .addBoolean('trimWhitespace', {}, false)), (value) => async (parse, _, source) => {
        let options;
        if (typeof value === 'string') {
            options = { command: value };
        }
        else {
            options = value;
        }
        const { command, failOnStderr = false, parseOutput = false, trimWhitespace = true, } = options;
        try {
            const dir = (0, node_1.resolveFilepath)(source, '.');
            const { stdout, stderr } = await execAsync(command, { cwd: dir });
            if (failOnStderr && stderr) {
                throw new ExecError(`$exec command "${command}" produced stderr: ${stderr}`);
            }
            let result = stdout;
            if (trimWhitespace) {
                result = stdout.trim();
            }
            if (parseOutput) {
                const fileType = await (0, core_1.guessFileType)(stdout);
                result = await (0, core_1.parseRawString)(stdout, fileType);
            }
            return parse(result, { shouldFlatten: true });
        }
        catch (err) {
            if (!isError(err)) {
                throw err;
            }
            if (err instanceof ExecError) {
                throw err;
            }
            throw new ExecError(`$exec command "${command}" failed with error:\n${err.message}`);
        }
    })));
}
/**
 * Check if a value is an Error.
 *
 * This was created because `value instanceof Error` was returning false
 * for normal-looking errors coming from `child_process` `exec()` command
 */
function isError(value) {
    return typeof value === 'object' && value.message !== undefined;
}
exports.default = execParsingExtension;
//# sourceMappingURL=index.js.map