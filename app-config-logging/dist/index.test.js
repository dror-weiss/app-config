"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
describe('logging', () => {
    it('logs verbose messages', () => {
        const writeMsg = jest.fn();
        index_1.logger.setWriter(writeMsg);
        index_1.logger.setLevel(index_1.LogLevel.Verbose);
        index_1.logger.verbose('hello world');
        index_1.logger.info('information');
        index_1.logger.warn('warning');
        index_1.logger.error('error');
        expect(writeMsg).toHaveBeenCalledWith('[app-config][VERBOSE] hello world\n');
        expect(writeMsg).toHaveBeenCalledWith('[app-config][INFO] information\n');
        expect(writeMsg).toHaveBeenCalledWith('[app-config][WARN] warning\n');
        expect(writeMsg).toHaveBeenCalledWith('[app-config][ERROR] error\n');
    });
    it('respects LogLevel.Warn', () => {
        const writeMsg = jest.fn();
        index_1.logger.setWriter(writeMsg);
        index_1.logger.setLevel(index_1.LogLevel.Warn);
        index_1.logger.verbose('hello world');
        index_1.logger.info('information');
        index_1.logger.warn('warning');
        index_1.logger.error('error');
        expect(writeMsg).not.toHaveBeenCalledWith('[app-config][VERBOSE] hello world\n');
        expect(writeMsg).not.toHaveBeenCalledWith('[app-config][INFO] information\n');
        expect(writeMsg).toHaveBeenCalledWith('[app-config][WARN] warning\n');
        expect(writeMsg).toHaveBeenCalledWith('[app-config][ERROR] error\n');
    });
    it('respects LogLevel.None', () => {
        const writeMsg = jest.fn();
        index_1.logger.setWriter(writeMsg);
        index_1.logger.setLevel(index_1.LogLevel.None);
        index_1.logger.verbose('hello world');
        index_1.logger.info('information');
        index_1.logger.warn('warning');
        index_1.logger.error('error');
        expect(writeMsg).not.toHaveBeenCalled();
    });
    it('uses APP_CONFIG_LOG_LEVEL', () => {
        expect((0, index_1.getInitialLogLevel)()).toBe(index_1.LogLevel.None);
        process.env.NODE_ENV = '';
        expect((0, index_1.getInitialLogLevel)()).toBe(index_1.LogLevel.Warn);
        process.env.APP_CONFIG_LOG_LEVEL = 'verbose';
        expect((0, index_1.getInitialLogLevel)()).toBe(index_1.LogLevel.Verbose);
    });
});
//# sourceMappingURL=index.test.js.map