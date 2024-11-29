import { useSignaling as useWebRTCSignaling } from "@jbatch/webrtc-client";
import { useState, useEffect, useMemo, useCallback } from "react";

const SIGNALING_SERVER = "https://p2p.jbat.ch";

export interface Room {
  id: string;
  playerCount: number;
  maxPlayers: number;
  createdAt: Date;
}

export interface SignalingState {
  isConnected: boolean;
  currentRoom: string | null;
  peers: string[];
  availableRooms: Room[];
  error: string | null;
  socketId?: string;
}

export function useSignaling() {
  const {
    isConnected,
    currentRoom,
    peers,
    availableRooms,
    error,
    socketId,
    socket,
    createRoom,
    joinRoom,
    listRooms,
  } = useWebRTCSignaling(SIGNALING_SERVER);

  const [signalState, setSignalState] = useState<SignalingState>({
    isConnected: false,
    currentRoom: null,
    peers: [],
    availableRooms: [],
    error: null,
    socketId: undefined,
  });

  // Update state when connection status changes
  const memoPeers = useMemo(() => peers.map((p) => p.id), [peers]);
  useEffect(() => {
    console.log("UseSignalling");
    setSignalState((prev) => ({
      ...prev,
      isConnected,
      currentRoom,
      peers: memoPeers,
      availableRooms,
      error,
      socketId,
    }));
  }, [isConnected, currentRoom, memoPeers, availableRooms, error, socketId]);

  const handleCreateRoom = useCallback(async () => {
    try {
      await createRoom("orbito", 2); // Max 2 players per room
    } catch (err) {
      setSignalState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to create room",
      }));
    }
  }, [createRoom]);

  const handleJoinRoom = useCallback(
    async (roomId: string) => {
      try {
        await joinRoom(roomId);
      } catch (err) {
        setSignalState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Failed to join room",
        }));
      }
    },
    [joinRoom]
  );

  const handleListRooms = useCallback(async () => {
    try {
      await listRooms("orbito");
    } catch (err) {
      setSignalState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to list rooms",
      }));
    }
  }, [listRooms]);

  return {
    ...signalState,
    socket,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    listRooms: handleListRooms,
  };
}
