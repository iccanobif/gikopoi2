<script lang="ts">
import type { PropType } from 'vue'
import type { Socket } from 'socket.io-client'

import type { Users, ChessboardStateDto,  } from './types'

import { defineComponent, inject, Ref } from 'vue'

export default defineComponent({
    props: {
        chessboardState: { type: Object as PropType<ChessboardStateDto>, required: true }
    },
    template: "#chessboard-slot",
    setup() // hacky way to make injects type safe, using composition API's setup method
    {
        return {
            socket: inject('socket') as Ref<Socket>,
            users: inject('users') as Ref<Users>,
            myUserId: inject('myUserId') as Ref<string>
        }
    },
    data()
    {
        const chessboard: any | null = null
        return {
            chessboard,
            visible: false,
        }
    },
    mounted()
    {
        if (!this.chessboard && this.chessboardState && this.chessboardState.blackUserID)
        {
            this.buildChessboard()
            this.makeResizable()
        }
    },
    watch:
    {
        chessboardState: function (newVal, oldVal)
        {
            if ((!this.chessboard && newVal.fenString)
                || (!oldVal.blackUserID && newVal.blackUserID))
            {
                this.buildChessboard()
                this.makeResizable()
            }

            if (this.chessboard && newVal)
            {
                this.chessboard.position(newVal.fenString)
            }
        }
    },
    methods:
    {
        buildChessboard()
        {
            if (!this.chessboardState) return
            const chessboardElement = document.getElementById("chessboard")

            const position = this.chessboardState
                ? (this.chessboardState.fenString || "start")
                : "start"

            this.chessboard = (window as any).Chessboard(chessboardElement, {
                pieceTheme: 'chess/img/chesspieces/wikipedia/{piece}.png',
                position,
                orientation: this.chessboardState.blackUserID == this.myUserId ? "black" : "white",
                draggable: true,
                onDragStart: () => // Not used so didn't add types: source, piece, position, orientation
                {
                    // onDragStart prevents dragging if it returns false.
                    if (!this.chessboardState || !this.chessboardState.blackUserID)
                        return false

                    // Don't move when it's not your turn
                    if (this.chessboardState.turn == "w" && this.chessboardState.blackUserID == this.myUserId)
                        return false

                    if (this.chessboardState.turn == "b" && this.chessboardState.whiteUserID == this.myUserId)
                        return false

                    // Don't move the other player's pieces
                    // console.log(source, piece, position, orientation)
                    // const colorOfMovedPiece = piece[source][0]
                    // if (colorOfMovedPiece != this.chessboardState.turn)
                    //     return false
                },
                onDrop: (source: any, target: any) =>
                {
                    if (!this.chessboardState) return
                    if (this.chessboardState.blackUserID == this.myUserId
                        || this.chessboardState.whiteUserID == this.myUserId)
                    {
                        this.socket.emit("user-chess-move", source, target);
                    }
                },
                onSnapEnd: () =>
                {
                    // update the board position after the piece snap
                    // for castling, en passant, pawn promotion
                    // this.chessboard.position(game.fen())
                }
            })
        },
        makeResizable()
        {
            // $("#chessboard").resizable({
            //     aspectRatio: true,
            //     resize: (event, ui) =>
            //     {
            //         this.buildChessboard()
            //     },
            //     stop: () => 
            //     {
            //         // TODO Understand why after the first resize operation the chessboard stops
            //         // being resizable

            //         // console.log("stop")
            //         // setTimeout(() => this.makeResizable(), 100)
            //     }
            // })
        },
        wantToJoinGame()
        {
            this.socket.emit("user-want-to-play-chess")
            this.visible = true
        },
        wantToQuitGame()
        {
            this.socket.emit("user-want-to-quit-chess")
        },
        wantToDisplayGame()
        {
            this.visible = true
        },
        wantToHideGame()
        {
            this.visible = false
        },
        amIPlaying()
        {
            if (!this.chessboardState) return
            return this.chessboardState.blackUserID == this.myUserId 
                   || this.chessboardState.whiteUserID == this.myUserId
        },
    },
})
</script>

<template>
    <div class="slot-wrapper chessboard-slot-wrapper">
        <div>{{ $t("ui.chess_slot_title") }}</div>
        <button v-on:click="wantToDisplayGame()"
                v-if="!visible"
                v-bind:class="{'red-button': chessboardState.blackUserID || chessboardState.whiteUserID}">
            {{ $t("ui.game_display")}}
        </button>
        <button v-on:click="wantToHideGame()" v-if="visible">
            {{ $t("ui.game_hide")}}
        </button>
        <button v-on:click="wantToJoinGame()" v-if="!amIPlaying() && !chessboardState.blackUserID">
            {{ $t("ui.game_join")}}
        </button>
        <button v-on:click="wantToQuitGame()" v-if="amIPlaying()">
            {{ $t("ui.game_quit")}}
        </button>
        <div v-show="visible">
            <div>
            {{ !chessboardState.whiteUserID ? $t("ui.chess_waiting_for_white")
                : !chessboardState.blackUserID ? $t("ui.chess_waiting_for_black")
                : "" }}
            </div>
            <span v-if="chessboardState.whiteUserID" v-bind:class="{'next-move-chess-player': chessboardState.turn == 'w'}">
                {{ $t("ui.chess_white") }}{{ users[chessboardState.whiteUserID]
                                            ? users[chessboardState.whiteUserID].name
                                            : "N/A" }}
            </span>
            <span v-if="chessboardState.blackUserID" v-bind:class="{'next-move-chess-player': chessboardState.turn == 'b'}">
                {{ $t("ui.chess_black") }}{{ users[chessboardState.blackUserID]
                                             ? users[chessboardState.blackUserID].name
                                             : "N/A" }}
            </span>
            <div
                id="chessboard"
                v-show="chessboardState.fenString"
                style="width: 300px"></div>
        </div>
    </div>
</template>
