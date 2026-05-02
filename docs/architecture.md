# Frontend interaction map for the planned split

This note describes the **current interactions between the canvas area, chat log, streams section, toolbar, and user-list popup**.

The goal is to make the future split into separate components safer by identifying:

- which events can originate in one section and affect others;
- which pieces of state are currently shared across sections;
- which behaviors are mostly isolated and can stay local to one component.

---

## Main sections involved

- **Canvas area**: room rendering, avatar movement, bubbles, room transitions, private-stream icons.
- **Chat log**: message list, clickable usernames, message highlighting, ignore styling.
- **Streams section**: stream start/stop/take/drop, video/audio controls, stream titles, NicoNico overlays.
- **Toolbar**: message input, send button, movement buttons, bubble-position buttons, popup openers.
- **User-list popup**: user selection/highlighting, ignore/block actions, private stream audience controls.

---

## Cross-component interactions

### 1. Highlighted user / selected user

**Can be triggered by:**
- clicking a username in the **chat log**;
- clicking a username in the **streams section** (`<username-label>`);
- clicking a row in the **user-list popup**.

**Affects:**
- **chat log**: all messages by that user are styled red;
- **canvas**: redraw is triggered and the highlighted user is sorted on top of other users on the same tile;
- **user-list popup**: the corresponding row is marked as selected and scrolled into view when the popup opens.

**Current shared state / methods:**
- `highlightedUserId`
- `highlightedUserName`
- `highlightUser(userId, userName)`

**Evidence:**
- `src/frontend/components/username-label.vue`
- `src/frontend/components/popups/user-list-popup.vue`
- `src/frontend/main.ts` (`highlightUser`, `updateCanvasObjects`, chat-log click handlers)

---

### 2. Room state updates from the websocket

**Triggered by:**
- `server-update-current-room-state`
- `server-user-joined-room`
- `server-user-left-room`
- `server-move`
- related socket events.

**Affects:**
- **canvas**: users are added/removed/moved and the room is redrawn;
- **streams**: stream slot state is refreshed;
- **user-list popup**: available users change;
- **infobox / stats UI**: counts are updated.

**Current shared state / methods:**
- `users`
- `currentRoom`
- `serverStats`
- `streams`
- `updateRoomState()`
- `updateCanvasObjects()`
- `updateCurrentRoomStreams()`

This is one of the strongest arguments for keeping a shared parent/store above the split components.

---

### 3. Incoming chat messages

**Triggered by:**
- websocket `server-msg`.

**Affects:**
- **chat log**: appends the new message;
- **canvas**: updates the speaker's bubble and triggers redraw;
- **streams**: if NicoNico mode is enabled, the message is also overlaid on video containers.

**Current shared state / methods:**
- `displayUserMessage(user, msg)`
- `writeMessageToLog()`
- `users[userId].message`
- `isRedrawRequired`

So a single server event currently fans out to at least **chat log + canvas + some stream UIs**.

---

### 4. Sending a message from the toolbar

**Triggered by:**
- pressing Enter in the toolbar textbox;
- clicking the send button.

**Affects:**
- the normal message path eventually updates the **chat log** and **canvas bubble** through the websocket;
- special commands (`#list`, `#rula`) open other UI sections/popups.

**Current shared state / methods:**
- `sendMessageToServer()`
- toolbar input DOM
- popup open state such as `isUserListPopupOpen` / `isRulaPopupOpen`

The toolbar is therefore not isolated: it is an entry point into several other areas.

---

### 5. Movement controls: toolbar and canvas keyboard share the same behavior

**Can be triggered by:**
- movement buttons in the **toolbar**;
- arrow keys / WASD / HJKL while the **canvas** is focused.

**Affects:**
- **canvas**: avatar movement and redraw;
- **room state**: movement can lead to stepping on a door and changing room.

**Current shared state / methods:**
- `movementDirection`
- `setMovementDirection()`
- `sendNewPositionToServer()`
- `changeRoomIfSteppingOnDoor()`

This logic is currently shared between the toolbar controls and the canvas-focused keyboard flow.

---

### 6. Room changes cascade across sections

