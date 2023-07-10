import type { ExportedConfig } from '@app-config/main';
export declare function register(): void;
declare global {
    namespace Cypress {
        interface Chainable {
            setAppConfig(configuration: ExportedConfig): Chainable<Element>;
        }
    }
}
