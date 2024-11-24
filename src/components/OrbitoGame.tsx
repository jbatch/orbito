import React, { useEffect, useState } from "react";
import { availableConfigs } from "./orbitConfig";
import { Player, Board, Position, OrbitConfig, TurnPhase } from "./types";
import { RotateCcw } from "lucide-react";
import { OrbitBoard } from "./OrbitBoard";
import { OrbitConfigValidator } from "./configValidator";

const OrbitoGame: React.FC = () => {
  const [currentConfig, setCurrentConfig] = useState<OrbitConfig>(
    availableConfigs[0]
  );
  const initialBoard: Board = Array(4)
    .fill(null)
    .map(() => Array(4).fill(null));
  const [board, setBoard] = useState<Board>(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("BLACK");
  const [winner, setWinner] = useState<Player | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Position>(null);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>("MOVE_OPPONENT");

  useEffect(() => {
    // Validate all configurations when the game loads
    availableConfigs.forEach((config) => {
      const basicValidation = OrbitConfigValidator.validateConfig(config);
      const cycleValidation = OrbitConfigValidator.validateOrbitCycles(config);

      if (!basicValidation.isValid) {
        console.error(
          `Configuration ${config.name} failed basic validation:`,
          basicValidation.errors
        );
      }
      if (!cycleValidation.isValid) {
        console.error(
          `Configuration ${config.name} failed cycle validation:`,
          cycleValidation.errors
        );
      }
    });
  }, []);

  const rotateBoard = () => {
    const newBoard = board.map((row) => [...row]);

    currentConfig.paths.forEach((path) => {
      const [fromRow, fromCol] = path.position;
      const [toRow, toCol] = path.nextPosition;
      newBoard[toRow][toCol] = board[fromRow][fromCol];
    });

    setBoard(newBoard);
    checkWinner(newBoard);
  };

  const checkWinner = (currentBoard: Board) => {
    // Check rows and columns
    for (let i = 0; i < 4; i++) {
      // Check rows
      if (
        currentBoard[i][0] !== null &&
        currentBoard[i][0] === currentBoard[i][1] &&
        currentBoard[i][1] === currentBoard[i][2] &&
        currentBoard[i][2] === currentBoard[i][3]
      ) {
        setWinner(currentBoard[i][0]);
        return;
      }
      // Check columns
      if (
        currentBoard[0][i] !== null &&
        currentBoard[0][i] === currentBoard[1][i] &&
        currentBoard[1][i] === currentBoard[2][i] &&
        currentBoard[2][i] === currentBoard[3][i]
      ) {
        setWinner(currentBoard[0][i]);
        return;
      }
    }

    // Check diagonals
    if (
      currentBoard[0][0] !== null &&
      currentBoard[0][0] === currentBoard[1][1] &&
      currentBoard[1][1] === currentBoard[2][2] &&
      currentBoard[2][2] === currentBoard[3][3]
    ) {
      setWinner(currentBoard[0][0]);
      return;
    }

    if (
      currentBoard[0][3] !== null &&
      currentBoard[0][3] === currentBoard[1][2] &&
      currentBoard[1][2] === currentBoard[2][1] &&
      currentBoard[2][1] === currentBoard[3][0]
    ) {
      setWinner(currentBoard[0][3]);
      return;
    }
  };

  const getValidMoves = (row: number, col: number): Position[] => {
    const moves: Position[] = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]; // up, down, left, right

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      if (
        newRow >= 0 &&
        newRow < 4 &&
        newCol >= 0 &&
        newCol < 4 &&
        board[newRow][newCol] === null
      ) {
        moves.push([newRow, newCol]);
      }
    }

    return moves;
  };

  const isValidMove = (row: number, col: number): boolean => {
    if (!selectedPiece) return false;
    return getValidMoves(selectedPiece[0], selectedPiece[1]).some(
      (position) => position![0] === row && position![1] === col
    );
  };

  const handleCellClick = (row: number, col: number) => {
    if (winner) return;

    if (turnPhase === "MUST_ROTATE") {
      return; // No more moves allowed until rotation
    }

    if (turnPhase === "MOVE_OPPONENT") {
      // If clicking on opponent's piece
      if (board[row][col] === (currentPlayer === "BLACK" ? "WHITE" : "BLACK")) {
        if (
          selectedPiece &&
          selectedPiece[0] === row &&
          selectedPiece[1] === col
        ) {
          // Unselect if clicking the same piece
          setSelectedPiece(null);
        } else {
          // Select new piece
          setSelectedPiece([row, col]);
        }
        return;
      }

      // If we have a selected piece and clicking on a valid move location
      if (selectedPiece && isValidMove(row, col)) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = board[selectedPiece[0]][selectedPiece[1]];
        newBoard[selectedPiece[0]][selectedPiece[1]] = null;
        setBoard(newBoard);
        setSelectedPiece(null);
        setTurnPhase("PLACE_PIECE");
        return;
      }

      // If clicking an empty space without moving opponent's piece,
      // directly place the piece and move to MUST_ROTATE
      if (board[row][col] === null && !selectedPiece) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        setSelectedPiece(null);
        setTurnPhase("MUST_ROTATE");
        return;
      }
    }

    if (turnPhase === "PLACE_PIECE") {
      // Only allow placing a piece in an empty cell
      if (board[row][col] === null) {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        setSelectedPiece(null);
        setTurnPhase("MUST_ROTATE");
      }
    }
  };

  const handleRotate = () => {
    if (turnPhase !== "MUST_ROTATE") {
      return; // Can't rotate until a piece has been placed
    }

    rotateBoard();
    setCurrentPlayer(currentPlayer === "BLACK" ? "WHITE" : "BLACK");
    setTurnPhase("MOVE_OPPONENT");
    setSelectedPiece(null);
  };

  const getStatusMessage = () => {
    if (winner) return `${winner} Wins!`;

    const messages = {
      MOVE_OPPONENT: `${currentPlayer}'s Turn - Optionally move an opponent's piece`,
      PLACE_PIECE: `${currentPlayer}'s Turn - Place your piece`,
      MUST_ROTATE: `${currentPlayer}'s Turn - Press rotate to end turn`,
    };

    return messages[turnPhase];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="mb-4">
        <select
          className="p-2 border rounded"
          value={currentConfig.name}
          onChange={(e) => {
            const newConfig = availableConfigs.find(
              (c) => c.name === e.target.value
            );
            if (newConfig) setCurrentConfig(newConfig);
          }}
        >
          {availableConfigs.map((config) => (
            <option key={config.name} value={config.name}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 text-xl font-bold text-center">
        <div>{getStatusMessage()}</div>
      </div>

      <div className="relative">
        <OrbitBoard
          board={board}
          selectedPiece={selectedPiece}
          isValidMove={isValidMove}
          orbitConfig={currentConfig}
          onCellClick={handleCellClick}
        />

        <button
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     w-12 h-12 rounded-full border-2 border-black 
                     flex items-center justify-center
                     transition-colors focus:outline-none shadow-lg
                     ${
                       turnPhase === "MUST_ROTATE"
                         ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                         : "bg-gray-400 cursor-not-allowed"
                     }`}
          onClick={handleRotate}
          disabled={turnPhase !== "MUST_ROTATE"}
        >
          <RotateCcw className="text-black" size={24} />
        </button>
      </div>
    </div>
  );
};

export default OrbitoGame;
