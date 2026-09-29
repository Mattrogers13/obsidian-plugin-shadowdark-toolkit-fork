import {
	marshalModifiedDiceRoll,
	unmarshalModifiedDiceRoll,
	type ModifiedDiceRoll,
} from "./modified-dice-roll";
import JSON5 from "json5";

export type Encounter = {
	title: string;
	description?: string;
	monsters?: {
		id: string;
		quantity: ModifiedDiceRoll;
	}[];
};

export function marshalEncounter(encounter: Encounter): string {
	const serialized = {
		...encounter,
		monsters: encounter.monsters?.map((m) => ({
			...m,
			quantity: marshalModifiedDiceRoll(m.quantity),
		})),
	};

	return [
		"```sd-encounter",
		JSON.stringify(serialized, null, 2),
		"```",
	].join("\n");
}

export function unmarshalEncounter(content: string) {
	let data: any;
	try {
		const blockMatch = content.match(/```sd-encounter\s*\n([\s\S]*?)```/);
		data = JSON5.parse(blockMatch?.[1]?.trim() ?? content.trim());
	} catch {
		throw new Error("Invalid JSON");
	}

	if (typeof data !== "object" || data === null)
		throw Error("Encounter must be an object");

	if (!("title" in data)) throw Error("Missing encounter title");
	if (typeof data.title !== "string") throw Error("Invalid encounter title");

	if ("description" in data && typeof data.description !== "string")
		throw Error("Invalid encounter description");

	if (!("monsters" in data) || !Array.isArray(data.monsters))
		throw Error("Invalid encounter monsters");

	for (const m of data.monsters) {
		if (typeof m?.id !== "string") throw Error("Every monster needs an id");
	}

	return {
		title: data.title,
		description: data.description,
		monsters: data.monsters.map((m: any) => ({
			id: m.id,
			quantity: unmarshalModifiedDiceRoll(m.quantity ?? 1),
		})),
	} as Encounter;
}
