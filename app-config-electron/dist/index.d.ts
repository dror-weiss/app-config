import type { WebPreferences } from 'electron';
import type { ExportedConfig } from '@app-config/main';
export declare function addAppConfigPreload(config: ExportedConfig, baseWebPreferences?: WebPreferences): Electron.WebPreferences;
