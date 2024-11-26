import "./App.css";
import { NetworkProvider } from "./components/NetworkContext";
import OrbitoGame from "./components/OrbitoGame";

function App() {
  return (
    <>
      <NetworkProvider>
        <OrbitoGame />
      </NetworkProvider>
    </>
  );
}

export default App;
