"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const originalEnvironment = Object.assign({}, process.env);
afterEach(() => {
    process.env = Object.assign({}, originalEnvironment);
});
describe('injectHtml', () => {
    it('fails when HTML does not contain script tag', async () => {
        await expect((0, index_1.injectHtml)(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Webpack App</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
          </head>
          <body><script src="/main.js"></script></body>
        </html>
      `, { validate: true })).rejects.toThrow();
    });
    it('adds app-config to an empty script tag', async () => {
        process.env.APP_CONFIG = JSON.stringify({ foo: 42 });
        const injected = await (0, index_1.injectHtml)(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Webpack App</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <script id="app-config"></script>
          </head>
          <body><script src="/main.js"></script></body>
        </html>
      `, { validate: false });
        expect(injected).toMatchSnapshot();
    });
    it('adds app-config to an existing script tag', async () => {
        process.env.APP_CONFIG = JSON.stringify({ foo: 88 });
        const injected = await (0, index_1.injectHtml)(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Webpack App</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <script id="app-config">window._appConfig = {}</script>
          </head>
          <body><script src="/main.js"></script></body>
        </html>
      `, { validate: false });
        expect(injected).toMatchSnapshot();
    });
    it('validates provided app-config', async () => {
        process.env.APP_CONFIG = JSON.stringify({ foo: 42 });
        process.env.APP_CONFIG_SCHEMA = JSON.stringify({ type: 'object', additionalProperties: false });
        const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Webpack App</title>
          <meta name="viewport" content="width=device-width,initial-scale=1">
          <script id="app-config"></script>
        </head>
        <body><script src="/main.js"></script></body>
      </html>
    `;
        await expect((0, index_1.injectHtml)(html, { validate: true })).rejects.toThrow();
        process.env.APP_CONFIG = JSON.stringify({});
        await expect((0, index_1.injectHtml)(html, { validate: true })).resolves.toMatchSnapshot();
    });
    it('uses provided loadConfig options', async () => {
        process.env.MY_CONFIG = JSON.stringify({ foo: true });
        const injected = await (0, index_1.injectHtml)(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Webpack App</title>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <script id="app-config">window._appConfig = {}</script>
          </head>
          <body><script src="/main.js"></script></body>
        </html>
      `, { validate: false, configOptions: { environmentVariableName: 'MY_CONFIG' } });
        expect(injected).toMatchSnapshot();
    });
});
//# sourceMappingURL=index.test.js.map