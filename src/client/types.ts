import User from './user.js'

export interface Users { [id: string]: User }
export type IgnoredUserIds = Set<string>

export interface JankenState { // Same as server's JankenStateDTO, could be shared
    stage: string,
    namedPlayerId: string | null,
    player1Id: string | null,
    player2Id: string | null,
    player1Hand: "rock" | "paper" | "scissors" | null,
    player2Hand: "rock" | "paper" | "scissors" | null,
}
