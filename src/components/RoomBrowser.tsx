import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, RefreshCw, Users, Copy, Check, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSignaling } from "./useSignaling";
import { availableConfigs } from "./orbitConfig";
import { OrbitConfig } from "./types";

const RoomBrowser = ({
  currentConfig,
  onConfigChange,
}: {
  currentConfig: OrbitConfig;
  onConfigChange: (config: OrbitConfig) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const {
    isConnected,
    currentRoom,
    availableRooms,
    peers,
    socketId,
    error,
    createRoom,
    joinRoom,
    listRooms,
  } = useSignaling();

  useEffect(() => {
    if (isOpen && isConnected && !currentRoom) {
      handleRefresh();
    }
  }, [isOpen, isConnected, currentRoom]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await listRooms();
    setIsLoading(false);
  };

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
    // TODO: Implement game start logic
    console.log("Starting game...");
    setIsOpen(false);
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-muted-foreground">
        {isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );

  const isHost = socketId === peers[0];
  const canStartGame = peers.length === 2;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          {currentRoom ? "Game Lobby" : "Join Game"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Orbito Multiplayer</DialogTitle>
            <ConnectionStatus />
          </div>
        </DialogHeader>

        <Tabs defaultValue={currentRoom ? "lobby" : "browse"}>
          <TabsList className="w-full">
            <TabsTrigger
              value="browse"
              className="flex-1"
              disabled={!isConnected}
            >
              Browse Games
            </TabsTrigger>
            <TabsTrigger
              value="lobby"
              className="flex-1"
              disabled={!currentRoom}
            >
              Game Lobby
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                onClick={handleCreateRoom}
                variant="default"
                disabled={!isConnected || isLoading}
              >
                Create New Room
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={!isConnected || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room ID</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.id}</TableCell>
                    <TableCell>
                      {room.playerCount} / {room.maxPlayers}
                    </TableCell>
                    <TableCell>
                      {new Date(room.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={
                          !isConnected ||
                          isLoading ||
                          room.playerCount >= room.maxPlayers
                        }
                      >
                        Join
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {availableRooms.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground h-24"
                    >
                      {isConnected
                        ? "No active rooms found"
                        : "Connecting to server..."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="lobby">
            {currentRoom && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Room Information</CardTitle>
                    <CardDescription>
                      Share this room ID with your friend to play together
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                        {currentRoom}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyRoomId}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Players</CardTitle>
                    <CardDescription>
                      {canStartGame
                        ? "All players have joined!"
                        : "Waiting for opponent to join..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {peers.map((peer, index) => (
                        <div
                          key={peer}
                          className="flex items-center justify-between p-2 rounded bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            <span>
                              Player {index + 1}
                              {peer === socketId ? " (You)" : ""}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {index === 0 ? "Host" : "Guest"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Game Settings</CardTitle>
                    <CardDescription>
                      Configure the game before starting
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Board Configuration
                      </label>
                      <select
                        className="w-full p-2 border rounded"
                        value={currentConfig.name}
                        onChange={(e) => {
                          const newConfig = availableConfigs.find(
                            (c) => c.name === e.target.value
                          );
                          if (newConfig) onConfigChange(newConfig);
                        }}
                        disabled={!isHost}
                      >
                        {availableConfigs.map((config) => (
                          <option key={config.name} value={config.name}>
                            {config.name}
                          </option>
                        ))}
                      </select>
                      {!isHost && (
                        <p className="text-sm text-muted-foreground">
                          Only the host can change game settings
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
      </DialogContent>
    </Dialog>
  );
};

export default RoomBrowser;
