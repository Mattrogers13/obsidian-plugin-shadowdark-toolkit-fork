import { App, Modal, Setting } from "obsidian";
import {
	unmarshalModifiedDiceRoll,
	type ModifiedDiceRoll,
} from "../types/modified-dice-roll";

// unmarshalModifiedDiceRoll falls back to 1d6 on bad input, so user input is
// checked here first: a whole number (3) or a dice formula (1d4+1, d6).
const QUANTITY = /^(\d+|\d*d\d+([+-]\d+)?)$/i;

export function parseQuantity(input: string): ModifiedDiceRoll | undefined {
	const value = input.replace(/\s+/g, "");
	if (!QUANTITY.test(value)) return undefined;
	const roll = unmarshalModifiedDiceRoll(
		/^d/i.test(value) ? `1${value}` : value,
	);
	if (roll.count < 1 && roll.modifier < 1) return undefined;
	return roll;
}

export class QuantityModal extends Modal {
	private value = "1";

	constructor(
		app: App,
		private monsterName: string,
		private onSubmit: (quantity: ModifiedDiceRoll) => void,
	) {
		super(app);
	}

	onOpen() {
		this.setTitle(`Run encounter: ${this.monsterName}`);

		let error: HTMLElement;

		const submit = () => {
			const quantity = parseQuantity(this.value);
			if (!quantity) {
				error.setText("Enter a number (3) or dice (1d4+1).");
				return;
			}
			this.close();
			this.onSubmit(quantity);
		};

		new Setting(this.contentEl)
			.setName("How many?")
			.setDesc("A number or a dice formula.")
			.addText((text) => {
				text.setValue(this.value).onChange((v) => (this.value = v));
				text.inputEl.addEventListener("keydown", (e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						submit();
					}
				});
				window.setTimeout(() => text.inputEl.select(), 0);
			});

		error = this.contentEl.createDiv({ cls: "mod-warning" });

		new Setting(this.contentEl).addButton((button) =>
			button.setButtonText("Run").setCta().onClick(submit),
		);
	}

	onClose() {
		this.contentEl.empty();
	}
}
