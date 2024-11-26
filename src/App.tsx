import { useEffect } from "react";
import "./App.css";
import { GameProvider, useGame } from "./components/GameContext";
import { NetworkProvider, useNetwork } from "./components/NetworkContext";
import OrbitoGame from "./components/OrbitoGame";

const GameWithNetworking: React.FC = () => {
  const { dispatch } = useGame();
  const { remoteGameState, isMultiplayer } = useNetwork();

  // Handle incoming game state updates
  useEffect(() => {
    if (isMultiplayer && remoteGameState) {
      dispatch({ type: "SYNC_STATE", state: remoteGameState });
    }
  }, [remoteGameState, isMultiplayer, dispatch]);

  return <OrbitoGame />;
};

function App() {
  return (
    <>
      <NetworkProvider>
        <GameProvider>
          <GameWithNetworking />
        </GameProvider>
      </NetworkProvider>
    </>
  );
}

export default App;
