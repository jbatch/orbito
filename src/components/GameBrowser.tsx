// GameBrowser.tsx

import { Room } from "@jbatch/webrtc-client";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "./ui/table";

const GameBrowser = ({
  isConnected,
  isLoading,
  availableRooms,
  onRefresh,
  onCreateRoom,
  onJoinRoom,
}: {
  isConnected: boolean;
  isLoading: boolean;
  availableRooms: Room[];
  onRefresh: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        onClick={onCreateRoom}
        disabled={!isConnected || isLoading}
      >
        Create New Room
      </Button>
      <Button
        onClick={onRefresh}
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
                onClick={() => onJoinRoom(room.id)}
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
  </div>
);

export default GameBrowser;
