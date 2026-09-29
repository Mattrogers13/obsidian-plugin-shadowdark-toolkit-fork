<script lang="ts">
	import type Shadowdark from "../main";

	let {
		scope,
		text,
		bonuses = true,
	}: { scope: Shadowdark; text: string; bonuses?: boolean } = $props();

	// Matches dice formulas (2d8+2) and, when bonuses is on, bare attack/check
	// bonuses (+5, -1) rolled as d20. Turn bonuses off for prose like "+1 damage".
	const FORMULA = /(\d*d\d+(?:\s?[+-]\s?\d+)?)/g;
	const WITH_BONUSES = /(\d*d\d+(?:\s?[+-]\s?\d+)?)|((?<![\w])[+-]\d+)/g;

	interface Part {
		text: string;
		formula?: string;
	}

	let parts = $derived.by(() => {
		const out: Part[] = [];
		let last = 0;
		for (const m of text.matchAll(bonuses ? WITH_BONUSES : FORMULA)) {
			const i = m.index ?? 0;
			if (i > last) out.push({ text: text.slice(last, i) });
			out.push({
				text: m[0],
				formula: m[1] ? m[1].replace(/\s/g, "") : "d20" + m[2],
			});
			last = i + m[0].length;
		}
		if (last < text.length) out.push({ text: text.slice(last) });
		return out;
	});
</script>

{#each parts as part}{#if part.formula}<button
			class="sd-dice"
			title={"Roll " + part.formula}
			onclick={() => scope.rollDice(part.formula ?? "")}>{part.text}</button
		>{:else}{part.text}{/if}{/each}

<style>
	.sd-dice {
		all: unset;
		cursor: pointer;
		color: var(--text-accent);
		border-bottom: 1px dotted var(--text-accent);
	}
	.sd-dice:hover {
		background: var(--background-modifier-hover);
	}
</style>
