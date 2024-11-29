import { RotateCw } from "lucide-react";
import { useNetwork } from "./NetworkContext";
import { Button } from "./ui/button";
import { useGame } from "./GameContext";
import { GameStats } from "./types";

const PlayerInfo = ({
  color,
  stats,
  label,
  id,
  connected,
}: {
  color: "BLACK" | "WHITE";
  stats?: GameStats["black"];
  label: string;
  id?: string;
  connected?: boolean;
}) => (
  <div className="flex items-center space-x-1 md:space-x-2">
    <div>
      <div className="text-xs md:text-sm text-gray-600">{label}</div>
      {stats && (
        <div className="text-xs md:text-base font-medium whitespace-nowrap">
          <span className="inline-flex">Wins: {stats.wins}</span>
          <span className="text-gray-400 mx-1 md:mx-2">•</span>
          <span className="inline-flex">Draws: {stats.draws}</span>
        </div>
      )}
      {id && (
        <div className="text-xs md:text-base font-medium flex items-center gap-1 md:gap-2">
          {id}
          {connected !== undefined && (
            <div
              className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          )}
        </div>
      )}
    </div>
    <div
      className={`w-2 md:w-3 h-2 md:h-3 rounded-full ${
        color === "BLACK" ? "bg-black" : "bg-white border border-gray-400"
      }`}
    />
  </div>
);

const GameStatus = () => {
  const {
    startingPlayer,
    winner,
    currentPlayer,
    turnPhase,
    stats,
    handleRematch,
  } = useGame();
  const { isMultiplayer, localPlayer, peers, socketId } = useNetwork();

  const getStatusMessage = () => {
    if (winner === "DRAW") return "Game Over - It's a Draw!";
    if (winner) return `${winner} Wins!`;
    if (isMultiplayer && currentPlayer !== localPlayer) return "";

    const messages = {
      MOVE_OPPONENT: "Optionally move an opponent's piece",
      PLACE_PIECE: "Place your piece",
      MUST_ROTATE: "Press rotate to end turn",
    };

    return messages[turnPhase];
  };

  const opponentId = peers.find((id) => id !== socketId) || "Waiting...";
  const isConnected = peers.length > 1;

  const Status = () => (
    <div className="flex flex-col text-center px-1">
      {!winner && (
        <div className="text-sm md:text-lg font-medium text-gray-700">
          {currentPlayer}'s Turn
        </div>
      )}
      <div className="text-xs md:text-lg font-medium text-gray-700">
        {getStatusMessage()}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col mb-8 w-full">
      {/* Fixed height container for the status card */}
      <div className="w-full max-w-4xl mx-auto min-h-[120px] md:min-h-[140px] bg-white shadow-sm rounded-lg p-2 md:p-4">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center">
            {isMultiplayer ? (
              <>
                <PlayerInfo
                  color={localPlayer || "BLACK"}
                  label={`You (${localPlayer})`}
                  id={socketId}
                  stats={localPlayer === "BLACK" ? stats.black : stats.white}
                />
                <Status />
                <PlayerInfo
                  color={localPlayer === "BLACK" ? "WHITE" : "BLACK"}
                  label={`Opponent (${
                    localPlayer === "BLACK" ? "WHITE" : "BLACK"
                  })`}
                  id={opponentId}
                  connected={isConnected}
                  stats={localPlayer === "BLACK" ? stats.white : stats.black}
                />
              </>
            ) : (
              <>
                <PlayerInfo color="BLACK" stats={stats.black} label="Black" />
                <Status />
                <PlayerInfo color="WHITE" stats={stats.white} label="White" />
              </>
            )}
          </div>
          {winner && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleRematch}
                className="flex items-center gap-2"
                variant="outline"
              >
                <RotateCw className="h-4 w-4" />
                Rematch ({startingPlayer === "BLACK" ? "White" : "Black"}{" "}
                Starts)
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Flexible spacer that can shrink */}
      <div className="flex-1 min-h-0" />
    </div>
  );
};

export default GameStatus;
