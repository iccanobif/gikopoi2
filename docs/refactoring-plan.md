## Frontend Refactor Plan (Incremental)

This document tracks the step-by-step migration of frontend HTML sections from `index.html` to Vue components.

Goal: reduce the monolithic root template while preserving behavior at every step.

Approach:
- Extract one UI slice at a time.
- Keep state/effects in `src/frontend/main.ts` initially.
- Wire extracted components through explicit props/emits.
- Build and smoke-test after each extraction.
- Commit after each extraction.

## Current Progress

Status legend: `[completed]`, `[in progress]`, `[not started]`

Current step:
1. `[in progress]` Phase 2 - template stabilization and naming consistency.

## Plan of Action

### Phase 0 - Baseline and Constraints
1. `[completed]` Preserve all existing behavior while refactoring incrementally.
2. `[completed]` Validate popup open/close behavior via button, overlay click, and `Escape`.
3. `[completed]` Keep IDs/classes where needed for existing CSS and selectors.

### Phase 1 - Popup-by-popup extraction
1. `[completed]` Extract `DialogPopup` to `src/frontend/components/popups/dialog-popup.vue`.
2. `[completed]` Extract `RulaPopup` to `src/frontend/components/popups/rula-popup.vue`.
3. `[completed]` Extract `UserListPopup` to `src/frontend/components/popups/user-list-popup.vue`.
4. `[completed]` Extract `StreamPopup` to `src/frontend/components/popups/stream-popup.vue`.
5. `[completed]` Extract `PreferencesPopup` to `src/frontend/components/popups/preferences-popup.vue`.
6. `[completed]` Extract `DeviceSelectionPopup` to `src/frontend/components/popups/device-selection-popup.vue`.

Rules for each extraction:
1. `[completed]` Root (`main.ts`) remains owner of state and side effects.
2. `[completed]` Component exposes display/state via props.
3. `[completed]` Component emits user intents; root methods handle actions.
4. `[completed]` Run build and smoke test.
5. `[completed]` Create one dedicated commit per extraction.

### Phase 2 - Template stabilization
1. `[in progress]` Keep popup area organized in `index.html` while extraction continues.
2. `[in progress]` Normalize props/emits naming (`isOpen`, `close`, intent-specific events).
3. `[completed]` Consolidate preferences popup contract to `GikopoipoiPreferences` object while preserving legacy localStorage keys.
4. `[not started]` Add minimal comments only where coupling is non-obvious.

### Phase 2.5 - Small additional refactorings
1. Instead of passing availableTTSVoices to the settings popup, compute it inside the popup component itself, since it's only used there.
2. Similarly, move getLangEntries to the popup component. Before doing it check that it's safe to do, though.
3. There's still stuff in the local storage which is not handled through the GikopoipoiPreferences type. Move them there as well, and update the code to use the new type instead of directly accessing local storage.
4. Remove the `createPreferenceProxy()` bridge and make `preferences` the only settings source at runtime: migrate all root/template references from top-level aliases (for example `uiTheme`, `showNotifications`, `isCrispModeEnabled`) to `preferences.*`, and update generic helpers (such as `storeSet`) to read/write `preferences` keys directly.

### Phase 3 - Introduce runtime coordination object
1. `[not started]` Introduce `ClientSessionController` (name chosen over generic "orchestrator").
2. `[not started]` Move websocket lifecycle/domain actions there gradually.
3. `[not started]` Keep Vue root as UI adapter between components and controller.
4. `[not started]` Do not introduce a broad global event bus by default.

### Phase 4 - Remaining major UI splits
After popup stabilization:
1. `[not started]` Extract canvas section into a component.
2. `[not started]` Extract chat section (input, log, toolbar buttons) into a component.
3. `[not started]` Extract stream section (`#video-streams`) into a component.

## Why `ClientSessionController`

`ClientSessionController` is explicit about responsibility:
- Own socket/session lifecycle.
- Expose high-level actions (chat, room movement, stream intents).
- Avoid a vague catch-all "orchestrator" object.

A small typed event mechanism can be added later only for decoupled notifications, not as a default interaction pattern.

## Verification Checklist

After each extraction:
1. `npm run build` passes.
2. Popup open/close behavior unchanged.
3. Keyboard behavior (`Escape`, popup-specific keys) unchanged.
4. Action buttons still route to existing logic.
5. No CSS/ID regressions in the popup layout.

## Relevant Files

- `index.html`
- `src/frontend/main.ts`
- `src/frontend/components/popups/dialog-popup.vue`
- `src/frontend/components/popups/rula-popup.vue`
- `src/frontend/components/popups/user-list-popup.vue`
- `src/frontend/components/popups/stream-popup.vue`
- `src/frontend/components/popups/preferences-popup.vue`
- `src/frontend/components/popups/device-selection-popup.vue`
- `src/frontend/client-session-controller.ts` (future phase)
