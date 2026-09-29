# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Shadowdark Toolkit: a personal fork of p-mercury/obsidian-shadow-dark (Apache-2.0), an Obsidian plugin for Shadowdark GMs. Svelte 5 + TypeScript, bundled with esbuild.

## Commands

- `npm run build`: runs `tsc` and then a production bundle to `main.js`. `tsc` does **not** check `.svelte` files.
- `npx svelte-check --threshold error`: run this too after touching Svelte. The 2 existing warnings are upstream's.
- `npm run dev`: esbuild watch mode with inline sourcemaps.
- No test suite. `npm run lint` fails because upstream ships no `eslint.config.*`. Formatting is Prettier with tabs.
- Testing pure TS logic without a suite: `npx esbuild src/<file>.ts --bundle --format=cjs --platform=node --external:obsidian --outfile=<scratch>/x.cjs`, stub `obsidian` in `<scratch>/node_modules/obsidian/index.js`, then `node -e` against the exports.
- UI and Dice Roller behavior can't be verified from the CLI: rebuild, copy into the vault, and have the user toggle the plugin off/on and check (screenshots help for layout).
- Install into a vault: copy `main.js`, `manifest.json`, `styles.css` to `<vault>/.obsidian/plugins/shadowdark-toolkit/`. The test vault is `~/Obsidian/shadowdark-ravenloft`. Its `.obsidian/` is gitignored, so plugin files never enter the vault repo.

## Repo workflow

- `origin` = `Mattrogers13/obsidian-plugin-shadowdark-toolkit-fork`, `upstream` = `p-mercury/obsidian-shadow-dark`. Never open PRs upstream; `gh` default repo is set to the fork.
- Flow: feature branch, then PR to the fork's `main`, then merge.
- Releases: bump with `npm version X.Y.Z-alpha --no-git-tag-version` (updates `package.json`, `manifest.json`, `versions.json`), merge, then push a tag that is exactly the manifest version, **no `v` prefix**; Obsidian and BRAT require the tag, release name and manifest version to match. The tag push runs `.github/workflows/release.yaml`, which fails on a tag/manifest mismatch and publishes a release (pre-release when the version has a hyphen) with `main.js`, `manifest.json`, `styles.css`. Older `v0.x-alpha` tags predate this.
- `gh pr merge` is pre-approved in `.claude/settings.local.json`, but only when run as its own command; don't chain it with other steps.
- In zsh, quote `gh api` URLs that contain `?`. Never chain a branch switch after steps that can fail; a broken chain once left a commit on `main`.
- `sources/` holds the original handoff notes and patches and is excluded via `.git/info/exclude`.

## Architecture

- **`src/main.ts`** holds the `Shadowdark` plugin class and wires everything:
  - Registers the `sd-*` code block processors.
  - Adds the editor right-click "Shadowdark" submenu (Insert Encounter / Encounter Table) and the folder menu (New Monster / Class / Item Set, Random NPC / Shop).
  - Hosts the shared helpers `rollDice`, `rollCheck` and `runEncounter`.
- **Vault-wide cache (`updateCache`).** Every markdown file is scanned on load and on modify/create/rename. `sd-monster` and `sd-class` blocks and `^sd-item-set`-marked tables are indexed by `id` into `fileMonsters` / `fileClasses` / `fileItems`. Encounters, NPCs and shops look records up through the `scope.monsters` / `classes` / `items` getters, so a monster must live in some note's `sd-monster` block to be referenced by id.
- **Block pattern (`src/blocks/<name>/`).** `index.ts` is a `MarkdownRenderChild` that parses the block source and mounts `read-block.svelte`. Most blocks are editable in place: the component's `onSave` re-serializes the data and writes it back into the note with `vault.process`, replacing the block's lines found via `ctx.getSectionInfo`. `sd-encounter` is read-only.
- **Data models (`src/types/`).** Each type has `marshal` (JSON wrapped in its fence) and `unmarshal` (JSON5 parse plus validation). Classes use Svelte 5 runes, hence the `*.svelte.ts` files. Callers pass the block body, not whole notes. Dice values are `DiceRoll` / `ModifiedDiceRoll` (`"1d4+1"` or a plain number) with `executeRoll`. Note that `unmarshalModifiedDiceRoll` silently falls back to 1d6 on bad input, so validate user input first (see `modals/quantity-modal.ts`).
- **Dice Roller integration.** Requires the `obsidian-dice-roller` plugin. `components/dice-text.svelte` turns text into roll buttons:
  - `DC 15 CON` becomes `rollCheck`: a d20 with a pass/fail notice, which listens for `dice-roller:rendered-result`.
  - Dice formulas become `rollDice`, which fires `dice-roller:render-dice`.
  - Bare `+N` becomes a d20+N roll unless `bonuses={false}`, which attribute prose uses so "+1 damage" stays plain text.
- **Encounters.** `runEncounter()` rolls quantities and writes one `sd-monster-instance` block per monster (with its own HP tracker) into a new note in `settings.encounterFolder`. It is used by encounter tables, the statblock Run button, and `sd-encounter` blocks.
- **Settings** use Obsidian 1.13's declarative `getSettingDefinitions()` (`src/settings.ts`).

## Conventions

- Block names are `sd-*` (renamed from upstream's `shadowdark-*` to avoid clashing with upstream and the Shadowdark Statblocks plugin). Renaming a block or marker also requires migrating existing vault notes.
- The user prefers the existing card layout with stat boxes. A black-and-white book-style restyle was tried and rejected.
- Test notes in the Ravenloft vault (`04 Reference/Tools Test/`) are untracked by the vault's git; copy them to the scratchpad before bulk edits, and never commit to the vault repo (the user has their own uncommitted work there).
