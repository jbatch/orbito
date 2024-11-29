import React from "react";
import { RotateCcw } from "lucide-react";
import { OrbitBoard } from "./OrbitBoard";
import { useGame } from "./GameContext";
import Header from "./Header";
import { useNetwork } from "./NetworkContext";
import GameStatus from "./GameStatus";

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
  const { isMultiplayer, localPlayer } = useNetwork();

  const canRotate =
    turnPhase === "MUST_ROTATE" &&
    !isRotating &&
    (!isMultiplayer || currentPlayer === localPlayer);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <GameStatus
          winner={winner}
          turnPhase={turnPhase}
          currentPlayer={currentPlayer}
          playerStats={{
            black: { wins: 0, draws: 0 },
            white: { wins: 0, draws: 0 },
          }}
        />

        <div className="relative">
          <OrbitBoard board={board} isValidMove={isValidMove} />

          <button
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                       w-12 h-12 rounded-full border-2 border-black 
                       flex items-center justify-center
                       transition-colors focus:outline-none shadow-lg
                       ${
                         canRotate
                           ? "ring-2 ring-blue-300 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                           : "bg-gray-400 cursor-not-allowed"
                       }`}
            onClick={() => handleRotate()}
            disabled={!canRotate}
          >
            <RotateCcw className="text-black" size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default OrbitoGame;