**Can be triggered by:**
- stepping on a door in the **canvas**;
- `#rula` entered from the **toolbar** and confirmed via popup flow;
- server-side room updates.

**Affects:**
- **canvas**: room background/objects/users are replaced;
- **streams**: active/taken streams are stopped or dropped on room change;
- **chat/user-list**: the visible set of users changes.

**Current shared state / methods:**
- `changeRoom()`
- `updateRoomState()`
- `users`
- `currentRoom`
- `streams`
- `takenStreams`

This is another major cross-component cascade.

---

### 7. Bubble position changes

**Can be triggered by:**
- bubble buttons in the **toolbar**;
- keyboard shortcuts (`U/I/O/P`) while the **canvas** is focused.

**Affects:**
- **canvas** only in terms of rendering, but the event is shared between toolbar and canvas input paths and goes through socket/user state.

**Current shared state / methods:**
- `sendNewBubblePositionToServer()`
- `users[userId].bubblePosition`

This is a smaller interaction than highlighting or room changes, but still shared input logic.

---

### 8. Ignore / unignore / block user

**Triggered by:**
- buttons in the **user-list popup**.

**Affects:**
- **chat log**: matching messages gain/lose the `ignored-message` class;
- **canvas**: ignored users stop being drawn and username/bubble redraw is triggered;
- **streams / username labels**: ignored users show the fallback display name in `username-label`.

**Current shared state / methods:**
- `ignoredUserIds`
- `ignoreUser()`
- `unignoreUser()`
- `blockUser()`

This means the user-list popup currently reaches into both the log and canvas behavior.

---

### 9. Private stream audience selection

**Triggered by:**
- `give stream` / `revoke stream` buttons in the **user-list popup** while streaming to `specific_users`.

**Affects:**
- **user-list popup**: allowed/disallowed icons and buttons update;
- **canvas**: private-stream listener icons are drawn above user avatars;
- **streaming state**: the allowed listener list sent to the server changes.

**Current shared state / methods:**
- `allowedListenerIDs`
- `giveStreamToUser()`
- `revokeStreamToUser()`
- `isStreaming()`
- `preferences.streamTarget`

This is a direct interaction between the **streams domain**, the **user-list popup**, and the **canvas**.

---

### 10. Stream titles participate in user highlighting

The stream section is not only about media playback.

Because stream titles use `<username-label>`, clicking a streamer name in the **streams section** triggers the same `highlightUser()` flow used by the **chat log** and **user-list popup**.

This makes the **streams section** part of the shared “selected user” interaction model.

---

### 11. Chat messages feed NicoNico overlays in streams

When a new user message is received, `displayUserMessage()` also writes it into every `.nico-nico-messages-container` found in the **streams section** (and detached stream tabs).

So the current message pipeline is not just:

`message -> chat log`

but rather:

`message -> chat log + canvas bubble + optional stream overlay + optional notification/TTS`

This is an important coupling to preserve if the chat log and streams are split.

---

### 12. Cross-section preferences and layout coupling

Some preferences affect more than one section:

- `showLogAboveToolbar` changes the layout relationship between **chat log** and **toolbar**;
- `canvasHeight` is persisted from the canvas container resize observer;
- theme / username background / bubble opacity changes trigger **canvas** redraw while also affecting the broader UI.

**Current shared state / methods:**
- `preferences`
- `setAndPersist()`
- `handleUiTheme()`
- `handleBubbleOpacity()`
- `toggleInfobox()`

So the future components should all read from the same preferences object rather than each managing copies.

---

### 13. Focus and keyboard shortcuts link sections together

There is also direct DOM-level coupling:

- `Ctrl+G` switches focus between the **canvas** and the **toolbar input**;
- `Ctrl+L` focuses the **chat log**.

This is not domain state, but it is still a real interaction between components that will matter after the split.

---

## Mostly isolated behaviors

These appear to be relatively local and are good candidates to keep inside a dedicated component:

### Streams-local
- changing stream volume;
- pan / gain / compression controls;
- pin/unpin video positioning;
- mute/unmute / feedback / voice changer controls.

