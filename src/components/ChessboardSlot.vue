<template>
    <div class="chessboard-slot-wrapper">
        <div>{{ $t("ui.chess_slot_title") }}</div>
        <button v-on:click="wantToDisplayGame()"
                v-if="!visible"
                v-bind:class="{'red-button': chessboardState.blackUserID || chessboardState.whiteUserID}">
            {{ $t("ui.chess_display_game")}}
        </button>
        <button v-on:click="wantToHideGame()" v-if="visible">
            {{ $t("ui.chess_hide_game")}}
        </button>
        <button v-on:click="wantToJoinGame()" v-if="!amIPlaying() && !chessboardState.blackUserID">
            {{ $t("ui.chess_join_game")}}
        </button>
        <button v-on:click="wantToQuitGame()" v-if="amIPlaying()">
            {{ $t("ui.chess_quit_game")}}
        </button>
        <div v-show="visible">
            <div>
            {{ $t(!chessboardState.whiteUserID ? "ui.chess_waiting_for_white"
                : !chessboardState.blackUserID ? "ui.chess_waiting_for_black"
                : "") }}
            </div>
            <span v-if="chessboardState.whiteUserID" v-bind:class="{'next-move-chess-player': chessboardState.turn == 'w'}">
                {{ $t("ui.chess_white") }}{{ users[chessboardState.whiteUserID]
                                            ? (users[chessboardState.whiteUserID].name || $t("default_user_name"))
                                            : "N/A" }}
            </span>
            <span v-if="chessboardState.blackUserID" v-bind:class="{'next-move-chess-player': chessboardState.turn == 'b'}">
                {{ $t("ui.chess_black") }}{{ users[chessboardState.blackUserID]
                                              ? (users[chessboardState.blackUserID].name || $t("default_user_name"))
                                              : "N/A" }} 
            </span>
            <div 
                id="chessboard"
                v-show="chessboardState.fenString"
                style="width: 300px"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
