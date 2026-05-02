import { io, type Socket } from "socket.io-client";

import type {
  ClientRoom,
  Direction,
  RoomStateDto,
  Stats,
  StreamSlotDto,
  Users,
} from "./types";
import { postJson } from "./utils";

export interface ConnectToServerResult {
  userId: string;
  privateUserId: string;
  pageRefreshRequired: boolean;
  initialRoomState: RoomStateDto;
}

// TODO: make createRoomSession() function, so that I can set more stuff in the state to nonullable.

export class RoomSession {
  state: {
    users: Users;
    currentRoom: ClientRoom | null;
    streams: StreamSlotDto[];
    serverStats: Stats;
    highlightedUserId: string | null;
    highlightedUserName: string | null;
    ignoredUserIds: Set<string>;
    connectionLost: boolean;
  };
  socket: Socket | null = null;
  myUserID: string | null = null;
  myPrivateUserID: string | null = null;
  pageRefreshRequired = false;

  private readonly highlightUserEventHandlers = new Set<(userId: string | null, userName: string | null) => void>();

  constructor() {
    this.state = {
      users: {},
      currentRoom: null,
      streams: [],
      serverStats: {
        streamCount: 0,
        userCount: 0,
      },
      highlightedUserId: null,
      highlightedUserName: null,
      ignoredUserIds: new Set(),
      connectionLost: false,
    };
  }

  // Called only once during login
  async connectToServer(
    username: string,
    characterId: string,
    areaId: string,
    roomId: string
  ): Promise<ConnectToServerResult> {
    const loginResponse = await postJson("/api/login", {
      userName: username,
      characterId,
      areaId,
      roomId,
    });
    const loginMessage = (await loginResponse.json()) as {
      isLoginSuccessful: boolean;
      error?: string;
      userId: string;
      privateUserId: string;
      appVersion: number;
    };

    if (!loginMessage.isLoginSuccessful) {
      throw new Error(loginMessage.error || "Login failed");
    }

    this.myUserID = loginMessage.userId;
    this.myPrivateUserID = loginMessage.privateUserId;
    this.pageRefreshRequired = window.EXPECTED_SERVER_VERSION != loginMessage.appVersion;

    const response = await fetch("/api/areas/" + areaId + "/rooms/" + roomId, {
      headers: { "Authorization": "Bearer " + this.myPrivateUserID },
    });
    if (!response.ok) {
      throw new Error(response.status + " " + response.statusText);
    }

    const initialRoomState = (await response.json()) as RoomStateDto;
    this.state.currentRoom = initialRoomState.currentRoom as ClientRoom;
    this.state.streams = initialRoomState.streams;

    return {
      userId: this.myUserID,
      privateUserId: this.myPrivateUserID,
      pageRefreshRequired: this.pageRefreshRequired,
      initialRoomState,
    };
  }

  initializeSocket() {
    if (!this.myPrivateUserID) {
      throw new Error("Cannot initialize socket before login");
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io({
      extraHeaders: { "private-user-id": this.myPrivateUserID },
      closeOnBeforeunload: false,
    });
    this.state.connectionLost = false;
  }

  sendMessage(message: string) {
    this.requireSocket().emit("user-msg", message);
  }

  move(direction: Direction) {
    this.requireSocket().emit("user-move", direction);
  }

  setBubblePosition(position: Direction) {
    this.requireSocket().emit("user-bubble-position", position);
  }

  changeRoom(roomId: string, doorId?: string) {
    this.requireSocket().emit("user-change-room", {
      targetRoomId: roomId,
      targetDoorId: doorId,
    });
  }

  highlightUser(userId: string | null, userName: string | null) {
    this.state.highlightedUserId = this.state.highlightedUserId == userId ? null : userId;
    this.state.highlightedUserName = this.state.highlightedUserId ? userName : null;
    for (const handler of this.highlightUserEventHandlers) {
      handler(this.state.highlightedUserId, this.state.highlightedUserName);
    }
  }

  registerHighlightUserEventHandler(handler: (userId: string | null, userName: string | null) => void) {
    this.highlightUserEventHandlers.add(handler);
  }

  private requireSocket(): Socket {
    if (!this.socket) {
      throw new Error("Socket is not initialized yet");
    }

    return this.socket;
  }
}