These mostly stay within the streams/audio-processing code and do not significantly affect canvas/chat/toolbar.

### Canvas-local
- zooming and manual camera dragging;
- debug grid display;
- donation-box click handling in the special room logic.

### Toolbar-local
- sound-effect volume and TTS volume sliders are mostly local to toolbar/preferences behavior, even though they influence how later messages are experienced.

---

## Suggested shared ownership after the split

If the UI is split into separate components, the following should probably stay in a **shared parent component or central store/composable**:

- `users`
- `currentRoom`
- `streams`
- `highlightedUserId` / `highlightedUserName`
- `ignoredUserIds`
- `allowedListenerIDs`
- `streamSlotIdInWhichIWantToStream`
- `preferences`
- websocket event handlers
- cross-cutting actions such as:
  - `highlightUser()`
  - `updateRoomState()`
  - `updateCurrentRoomStreams()`
  - `displayUserMessage()`
  - `changeRoom()`

---

## Summary

The main cross-component couplings today are:

1. **selected / highlighted user**;
2. **room state and websocket updates**;
3. **message flow**;
4. **movement / room changes**;
5. **ignore/block state**;
6. **private stream audience selection**;
7. **shared preferences and focus/layout behavior**.

The stream volume and similar per-stream controls are a good example of behavior that is already mostly isolated and should be easy to keep local to a future `StreamsSection` component.

---

## Proposed component boundary and state ownership plan

A reasonable split would be to keep a **single stage/root container** as the source of truth, and move rendering/UI concerns into smaller child components.

### Suggested top-level structure

- `StageRoot` / current root component
  - `CanvasArea`
  - `ToolbarSection`
  - `ChatLogSection`
  - `StreamsSection`
  - `UserListPopup`
  - other popups (`PreferencesPopup`, `StreamPopup`, `RulaPopup`, etc.)

The key idea is:

- **shared state stays at the top**;
- **leaf components render from props**;
- **leaf components emit intents/events upward** instead of mutating each other directly.

---

### State that should remain in the shared parent/store

This state is cross-cutting enough that it should not belong to any one of the split sections:

- `users`
- `currentRoom`
- `streams`
- `serverStats`
- `highlightedUserId` / `highlightedUserName`
- `ignoredUserIds`
- `allowedListenerIDs`
- `streamSlotIdInWhichIWantToStream`
- `takenStreams`
- popup open/close state
- websocket connection and socket event handlers
- `preferences`

For preferences specifically, the current project convention should be preserved:

- the root owns the full `preferences` object;
- child components receive the whole preferences object as a prop when needed;
- writes continue to go through `setAndPersist()`.

---

### Suggested ownership by component

#### `CanvasArea`

**Own/render locally:**
- canvas DOM and paint loop;
- pointer/drag/zoom handling;
- local drawing helpers and redraw flags.

**Read from shared state:**
- `users`
- `currentRoom`
- `highlightedUserId`
- `ignoredUserIds`
- `allowedListenerIDs`
- relevant preferences.

**Emit upward:**
- `move`
- `change-room`
- `set-bubble-position`
- `focus-input` / other navigation intents.

#### `ChatLogSection`

**Own/render locally:**
- the log container DOM;
- scrolling behavior;
- copied-log keyboard behavior.

**Read from shared state:**
- rendered message list or message append events;
- `highlightedUserId`;
- `ignoredUserIds`;
- log-related preferences.

**Emit upward:**
- `highlight-user`
- possibly `focus-canvas` or command intents if needed.

#### `StreamsSection`

**Own/render locally:**
- stream slot UI;
- per-stream controls (volume, pan, gain, mute, pinning, feedback);
- video element management and detached-tab UI.

**Read from shared state:**
- `streams`
- `takenStreams`
- `streamSlotIdInWhichIWantToStream`
- `allowedListenerIDs`
- relevant preferences.

**Emit upward:**
- `highlight-user`
- `start-stream`
- `stop-stream`
- `take-stream`
- `drop-stream`
- `open-stream-popup`.

#### `ToolbarSection`

**Own/render locally:**
- textbox, send button, movement buttons, bubble buttons;
- local focus helpers.

