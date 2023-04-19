export interface JankenStateDto {
    stage: string,
    namedPlayerId: string | null,
    player1Id: string | null,
    player2Id: string | null,
    player1Hand: "rock" | "paper" | "scissors" | null,
    player2Hand: "rock" | "paper" | "scissors" | null,
}
