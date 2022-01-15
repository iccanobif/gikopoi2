import { v4 } from "uuid";
import { rooms } from "./rooms";
import { settings } from "./settings";
import { Area, Direction, PlayerDto } from "./types";

function generateId()
{
    return v4()
}

const possibleVoicePitches = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
let lastUsedVoicePitchIndex = 0
let lastUsedSpawnPointIndex = 0

export class Player
{
    public id: string = generateId();
    public privateId: string | undefined = generateId();
    public name: string = "Anonymous";
    public position: { x: number, y: number };
    public direction: Direction;
    public lastDirection: Direction | null = null;
    public directionChangedAt: number | null = null;
    public isGhost: boolean = true;
    public roomId: string;
    public lastAction = Date.now();
    public connectionTime = Date.now();
    public disconnectionTime: number | null = null;
    public characterId: string;
    public areaId: Area;
    public isInactive = false;
    public bubblePosition: Direction = "up";
    public lastRoomMessage: string = "";
    public ip: string;
    public voicePitch: number;
    public socketId: string | null = null;
    public blockedIps: string[] = [];
    public lastMessageDates: number[] = [];
    public isAlternateCharacter: boolean = false;

    constructor(options: { name?: string, characterId: string, areaId: Area, roomId: string, ip: string })
    {
        if (options.areaId != "for" && options.areaId != "gen")
            throw "invalid area id"

        if (!(options.roomId in rooms))
            throw "invalid room id"

        this.roomId = options.roomId;
        const room = rooms[this.roomId]

        const spawn = (() => {
            if (room.worldSpawns)
            {
                lastUsedSpawnPointIndex = (lastUsedSpawnPointIndex + 1) % room.worldSpawns!.length
                return room.worldSpawns![lastUsedSpawnPointIndex]
            }
            else
            {
                return room.doors[room.spawnPoint]
            }
        })()
        
        this.direction = (spawn.direction !== null ? spawn.direction : "down")
        this.position = { x: spawn.x, y: spawn.y }
        
        if (typeof options.name === "string") this.name = options.name
        this.characterId = options.characterId
        this.areaId = options.areaId
        this.ip = options.ip
        lastUsedVoicePitchIndex = (lastUsedVoicePitchIndex + 1) % possibleVoicePitches.length
        this.voicePitch = possibleVoicePitches[lastUsedVoicePitchIndex]
    }
}

let users: { [id: string]: Player; } = {}

export function addNewUser(name: string, characterId: string, areaId: Area, roomId: string, ip: string)
{
    const p = new Player({ name, characterId, areaId, roomId, ip });
    users[p.id] = p;

    return p;
};

export function getConnectedUserList(roomId: string | null, areaId: string | null): Player[]
{
    let output = Object.values(users).filter(u => !u.isGhost)
    if (roomId) output = output.filter(u => u.roomId == roomId)
    if (areaId) output = output.filter(u => u.areaId == areaId)
    return output
};

export function getUsersByIp(ip: string, areaId: string | null): Player[]
{
    return Object.values(users)
        .filter(u => !areaId || u.areaId == areaId)
        .filter(u => u.ip == ip)
}

export function getAllUsers(): Player[]
{
    return Object.values(users)
}

export function getLoginUser(privateId: string): Player | null
{
    return Object.values(users)
        .find(u => u.privateId == privateId) || null
};

export function getUser(userId: string)
{
    return users[userId];
};

export function removeUser(user: Player)
{
    delete users[user.id];
}

export function restoreUserState(persistedUsers: Player[])
{
    users = persistedUsers.reduce((acc, val) => { 
            acc[val.id] = val; 
            return acc; 
        }, {} as { [id: string]: Player; })

    // Initialize all users as ghosts (they'll be unflagged when users connect again through the websocket)
    for (const user of Object.values(users))
    {
        user.isGhost = true;
        user.disconnectionTime = Date.now()
        if (user.blockedIps === undefined)
            user.blockedIps = []
        if (user.lastMessageDates === undefined)
            user.lastMessageDates = []
        if (user.lastRoomMessage.match(/(合言葉)|(あいことば)|(アイコトバ)|aikotoba/gi))
            user.lastRoomMessage = "٩(ˊᗜˋ*)و"
        user.lastRoomMessage = user.lastRoomMessage?.replace(/bread/g, "cocaine")
    }
    console.info("Restored user state (" + Object.values(users).length + " users)")
}

export function createPlayerDto(player: Player): PlayerDto
{
    return {
        id: player.id,
        name: player.name,
        position: player.position,
        direction: player.direction,
        roomId: player.roomId,
        characterId: player.characterId,
        isInactive: player.isInactive,
        bubblePosition: player.bubblePosition,
        voicePitch: player.voicePitch,
        lastRoomMessage: player.lastRoomMessage?.toLocaleLowerCase().match(settings.censoredWordsRegex) ? "" : player.lastRoomMessage,
        isAlternateCharacter: player.isAlternateCharacter,
    }
}

export function getFilteredConnectedUserList(user: Player, roomId: string | null, areaId: string)
{
    return getConnectedUserList(roomId, areaId)
        .filter((u) => u.id == user.id
            || (!user.blockedIps.includes(u.ip)
                && !u.blockedIps.includes(user.ip)))
}

export function setUserAsActive(user: Player)
{
    user.isInactive = false
    user.lastAction = Date.now()
}