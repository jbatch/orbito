// PlayerList.tsx

import { Crown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

const PlayerList = ({
  peers,
  socketId,
  canStartGame,
}: {
  peers: string[];
  socketId?: string;
  canStartGame: boolean;
}) => (
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
              {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
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
);

export default PlayerList;
