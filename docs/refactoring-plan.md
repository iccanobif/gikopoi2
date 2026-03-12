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

Completed:
1. `DialogPopup` extraction.
2. `RulaPopup` extraction.

Commits:
1. `26fd4530` - `refactor(frontend): extract DialogPopup component`
2. `f37f030c` - `refactor(frontend): extract RulaPopup component`

In progress:
1. `UserListPopup` extraction.

## Plan of Action

### Phase 0 - Baseline and Constraints
1. Preserve all existing behavior while refactoring incrementally.
2. Validate popup open/close behavior via button, overlay click, and `Escape`.
3. Keep IDs/classes where needed for existing CSS and selectors.

### Phase 1 - Popup-by-popup extraction
1. Extract `DialogPopup` to `src/frontend/components/popups/dialog-popup.vue`.
2. Extract `RulaPopup` to `src/frontend/components/popups/rula-popup.vue`.
3. Extract `UserListPopup` to `src/frontend/components/popups/user-list-popup.vue`.
4. Extract `StreamPopup` to `src/frontend/components/popups/stream-popup.vue`.
5. Extract `PreferencesPopup` to `src/frontend/components/popups/preferences-popup.vue`.
6. Extract `DeviceSelectionPopup` to `src/frontend/components/popups/device-selection-popup.vue`.

Rules for each extraction:
1. Root (`main.ts`) remains owner of state and side effects.
2. Component exposes display/state via props.
3. Component emits user intents; root methods handle actions.
4. Run build and smoke test.
5. Create one dedicated commit per extraction.

### Phase 2 - Template stabilization
1. Keep popup area organized in `index.html` while extraction continues.
2. Normalize props/emits naming (`isOpen`, `close`, intent-specific events).
3. Add minimal comments only where coupling is non-obvious.

### Phase 3 - Introduce runtime coordination object
1. Introduce `ClientSessionController` (name chosen over generic "orchestrator").
2. Move websocket lifecycle/domain actions there gradually.
3. Keep Vue root as UI adapter between components and controller.
4. Do not introduce a broad global event bus by default.

### Phase 4 - Remaining major UI splits
After popup stabilization:
1. Extract canvas section into a component.
2. Extract chat section (input, log, toolbar buttons) into a component.
3. Extract stream section (`#video-streams`) into a component.

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
