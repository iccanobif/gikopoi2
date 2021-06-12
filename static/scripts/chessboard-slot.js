Vue.component('chessboard-slot', {
    props: ["socket"],
    data: function () {
        return {
            chessboard: null
        }
    },
    mounted: function () {
        const chessboardElement = document.getElementById("chessboard")
        this.chessboard = Chessboard(chessboardElement, {
            pieceTheme: 'chess/img/chesspieces/wikipedia/{piece}.png',
            position: 'start',
            draggable: true,
            onDragStart: (source, piece, position, orientation) => {
                // TODO
                // if (game is over or it's the other player's turn)
                //   return false
              },
            onDrop: (source, target) => {
                this.socket.emit("user-chess-move", source, target);
              }
              ,
            onSnapEnd: () => {
                // update the board position after the piece snap
                // for castling, en passant, pawn promotion
                // this.chessboard.position(game.fen())
            }
          })
    },
    template: "#chessboard-slot"
})