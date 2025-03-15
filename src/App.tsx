import React, { useState, useCallback, useEffect } from 'react';
import { GameLogic } from './gameLogic';
import { Piece } from './types';

const game = new GameLogic();

function App() {
  const [gameState, setGameState] = useState(game.getState());

  const updateState = useCallback(() => {
    setGameState(game.getState());
  }, []);

  const handlePieceSelect = (pieceId: number) => {
    game.selectPiece(pieceId);
    updateState();
  };

  const handleRotate = (direction: 'clockwise' | 'anticlockwise') => {
    game.rotatePiece(direction);
    updateState();
  };

  const handlePlacePiece = (position: number) => {
    game.placePiece(position);
    updateState();
  };

  const handleCheckSolution = () => {
    game.checkSolution();
    updateState();
  };

  const handleReset = () => {
    game.resetGame();
    updateState();
  };

  const renderPiece = (piece: Piece, isBoard: boolean = false) => (
    <div 
      key={piece.id}
      className={`piece ${gameState.selectedPieceId === piece.id ? 'selected' : ''} ${isBoard ? 'board-piece' : 'available-piece'}`}
      style={{ transform: `rotate(${piece.rotation}deg)` }}
      onClick={() => handlePieceSelect(piece.id)}
    >
      <div className="edge top">{piece.edges[0]}</div>
      <div className="edge right">{piece.edges[1]}</div>
      <div className="edge bottom">{piece.edges[2]}</div>
      <div className="edge left">{piece.edges[3]}</div>
      <div className="piece-id">{piece.id + 1}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">MacMahon Squares Puzzle</h1>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Select a piece from the available pieces below</li>
            <li>Use rotation buttons to orient the piece as needed</li>
            <li>Click on an empty cell in the grid to place the piece</li>
            <li>Match adjacent edges with the same symbols</li>
            <li>Complete the puzzle by placing all pieces correctly</li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <div className="text-lg font-medium">{gameState.message}</div>
          {gameState.checkResult && (
            <div className={`mt-2 p-3 rounded ${
              gameState.checkResult.startsWith('Success') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {gameState.checkResult}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {gameState.board.map((pieceId, index) => (
            <div 
              key={index}
              className={`aspect-square bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer
                ${pieceId !== null ? 'bg-yellow-50' : 'hover:bg-gray-100'}`}
              onClick={() => handlePlacePiece(index)}
            >
              {pieceId !== null ? (
                renderPiece(gameState.pieces.find(p => p.id === pieceId)!, true)
              ) : (
                <span className="text-gray-400">Empty</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleRotate('anticlockwise')}
          >
            Rotate Anticlockwise
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleRotate('clockwise')}
          >
            Rotate Clockwise
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handleCheckSolution}
          >
            Check Solution
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            onClick={() => {
              game.solvePuzzle();
              updateState();
            }}
          >
            Solve Puzzle
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleReset}
          >
            Reset Puzzle
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">Available Pieces</h2>
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {game.getAvailablePieces().map(piece => (
              <div key={piece.id} className="w-24 h-24 flex items-center justify-center">
                {renderPiece(piece)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;