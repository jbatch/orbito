import React from "react";
import { RotateCcw } from "lucide-react";
import { OrbitBoard } from "./OrbitBoard";
import { useGame } from "./GameContext";
import Header from "./Header";

const OrbitoGame: React.FC = () => {
  const {
    board,
    currentPlayer,
    winner,
    turnPhase,
    isRotating,
    isValidMove,
    handleRotate,
  } = useGame();

  const getStatusMessage = () => {
    if (winner === "DRAW") return "Game Over - It's a Draw!";
    if (winner) return `${winner} Wins!`;

    const messages = {
      MOVE_OPPONENT: `${currentPlayer}'s Turn - Optionally move an opponent's piece`,
      PLACE_PIECE: `${currentPlayer}'s Turn - Place your piece`,
      MUST_ROTATE: `${currentPlayer}'s Turn - Press rotate to end turn`,
    };

    return messages[turnPhase];
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-4 text-xl font-bold text-center">
          <div>{getStatusMessage()}</div>
        </div>

        <div className="relative">
          <OrbitBoard board={board} isValidMove={isValidMove} />

          <button
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       w-12 h-12 rounded-full border-2 border-black 
                       flex items-center justify-center
                       transition-colors focus:outline-none shadow-lg
                       ${
                         turnPhase === "MUST_ROTATE" && !isRotating
                           ? "ring-2 ring-blue-300 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                           : "bg-gray-400 cursor-not-allowed"
                       }`}
            onClick={() => handleRotate()}
            disabled={turnPhase !== "MUST_ROTATE" || isRotating}
          >
            <RotateCcw className="text-black" size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrbitoGame;
