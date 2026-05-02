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
1. `[completed]` Keep popup area organized in `index.html` while extraction continues.
2. `[completed]` Normalize props/emits naming (`isOpen`, `close`, intent-specific events).
3. `[completed]` Consolidate preferences popup contract to `GikopoipoiPreferences` object while preserving legacy localStorage keys.
4. `[not started]` Add minimal comments only where coupling is non-obvious.

### Phase 2.5 - Small additional refactorings
1. [completed] Instead of passing availableTTSVoices to the settings popup, compute it inside the popup component itself, since it's only used there.
2. [completed] Similarly, move getLangEntries to the popup component. Before doing it check that it's safe to do, though.
2. [completed] In the same manner as it was done for isInfoboxVisible, make all the sets of preferences go through setAndPersist(). do this one preference as a time.
3. [complete] There's still stuff in the local storage which is not handled through the GikopoipoiPreferences type. Move them there as well, and update the code to use the new type instead of directly accessing local storage.
4. [completed] stream settings (streamMode, displayAdvancedStreamSettings, streamEchoCancellation...) are all individually in the main component's data, but it should be made so that the stream popup just references the preferences object for all of them, to reduce the amount of plumbing.
5. [completed] Remove the `createPreferenceProxy()` bridge and make `preferences` the only settings source at runtime: migrate all root/template references from top-level aliases (for example `uiTheme`, `showNotifications`, `isCrispModeEnabled`) to `preferences.*`, and update generic helpers (such as `storeSet`) to read/write `preferences` keys directly.
6. [completed] simplify the rula popup by getting the rooms list with a REST api instead of sending a websocket message from the root component and then wait for another websocket message from the server. The api can be called directly by the rula popup. For an added bonus, could display a spinner in the rula popup while the rooms are being fetched.
7. [not started] Make the API calls go through an explicit API client module instead of being scattered across the codebase, in order to:
    - keep type safety for request/response payloads
    - have a single place to handle auth tokens (it's the private user id) and error handling
8. [not started] In the backend, streamline authentication and authorization for REST API calls (now, at least for /api/areas/:areaId/rooms and /api/areas/:areaId/rooms/:roomId, it's copypasted)
9. [completed] Remove all usages of the "set-pref" emit: components should receive the `preferences` object as a prop and use `setAndPersistPreference` to mutate it instead of making the root component do it for them.
10. split rooms.ts into separate files for each room (it's just too big now).
11. [not started] Remove usage of provide/inject, make all dependencies explicit to make it easier to understand and refactor.

### Phase 3 - Introduce `RoomSession`
Introduce a `RoomSession` object to centralize the core live application state and expose a small event-bus-like API where useful.
- `RoomSession` will be the owner of the websocket connecting to the server.
- it will be the abstraction layer for websocket commands, and also provide hooks to register to events coming from the websocket.
- the main goal is that as we move more and more stuff from `index.html` into dedicated components, `main.ts` will have very little code, and all components will interact with `RoomSession` instead.
Details about this are in the [architecture.md](./architecture.md) file.
Good next step
- Move the inbound socket handlers from main.ts into RoomSession one group at a time, starting with:
    - server-update-current-room-state
    - server-stats
    - server-msg


### Phase 4 - Remaining major UI splits
After popup stabilization:
1. `[not started]` Extract canvas section into a component.
2. `[not started]` Extract chat section (input, log, toolbar buttons) into a component.
3. `[not started]` Extract stream section (`#stream-section`) into a component.

### Phase 5 - Backend
1. Simplify annual events handling.
2. Containerize all components of the system for easier deployment and development (it would be particularly great to be able to use local janus instances for dev)
3. Kill janus! For example, by replacing it with a custom WebRTC relay (in node.js or Rust).

### Phase X - Small things that can be done anytime
1. Rename common_types.ts to common-types.ts for consistency with the rest of the codebase.

## Tests to perform on all kinds of devices after finishing this refactoring
1. Log message sound
2. Streams

### Devices to test on
- Windows, Chrome
- Windows, Firefox
- Linux, Chrome
- Linux, Firefox
- Android
- iPhone
- iOS

## Why `RoomSession`

`RoomSession` is short, explicit, and aligned with the actual responsibility:
- own the live room/session state and socket lifecycle;
- expose high-level actions (chat, room movement, stream intents);
- avoid a vague catch-all "orchestrator" object.

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
- `src/frontend/room-session.ts` (future phase)
