import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


function Square(props) {
    return (
      <button className="square" 
              onClick={props.onClick}
      >
        { props.value }
      </button>
    );
}

class Board extends React.Component {

  renderSquare(i) {
    return <Square 
      value={this.props.getLabelForSquareId(i)}
      onClick={() => this.props.handleMovePerformed(i)} 
    />;
  }

  render() {    
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayHistoryUntilIdx: null,
      moves: []
    }

    this.handleMovePerformed.bind(this);
    this.getLabelForSquareId.bind(this);
    this.handleMoveToState.bind(this);
  }

  handleMovePerformed(id) {
    // game over
    if(this.hasSmdWon())
      return;

    // already moved, i.e is the field already occupied?
    for(let i=0;
        i<(this.state.displayHistoryUntilIdx == null ? this.state.moves.length : this.state.displayHistoryUntilIdx);
        ++i) 
      if(this.state.moves[i].id === id) {
        console.log("Already moved => return!");
        return;
      }

    this.setState(
      state => {
        let moves_deep_copy = [];
        for(let i=0; i<state.moves.length; ++i) {

          // after having gone back in history to move x another move is being performed
          // throw away all moves after move x
          if(state.displayHistoryUntilIdx != null && i===state.displayHistoryUntilIdx) {
            break;
          }

          let move_deep_copy = {...state.moves[i]};
          moves_deep_copy.push(move_deep_copy);
        }

        moves_deep_copy.push({id: id});
        
        return {
          displayHistoryUntilIdx: null,
          moves: moves_deep_copy,
        };
    })
  }

  getLabelForSquareId(id) {
    for(let i=0; i<this.state.moves.length; ++i)
      if(this.state.displayHistoryUntilIdx != null && i === this.state.displayHistoryUntilIdx)
        break
      else if(this.state.moves[i].id === id)
        if(i % 2)
          return "X"
        else
          return "O";

    return;
  }

  checkWin(playerFields) {
    playerFields.sort();
   
    const winningIndices = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ]

    for(let winningIdx of winningIndices) {
      let counter = 0;
      for(let occupiedIdx of playerFields)
        if(occupiedIdx !== winningIdx[counter])
          continue;
        else
          counter++;
      
      if(counter === 3) 
        // return the winningIndices (possibility to turn these indices into another colour)
        return winningIndices;
    }

    return null;
  }

  hasSmdWon() {
    // we moved back, a historical configuration can't be a winning one
    if(this.state.displayHistoryUntilIdx != null)
      return null;

    let playerOfields = []; 
    let playerXfields = [];
    for(let i=0; i<this.state.moves.length; ++i)
      if(i % 2)
        playerXfields.push(this.state.moves[i].id)
      else
        playerOfields.push(this.state.moves[i].id);

    if(this.checkWin(playerXfields))
      return "X"
    else if (this.checkWin(playerOfields))
      return "O"
    else
      return null;
  }

  handleMoveToState(moveNumber) {
    if(moveNumber === this.state.moves.length) 
      // moved to the very last state -> from here the game just continues
      this.setState({displayHistoryUntilIdx: null})
    else
      this.setState({displayHistoryUntilIdx: moveNumber});
  }

  render() {
    let status = null; 
    let winner = this.hasSmdWon();
    if(winner)
      status = winner + " wins!";
    else if(this.state.displayHistoryUntilIdx === null)
      status = 'Next player: ' + (this.state.moves.length % 2 ? "X" : "O");
    else
      status = 'Next player: ' + (this.state.displayHistoryUntilIdx % 2 ? "X" : "O");

    let moveToStateButtons = this.state.moves.map(
      (move, moveNumber) => {
        return(
          <li key={moveNumber}>
            <button
              onClick={() => this.handleMoveToState(moveNumber)}             
            >
              {moveNumber > 0 ? 
                "Go back to move #" + moveNumber :
                "Go back to start"}
            </button>
          </li>
        );
      }
    );
    
    if(this.state.moves.length>0)
      moveToStateButtons.push(
        <li key={this.state.moves.length}>
          <button
            onClick={() => this.handleMoveToState(this.state.moves.length)}             
          >
            Go to last move.
          </button>
        </li>
      )
    

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            getLabelForSquareId={this.getLabelForSquareId.bind(this)}
            handleMovePerformed={this.handleMovePerformed.bind(this)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ul>{moveToStateButtons}</ul>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
