<script lang="ts">
	import type Shadowdark from "../main";

	let {
		scope,
		text,
		bonuses = true,
	}: { scope: Shadowdark; text: string; bonuses?: boolean } = $props();

	// Matches, in order: DC checks (DC 15 CON), dice formulas (2d8+2) and, when
	// bonuses is on, bare attack/check bonuses (+5, -1) rolled as d20. Turn
	// bonuses off for prose like "+1 damage".
	const CHECK = /\bDC\s?(\d+)(?:\s+(STR|DEX|CON|INT|WIS|CHA)\b)?/;
	const FORMULA = /(\d*d\d+(?:\s?[+-]\s?\d+)?)/;
	const BONUS = /((?<![\w])[+-]\d+)/;
	const pattern = $derived(
		new RegExp(
			[CHECK, FORMULA, ...(bonuses ? [BONUS] : [])]
				.map((r) => r.source)
				.join("|"),
			"g",
		),
	);

	interface Part {
		text: string;
		roll?: () => void;
		title?: string;
	}

	let parts = $derived.by(() => {
		const out: Part[] = [];
		let last = 0;
		for (const m of text.matchAll(pattern)) {
			const i = m.index ?? 0;
			if (i > last) out.push({ text: text.slice(last, i) });
			const [match, dc, , formula, bonus] = m;
			if (dc) {
				const label = match.replace(/\s+/g, " ");
				out.push({
					text: match,
					title: `Roll d20 vs ${label}`,
					roll: () => scope.rollCheck(Number(dc), label),
				});
			} else {
				const f = formula ? formula.replace(/\s/g, "") : "d20" + bonus;
				out.push({
					text: match,
					title: "Roll " + f,
					roll: () => scope.rollDice(f),
				});
			}
			last = i + match.length;
		}
		if (last < text.length) out.push({ text: text.slice(last) });
		return out;
	});
</script>

{#each parts as part}{#if part.roll}<button
			class="sd-dice"
			title={part.title}
			onclick={part.roll}>{part.text}</button
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
