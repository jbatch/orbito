// RoomInfo.tsx

import { Check, Copy } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

const RoomInfo = ({
  roomId,
  onCopy,
  copied,
}: {
  roomId: string;
  onCopy: () => void;
  copied: boolean;
}) => (
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
          {roomId}
        </code>
        <Button variant="outline" size="sm" onClick={onCopy}>
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default RoomInfo;
