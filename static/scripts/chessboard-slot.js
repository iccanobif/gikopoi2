export default {
    props: ["chessboardState"],
    inject: ["socket", "users", "myUserId"],
    template: "#chessboard-slot",
    data()
    {
        return {
            chessboard: null,
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
            const chessboardElement = document.getElementById("chessboard")

            const position = this.chessboardState
                ? (this.chessboardState.fenString || "start")
                : "start"

            this.chessboard = Chessboard(chessboardElement, {
                pieceTheme: 'chess/img/chesspieces/wikipedia/{piece}.png',
                position,
                orientation: this.chessboardState.blackUserID == this.myUserId ? "black" : "white",
                draggable: true,
                onDragStart: (source, piece, position, orientation) =>
                {
                    // onDragStart prevents dragging if it returns false.
                    if (!this.chessboardState.blackUserID)
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
                onDrop: (source, target) =>
                {
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
            return this.chessboardState.blackUserID == this.myUserId 
                   || this.chessboardState.whiteUserID == this.myUserId
        },
    },
}
