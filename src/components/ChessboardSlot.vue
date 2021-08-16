<template>
  <div class="chessboard-slot-wrapper" v-if="chessboardState">
    <div>{{ $t("ui.chess_slot_title") }}</div>
    <button
      v-on:click="wantToDisplayGame()"
      v-if="!visible"
      v-bind:class="{
        'red-button':
          chessboardState.blackUserID || chessboardState.whiteUserID,
      }"
    >
      {{ $t("ui.chess_display_game") }}
    </button>
    <button v-on:click="wantToHideGame()" v-if="visible">
      {{ $t("ui.chess_hide_game") }}
    </button>
    <button
      v-on:click="wantToJoinGame()"
      v-if="!amIPlaying() && !chessboardState.blackUserID"
    >
      {{ $t("ui.chess_join_game") }}
    </button>
    <button v-on:click="wantToQuitGame()" v-if="amIPlaying()">
      {{ $t("ui.chess_quit_game") }}
    </button>
    <div v-show="visible">
      <div>
        {{
          $t(
            !chessboardState.whiteUserID
              ? "ui.chess_waiting_for_white"
              : !chessboardState.blackUserID
              ? "ui.chess_waiting_for_black"
              : ""
          )
        }}
      </div>
      <span
        v-if="chessboardState.whiteUserID"
        v-bind:class="{ 'next-move-chess-player': chessboardState.turn == 'w' }"
      >
        {{ $t("ui.chess_white")
        }}{{
          users[chessboardState.whiteUserID]
            ? users[chessboardState.whiteUserID].name || $t("default_user_name")
            : "N/A"
        }}
      </span>
      <span
        v-if="chessboardState.blackUserID"
        v-bind:class="{ 'next-move-chess-player': chessboardState.turn == 'b' }"
      >
        {{ $t("ui.chess_black")
        }}{{
          users[chessboardState.blackUserID]
            ? users[chessboardState.blackUserID].name || $t("default_user_name")
            : "N/A"
        }}
      </span>
      <div
        id="chessboard"
        v-show="chessboardState.fenString"
        style="width: 300px"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ChessBoard } from "chessboardjs"

export default defineComponent({
  name: "ChessboardSlot",
  props: ["socket", "chessboardState", "users", "myUserId"],
  data: function () {
    return {
      chessboard: null as any,
      visible: false,
    };
  },
  mounted: function () {
    if (
      !this.chessboard &&
      this.chessboardState &&
      this.chessboardState.blackUserID
    ) {
      this.buildChessboard();
      this.makeResizable();
    }
  },
  watch: {
    chessboardState: function (newVal, oldVal) {
      const chessboard = this.chessboard;

      if (
        (!chessboard && newVal.fenString) ||
        (!oldVal.blackUserID && newVal.blackUserID)
      ) {
        this.buildChessboard();
        this.makeResizable();
      }

      if (chessboard && newVal) {
        chessboard.position(newVal.fenString);
      }
    },
  },
  methods: {
    buildChessboard: function () {
      const chessboardElement = document.getElementById("chessboard");

      const position = this.chessboardState
        ? this.chessboardState.fenString || "start"
        : "start";

      this.chessboard = ChessBoard(chessboardElement, {
        pieceTheme: "chess/img/chesspieces/wikipedia/{piece}.png",
        position,
        orientation:
          this.chessboardState.blackUserID == this.myUserId ? "black" : "white",
        draggable: true,
        onDragStart: () => {
          // onDragStart prevents dragging if it returns false.
          if (!this.chessboardState.blackUserID) return false;

          // Don't move when it's not your turn
          if (
            this.chessboardState.turn == "w" &&
            this.chessboardState.blackUserID == this.myUserId
          )
            return false;

          if (
            this.chessboardState.turn == "b" &&
            this.chessboardState.whiteUserID == this.myUserId
          )
            return false;
        },
        onDrop: () => {
          // I think the index.d.ts file for @types/chessboardjs is wrong, as
          // all callbacks in BoardConfig seem to have no arguments...
          const source = arguments[0]
          const target = arguments[1]
          
          if (
            this.chessboardState.blackUserID == this.myUserId ||
            this.chessboardState.whiteUserID == this.myUserId
          ) {
            this.socket.emit("user-chess-move", source, target);
          }
        },
        onSnapEnd: () => {
          // update the board position after the piece snap
          // for castling, en passant, pawn promotion
          // this.chessboard.position(game.fen())
        },
      });
    },
    makeResizable: function () {
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
    wantToJoinGame: function () {
      this.socket.emit("user-want-to-play-chess");
      this.visible = true;
    },
    wantToQuitGame: function () {
      this.socket.emit("user-want-to-quit-chess");
    },
    wantToDisplayGame: function () {
      this.visible = true;
    },
    wantToHideGame: function () {
      this.visible = false;
    },
    amIPlaying: function () {
      return (
        this.chessboardState.blackUserID == this.myUserId ||
        this.chessboardState.whiteUserID == this.myUserId
      );
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
