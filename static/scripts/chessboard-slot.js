Vue.component('chessboard-slot', {
    props: ["socket", "chessboardState", "users"],
    template: "#chessboard-slot",
    data: function ()
    {
        return {
            chessboard: null,
            visible: false,
        }
    },
    mounted: function ()
    {

    },
    watch:
    {
        chessboardState: function (newVal, oldVal)
        {
            console.log("changed chessboardState", newVal, oldVal)

            // initialize chessboard when game starts (that is, when a black player joins)
            if (!this.chessboard && newVal.blackUserID)
            {
                this.buildChessboard()
                this.makeResizable()
            }

            if (!newVal.blackUserID)
            {
                this.chessboard = null
            }

            if (this.chessboard && newVal)
            {
                this.chessboard.position(newVal.fenString)
            }
        }
    },
    methods:
    {
        buildChessboard: function ()
        {
            console.log("buildChessboard", myUserID)
            const chessboardElement = document.getElementById("chessboard")

            const position = this.chessboardState
                ? (this.chessboardState.position || "start")
                : "start"

            this.chessboard = Chessboard(chessboardElement, {
                pieceTheme: 'chess/img/chesspieces/wikipedia/{piece}.png',
                position,
                orientation: this.chessboardState.blackUserID == myUserID ? "black" : "white",
                draggable: true,
                onDragStart: (source, piece, position, orientation) =>
                {
                    // TODO
                    // if (game is over or it's the other player's turn)
                    //   return false
                },
                onDrop: (source, target) =>
                {
                    this.socket.emit("user-chess-move", source, target);
                },
                onSnapEnd: () =>
                {
                    // update the board position after the piece snap
                    // for castling, en passant, pawn promotion
                    // this.chessboard.position(game.fen())
                }
            })
        },
        makeResizable: function ()
        {
            $("#chessboard").resizable({
                aspectRatio: true,
                resize: (event, ui) =>
                {
                    this.buildChessboard()
                },
                stop: () => 
                {
                    // TODO Understand why after the first resize operation the chessboard stops
                    // being resizable

                    // console.log("stop")
                    // setTimeout(() => this.makeResizable(), 100)
                }
            })
        },
        wantToJoinGame: function ()
        {
            this.socket.emit("user-want-to-play-chess")
            this.visible = true
        },
        wantToQuitGame: function ()
        {
            this.socket.emit("user-want-to-quit-chess")
        },
        wantToDisplayGame: function ()
        {
            this.visible = true
        },
        wantToHideGame: function ()
        {
            this.visible = false
        },
        amIPlaying: function ()
        {
            return this.chessboardState.blackUserID == myUserID 
                   || this.chessboardState.whiteUserID == myUserID
        },
    },
})