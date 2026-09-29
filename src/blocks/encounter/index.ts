import { type MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { mount, unmount } from "svelte";
import ReadBlock from "./read-block.svelte";
import type Shadowdark from "../../main";
import { unmarshalEncounter, type Encounter } from "../../types/encounter";

class EncounterBlockChild extends MarkdownRenderChild {
	private component: ReturnType<typeof mount> | undefined;

	constructor(
		containerEl: HTMLElement,
		private scope: Shadowdark,
		private source: string,
	) {
		super(containerEl);
	}

	onload() {
		let encounter: Encounter;
		try {
			encounter = unmarshalEncounter(this.source);
		} catch (e) {
			this.containerEl.setText(
				`Invalid encounter data: ${e instanceof Error ? e.message : e}`,
			);
			return;
		}

		this.component = mount(ReadBlock, {
			target: this.containerEl,
			props: { scope: this.scope, encounter },
		});
	}

	onunload() {
		if (this.component) {
			void unmount(this.component);
		}
	}
}

export function renderEncounterBlock(
	scope: Shadowdark,
	source: string,
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext,
) {
	ctx.addChild(new EncounterBlockChild(el, scope, source));
}
