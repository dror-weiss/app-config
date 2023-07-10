"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
function register() {
    Cypress.Commands.add('setAppConfig', { prevSubject: false }, (configuration) => {
        cy.on('window:before:load', (window) => {
            Object.defineProperty(window, '_appConfig', {
                configurable: false,
                set() { },
                get() {
                    return configuration;
                },
            });
        });
    });
}
exports.register = register;
//# sourceMappingURL=index.js.map