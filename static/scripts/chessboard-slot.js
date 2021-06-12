Vue.component('chessboard-slot', {
    props: ["socket"],
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
    methods:
    {
        buildChessboard: function ()
        {
            const chessboardElement = document.getElementById("chessboard")

            this.chessboard = Chessboard(chessboardElement, {
                pieceTheme: 'chess/img/chesspieces/wikipedia/{piece}.png',
                position: 'start',
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
        }
    },
})