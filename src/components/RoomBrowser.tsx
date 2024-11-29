import { useToast } from "@/hooks/use-toast";
import React, { useCallback, useEffect } from "react";
import GameBrowser from "./GameBrowser";
import GameSettings from "./GameSettings";
import { useNetwork } from "./NetworkContext";
import PlayerList from "./PlayerList";
import RoomInfo from "./RoomInfo";
import { Button } from "./ui/button";
import { OrbitConfig } from "./types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface RoomBrowserProps {
  isOpen: boolean;
  currentConfig: OrbitConfig;
  onOpenChange: (open: boolean) => void;
  onConfigChange: (config: OrbitConfig) => void;
}

const RoomBrowser: React.FC<RoomBrowserProps> = ({
  isOpen,
  currentConfig,
  onOpenChange,
  onConfigChange,
}) => {
  // console.log("render");
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const {
    isConnected,
    socketId,
    availableRooms,
    currentRoom,
    peers,
    isHost,
    error,
    createRoom,
    joinRoom,
    listRooms,
    startGame,
  } = useNetwork();

  const handleRefresh = useCallback(async () => {
    console.log("Handle refresh");
    setIsLoading(true);
    await listRooms();
    setIsLoading(false);
  }, [listRooms]);

  useEffect(() => {
    console.log("handleRefresh - useEffect");
    if (isOpen && isConnected && !currentRoom) {
      handleRefresh();
    }
  }, [isOpen, isConnected, currentRoom, handleRefresh]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleJoinRoom = async (roomId: string) => {
    setIsLoading(true);
    await joinRoom(roomId);
    setIsLoading(false);
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    await createRoom();
    setIsLoading(false);
  };

  const handleCopyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = () => {
    startGame();
    onOpenChange(false);
  };

  const canStartGame = peers.length === 2;

  return (
    <Tabs defaultValue={currentRoom ? "lobby" : "browse"}>
      <TabsList className="w-full">
        <TabsTrigger value="browse" className="flex-1" disabled={!isConnected}>
          Browse Games
        </TabsTrigger>
        <TabsTrigger value="lobby" className="flex-1" disabled={!currentRoom}>
          Game Lobby
        </TabsTrigger>
      </TabsList>

      <TabsContent value="browse" className="mt-4">
        <GameBrowser
          isConnected={isConnected}
          isLoading={isLoading}
          availableRooms={availableRooms}
          onRefresh={handleRefresh}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </TabsContent>

      <TabsContent value="lobby">
        {currentRoom && (
          <div className="space-y-4">
            <RoomInfo
              roomId={currentRoom}
              onCopy={handleCopyRoomId}
              copied={copied}
            />
            <PlayerList
              peers={peers}
              socketId={socketId}
              canStartGame={canStartGame}
            />
            <GameSettings
              currentConfig={currentConfig}
              onConfigChange={onConfigChange}
              isHost={isHost}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame || !isHost}
              >
                {!canStartGame
                  ? "Waiting for Players..."
                  : !isHost
                  ? "Waiting for Host..."
                  : "Start Game"}
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default RoomBrowser;
