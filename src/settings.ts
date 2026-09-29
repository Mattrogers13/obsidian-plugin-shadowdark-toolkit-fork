import { App, PluginSettingTab } from "obsidian";
import Shadowdark from "./main";

export interface ShadowdarkSettings {
	encounterFolder: string;
}

export const DEFAULT_SETTINGS: ShadowdarkSettings = {
	encounterFolder: "",
};

export class SettingTab extends PluginSettingTab {
	constructor(app: App, plugin: Shadowdark) {
		super(app, plugin);
	}

	getSettingDefinitions() {
		return [
			{
				name: "Encounter folder",
				desc: "Where Run Encounter creates encounter notes. Leave empty for the vault root.",
				control: {
					type: "folder" as const,
					key: "encounterFolder",
					placeholder: "Encounters",
				},
			},
		];
	}
}
