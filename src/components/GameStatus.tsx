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

const PlayerInfo = ({
  color,
  stats,
  label,
  id,
  connected,
}: {
  color: "BLACK" | "WHITE";
  stats?: Stats;
  label: string;
  id?: string;
  connected?: boolean;
}) => (
  <div className="flex items-center space-x-1 md:space-x-2">
    <div>
      <div className="text-xs md:text-sm text-gray-600">{label}</div>
      {stats ? (
        <div className="text-xs md:text-base font-medium whitespace-nowrap">
          <span className="inline-flex">Wins: {stats.wins}</span>
          <span className="text-gray-400 mx-1 md:mx-2">•</span>
          <span className="inline-flex">Draws: {stats.draws}</span>
        </div>
      ) : (
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

const GameStatus = ({
  turnPhase,
  currentPlayer,
  playerStats,
  winner,
}: GameStatusProps) => {
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
      <div className="text-sm md:text-lg font-medium text-gray-700">
        {currentPlayer}'s Turn
      </div>
      <div className="text-xs md:text-lg font-medium text-gray-700">
        {getStatusMessage()}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-2 md:p-4 mb-8">
      <div className="flex justify-between items-center">
        {isMultiplayer ? (
          <>
            <PlayerInfo
              color={localPlayer || "BLACK"}
              label={`You (${localPlayer})`}
              id={socketId}
            />
            <Status />
            <PlayerInfo
              color={localPlayer === "BLACK" ? "WHITE" : "BLACK"}
              label={`Opponent (${
                localPlayer === "BLACK" ? "WHITE" : "BLACK"
              })`}
              id={opponentId}
              connected={isConnected}
            />
          </>
        ) : (
          <>
            <PlayerInfo
              color="BLACK"
              stats={playerStats?.black}
              label="Black"
            />
            <Status />
            <PlayerInfo
              color="WHITE"
              stats={playerStats?.white}
              label="White"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default GameStatus;
