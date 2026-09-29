<script lang="ts">
	import type Shadowdark from "../../main";
	import type { Encounter } from "../../types/encounter";
	import { marshalModifiedDiceRoll } from "../../types/modified-dice-roll";
	import DiceText from "../../components/dice-text.svelte";

	let { scope, encounter }: { scope: Shadowdark; encounter: Encounter } =
		$props();

	const monsters = $derived(encounter.monsters ?? []);
</script>

<article>
	<header>
		<h2>{encounter.title}</h2>
		<button
			class="run"
			disabled={!monsters.length}
			onclick={() =>
				scope.runEncounter(
					encounter.description || encounter.title,
					monsters,
				)}>Run Encounter</button
		>
	</header>
	{#if encounter.description}
		<p><DiceText {scope} text={encounter.description} bonuses={false} /></p>
	{/if}
	<ul>
		{#each monsters as m}
			{@const monster = scope.monsters[m.id]}
			<li class:missing={!monster}>
				{marshalModifiedDiceRoll(m.quantity)}
				{monster ? monster.name : `${m.id} (monster not found)`}
			</li>
		{/each}
	</ul>
</article>

<style>
	article {
		font-family: PlaypenSans;
		font-weight: 300;
		background-color: var(--background-primary-alt);
		color: var(--text-normal);
		border: var(--border-width) solid var(--background-modifier-border);
		border-radius: 1rem;
		padding: 0.6rem;
		margin: 1rem 0;
		max-width: 40rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;

		h2 {
			font-weight: 600;
			font-size: 1.2rem;
			margin: 0;
			padding: 0.4rem;
			color: var(--text-accent);
		}
	}

	.run {
		font-size: 0.8rem;
		padding: 0.2rem 0.6rem;
		height: auto;
	}

	p {
		margin: 0.2rem 0.4rem 0.6rem;
	}

	ul {
		margin: 0;
		padding-left: 1.6rem;
	}

	.missing {
		color: var(--text-error);
	}
</style>
