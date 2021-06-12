Vue.component('chessboard-slot', {
    props: ["socket", "chessboardState", "users"],
    template: "#chessboard-slot",
    data: function ()
    {
        return {
            chessboard: null
        }
    },
    mounted: function ()
    {
        this.buildChessboard()
        this.makeResizable()
    },
    watch: 
    {
        chessboardState: function(newVal, oldVal)
        {
            console.log("changed chessboardState", newVal, oldVal)
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
            console.log("buildChessboard")
            const chessboardElement = document.getElementById("chessboard")

            const position = this.chessboardState 
                             ? (this.chessboardState.position || "start") 
                             : "start"

            this.chessboard = Chessboard(chessboardElement, {
                pieceTheme: 'chess/img/chesspieces/wikipedia/{piece}.png',
                position,
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
        wantToStartPlaying: function () {
            this.socket.emit("user-want-to-play-chess")
        },
    },
})