**Read from shared state:**
- preferences that affect button visibility and behavior.

**Emit upward:**
- `send-message`
- `move`
- `set-bubble-position`
- `open-user-list`
- `open-rula`
- `open-preferences`.

#### `UserListPopup`

**Own/render locally:**
- popup display, row rendering, button layout.

**Read from shared state:**
- derived user list;
- `highlightedUserId`;
- `ignoredUserIds`;
- streaming permission state.

**Emit upward:**
- `highlight-user`
- `ignore-user`
- `unignore-user`
- `block-user`
- `give-stream`
- `revoke-stream`.

---

### Recommended interaction rule for the refactor

To keep the split maintainable, it would help to enforce this rule:

> One section should not directly update another section's DOM or local component state.
> Instead, it should emit an action or update shared state in the parent/store.

For example:

- **good:** `ChatLogSection -> emit('highlight-user', userId)` -> parent updates `highlightedUserId` -> `CanvasArea`, `ChatLogSection`, and `UserListPopup` all react;
- **bad:** `ChatLogSection` reaching directly into canvas internals.

---

### Good candidates for composables or service layers

If the refactor goes further, these pieces could also be separated from the root component:

- `useRoomState()` for room/users/movement/change-room logic;
- `useStreams()` for stream lifecycle and RTC handling;
- `useChatLog()` for message/log append logic;
- `useUserSelection()` for highlighting/ignoring/blocking;
- `usePreferences()` as a thin wrapper around the existing root-owned preferences object.

That said, splitting the visual sections first and extracting composables later is probably the lower-risk path.

---

### Suggested migration order

A relatively safe order would be:

1. extract **`ChatLogSection`** first;
2. extract **`ToolbarSection`** next;
3. extract **`StreamsSection`**;
4. extract **`CanvasArea`** last, since it has the heaviest rendering and input coupling.

This order keeps the most stateful and timing-sensitive part (`CanvasArea`) in place until the other boundaries are already stable.

---

## Idea: a shared `RoomSession` object that owns `users` and the websocket

This idea **does make sense**, and it is probably a better long-term direction than keeping all of the room/session logic inside the root Vue component.

However, it would be better to think of it as **`RoomSession`** — a room/session store or service that also offers event-bus behavior where useful — rather than as a generic free-floating event bus.

In other words:

- **good:** one `RoomSession` object owns the live room/session state and exposes typed commands/events;
- **risky:** many unrelated components sending arbitrary string events through a global bus.

`RoomSession` can be a plain JavaScript/TypeScript object, a class, or a composable-backed singleton. The important part is the responsibility split.

### What `RoomSession` should own

This is a good home for **server-driven and cross-cutting state**, such as:

- `users`
- `currentRoom`
- `streams`
- `serverStats`
- `myUserID` / `myPrivateUserID`
- connection state (`connectionLost`, `connectionRefused`, `pageRefreshRequired`)
- socket initialization and all websocket handlers
- shared domain actions like:
  - `connectToServer()`
  - `initializeSocket()`
  - `changeRoom()`
  - `sendMessage()`
  - `move()`
  - `setBubblePosition()`
  - `takeStream()` / `dropStream()` / `startStreaming()` / `stopStreaming()`

If desired, it can also own the shared interaction state:

- `highlightedUserId`
- `highlightedUserName`
- `ignoredUserIds`
- `allowedListenerIDs`

### What it should *not* own

These should usually remain local to the visual components:

- canvas DOM references and drawing internals;
- chat log scroll position and selection behavior;
- toolbar textbox local state and focus helpers;
- popup layout/open-close presentation details;
- per-video drag/pin DOM state.

So `RoomSession` should own the **room/session model**, not every UI detail.

### Recommended pattern: state + commands + typed events

A good shape would be:

- **reactive/shared state** for long-lived facts (`users`, `currentRoom`, `streams`, etc.);
- **commands** for actions (`sendMessage`, `move`, `changeRoom`, `highlightUser`, ...);
- **events** only for one-shot notifications (`message received`, `connection lost`, `stream started`, etc.).

That distinction is important.

