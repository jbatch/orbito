import React, { useCallback } from "react";
import { HelpCircle, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { availableConfigs } from "./orbitConfig";
import { useGame } from "./GameContext";
import { useNetwork } from "./NetworkContext";
import RoomBrowser from "./RoomBrowser";
import ConnectionStatus from "./ConnectionStatus";

const Header = () => {
  const [isRulesOpen, setRulesOpen] = React.useState(false);
  const [isSettingsOpen, setSettingsOpen] = React.useState(false);
  const [isRoomBrowserOpen, setRoomBrowserOpen] = React.useState(false);
  const { currentConfig, dispatch } = useGame();
  const { isMultiplayer, isConnected, sendConfigChange } = useNetwork();

  const handleConfigChange = useCallback(
    (newConfig: typeof currentConfig) => {
      dispatch({ type: "SET_CONFIG", config: newConfig });
      if (isMultiplayer) {
        sendConfigChange(newConfig);
      }
    },
    [dispatch, isMultiplayer, sendConfigChange]
  );

  return (
    <header className="w-full px-4 py-3 border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Button variant="outline" onClick={() => setRulesOpen(true)}>
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only md:not-sr-only md:ml-2 md:inline">
            Rules
          </span>
        </Button>

        <h1 className="text-2xl font-bold">Orbito</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-5 w-5" />
            <span className="sr-only md:not-sr-only md:ml-2 md:inline">
              Settings
            </span>
          </Button>
          <Button variant="outline" onClick={() => setRoomBrowserOpen(true)}>
            <Users className="h-5 w-5" />
            <span className="sr-only md:not-sr-only md:ml-2 md:inline">
              Join Game
            </span>
          </Button>
        </div>

        <Dialog open={isRulesOpen} onOpenChange={setRulesOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>How to Play Orbito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="font-semibold">Game Objective</h3>
              <p>
                Be the first player to create a line of four pieces of your
                color - horizontally, vertically, or diagonally.
              </p>

              <h3 className="font-semibold">Game Flow</h3>
              <ol className="list-decimal ml-4 space-y-2">
                <li>Players take turns, starting with Black.</li>
                <li>
                  On your turn:
                  <ul className="list-disc ml-4 mt-1">
                    <li>
                      Optionally move one of your opponent's pieces to an
                      adjacent empty space
                    </li>
                    <li>Place one of your pieces on any empty space</li>
                    <li>
                      Rotate the board, causing all pieces to move along their
                      paths
                    </li>
                  </ul>
                </li>
                <li>
                  After the rotation, if no player has won, play continues with
                  the next player.
                </li>
              </ol>

              <h3 className="font-semibold">Board Configurations</h3>
              <p>
                The board has different configurations that determine how pieces
                move during rotation:
              </p>
              <ul className="list-disc ml-4">
                <li>Standard: Both orbits rotate counter-clockwise</li>
                <li>
                  Mixed: Outer orbit rotates counter-clockwise, inner orbit
                  clockwise
                </li>
                <li>Pacman: Special configuration with a break in the path</li>
              </ul>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Game Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="font-medium">Board Configuration</label>
                <select
                  className="p-2 border rounded"
                  value={currentConfig.name}
                  onChange={(e) => {
                    const newConfig = availableConfigs.find(
                      (c) => c.name === e.target.value
                    );
                    if (newConfig) handleConfigChange(newConfig);
                  }}
                >
                  {availableConfigs.map((config) => (
                    <option key={config.name} value={config.name}>
                      {config.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  Changes how pieces move during rotation
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isRoomBrowserOpen} onOpenChange={setRoomBrowserOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Orbito Multiplayer</DialogTitle>
                <ConnectionStatus isConnected={isConnected} />
              </div>
            </DialogHeader>
            <RoomBrowser
              isOpen={isRoomBrowserOpen}
              currentConfig={currentConfig}
              onOpenChange={setRoomBrowserOpen}
              onConfigChange={handleConfigChange}
            />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
