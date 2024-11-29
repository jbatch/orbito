import { useNetwork } from "./NetworkContext";
import { Player, TurnPhase } from "./types";

interface Stats {
  wins: number;
  draws: number;
}

interface GameStatusProps {
  turnPhase: TurnPhase;
  currentPlayer: "BLACK" | "WHITE";
  winner: Player | "DRAW" | null;
  playerStats?: {
    black: Stats;
    white: Stats;
  };
}

const GameStatus = ({
  turnPhase,
  currentPlayer,
  playerStats,
  winner,
}: GameStatusProps) => {
  const { isMultiplayer, localPlayer, peers, socketId } = useNetwork();

  const getOpponentId = () => {
    return peers.find((id) => id !== socketId) || "Waiting...";
  };

  const getStatusMessage = () => {
    if (winner === "DRAW") return "Game Over - It's a Draw!";
    if (winner) return `${winner} Wins!`;

    if (isMultiplayer) {
      if (currentPlayer != localPlayer) {
        return ``;
      }
    }
    const messages = {
      MOVE_OPPONENT: "Optionally move an opponent's piece",
      PLACE_PIECE: "Place your piece",
      MUST_ROTATE: "Press rotate to end turn",
    };

    return messages[turnPhase];
  };

  if (isMultiplayer) {
    const opponentId = getOpponentId();
    const isConnected = peers.length > 1;

    return (
      <div className="w-full max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-2 md:p-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 md:space-x-2">
            <div
              className={`w-2 md:w-3 h-2 md:h-3 rounded-full ${
                localPlayer === "BLACK"
                  ? "bg-black"
                  : "bg-white border border-gray-400"
              }`}
            />
            <div>
              <div className="text-xs md:text-sm text-gray-600">
                You ({localPlayer})
              </div>
              <div className="text-xs md:text-base font-medium">{socketId}</div>
            </div>
          </div>

          <div className="flex flex-col text-center px-1">
            <div className="text-sm md:text-lg font-medium text-gray-700">
              {currentPlayer}'s Turn
            </div>
            <div className="text-xs md:text-lg font-medium text-gray-700">
              {getStatusMessage()}
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <div>
              <div className="text-xs md:text-sm text-gray-600">
                Opponent ({localPlayer === "BLACK" ? "WHITE" : "BLACK"})
              </div>
              <div className="text-xs md:text-base font-medium flex items-center gap-1 md:gap-2">
                {opponentId}
                <div
                  className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              </div>
            </div>
            <div
              className={`w-2 md:w-3 h-2 md:h-3 rounded-full ${
                localPlayer === "BLACK"
                  ? "bg-white border border-gray-400"
                  : "bg-black"
              }`}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-2 md:p-4 mb-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-black" />
          <div>
            <div className="text-xs md:text-sm text-gray-600">Black</div>
            <div className="text-xs md:text-base font-medium whitespace-nowrap">
              <span className="inline-flex">
                Wins: {playerStats?.black.wins || 0}
              </span>
              <span className="text-gray-400 mx-1 md:mx-2">•</span>
              <span className="inline-flex">
                Draws: {playerStats?.black.draws || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-center px-1">
          <div className="text-sm md:text-lg font-medium text-gray-700">
            {currentPlayer}'s Turn
          </div>
          <div className="text-xs md:text-lg font-medium text-gray-700">
            {getStatusMessage()}
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-2">
          <div>
            <div className="text-xs md:text-sm text-gray-600">White</div>
            <div className="text-xs md:text-base font-medium whitespace-nowrap">
              <span className="inline-flex">
                Wins: {playerStats?.white.wins || 0}
              </span>
              <span className="text-gray-400 mx-1 md:mx-2">•</span>
              <span className="inline-flex">
                Draws: {playerStats?.white.draws || 0}
              </span>
            </div>
          </div>
          <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-white border border-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default GameStatus;