A pure event bus is not enough for stateful UI, because components then have to reconstruct state from past events. It is better if components can always read the current state directly and only use events for transient notifications.

### Rough interface sketch

Something along these lines would be reasonable:

```ts
interface RoomSession {
    state: {
        users: Users
        currentRoom: ClientRoom | null
        streams: StreamSlotDto[]
        serverStats: Stats
        highlightedUserId: string | null
        ignoredUserIds: Set<string>
        connectionLost: boolean
    }

    connectToServer(username: string, characterId: string): Promise<void>
    sendMessage(message: string): void
    move(direction: Direction): void
    setBubblePosition(position: Direction): void
    changeRoom(roomId: string, doorId?: string): void
    highlightUser(userId: string, userName: string): void

    on(eventName: string, handler: (payload: unknown) => void): () => void
}
```

The exact implementation style can vary, but the separation is the key part.

---

## Plan to move toward this architecture

### Phase 1: introduce `RoomSession` without changing the UI split yet

Create a new module, for example:

- `src/frontend/room-session.ts`

Initially, do **not** try to redesign everything. Just move the room/session logic behind `RoomSession` while leaving the current root component mostly intact.

**Goal of this phase:**
- the root still renders everything as before;
- but socket setup and session state start living in `RoomSession`.

### Phase 2: move websocket ownership first

The first chunk to move should be:

- `connectToServer()`
- `initializeSocket()`
- socket `.on(...)` handlers
- `updateRoomState()`

This is the cleanest seam, because all of this is already logically part of the same responsibility.

After this step, the root component should no longer contain most of the websocket plumbing directly.

### Phase 3: make the root read from `roomSession.state`

Once `RoomSession` owns the live session state, the root component can gradually stop owning these fields directly and instead consume:

- `roomSession.state.users`
- `roomSession.state.currentRoom`
- `roomSession.state.streams`
- `roomSession.state.serverStats`
- connection flags, etc.

At this point, `RoomSession` becomes the source of truth, while the root becomes mostly a composition layer.

### Phase 4: route cross-cutting actions through `RoomSession`

Move the actions that multiple sections depend on so that they are called through `RoomSession`:

- `highlightUser()`
- `ignoreUser()` / `unignoreUser()` / `blockUser()`
- `sendMessageToServer()` (or a renamed `sendMessage()`)
- `changeRoom()`
- stream lifecycle commands

The UI components should then emit intents upward, and the parent / `RoomSession` should perform the actual action.

### Phase 5: extract visual sections one by one

Once state ownership is cleaner, split the UI into visual components:

1. `ChatLogSection`
2. `ToolbarSection`
3. `StreamsSection`
4. `CanvasArea`

This order is still recommended, but now each extracted component can depend on the shared `RoomSession` object rather than reaching through the root's giant method list.

### Phase 6: keep the event bus narrow and typed

If an event system is added, use it for a **small number of clear domain events**, such as:

- `room-state-updated`
- `user-joined`
- `user-left`
- `user-message`
- `streams-updated`
- `connection-lost`
- `highlighted-user-changed`

Try to avoid turning it into a catch-all mechanism for every UI action.

A useful rule is:

- **persistent facts go in `state`**;
- **commands are explicit methods**;
- **transient notifications go through events**.

### Phase 7: optionally split `RoomSession` internally later

Once this is in place, `RoomSession` itself can be broken down internally into smaller services/composables, for example:

- `room-state-service`
- `stream-service`
- `chat-service`
- `user-selection-service`

But that can happen later. The first win is to remove the current “everything lives in `main.ts`” bottleneck.

---

## Recommended direction

If choosing between:

1. **split the UI into components only**, or
2. **introduce `RoomSession` and then split the UI**,

option **2** is likely the cleaner long-term architecture for this codebase.

A good practical compromise is:

- first create **`RoomSession`** and move websocket + shared state into it;
- then extract the visual components in small steps;
- keep `preferences` following the existing root-owned `setAndPersist()` pattern.

That gives you a structure where the UI components become much thinner, while the real application logic lives in one explicit domain object instead of being spread across template handlers and DOM code.
