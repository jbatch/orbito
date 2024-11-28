import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Room, useSignaling } from "./useSignaling";
import { Message, useWebRTC } from "@jbatch/webrtc-client";
import {
  Board,
  Player,
  Position,
  TurnPhase,
  OrbitConfig,
  MovingState,
} from "./types";

// State Types
interface GameState {
  board: Board;
  currentPlayer: Player;
  turnPhase: TurnPhase;
  selectedPiece: Position;
  winner: Player | "DRAW" | null;
  isRotating: boolean;
  movingState: MovingState | null;
  sequence: number;
}

interface NetworkState {
  isConnected: boolean;
  availableRooms: Room[];
  currentRoom: string | null;
  peers: string[];
  socketId?: string;
  isHost: boolean;
  localPlayer: Player | null;
  isMultiplayer: boolean;
  gameStarted: boolean;
  remoteGameState: Partial<GameState>;
  error: string | null;
}

// Action Types
type NetworkAction =
  | { type: "UPDATE_SIGNALING"; payload: Partial<NetworkState> }
  | { type: "SET_GAME_STARTED"; payload: boolean }
  | { type: "UPDATE_REMOTE_STATE"; payload: Partial<GameState> }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET_STATE" };

interface GameStateMessage extends Message {
  type: "game-state";
  payload: { state: Partial<GameState>; sequence: number };
}

interface ConfigChangeMessage extends Message {
  type: "config-change";
  payload: {
    config: OrbitConfig;
  };
}

interface StartGameMessage extends Message {
  type: "start-game";
  payload: null;
}

type GameMessage = GameStateMessage | ConfigChangeMessage | StartGameMessage;

// Context Type
interface NetworkContextType extends NetworkState {
  sendGameState: (state: Partial<GameState>, sequence: number) => void;
  sendConfigChange: (config: OrbitConfig) => void;
  startGame: () => void;
  createRoom: () => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  listRooms: () => Promise<void>;
}

// Initial State
const initialState: NetworkState = {
  isConnected: false,
  currentRoom: null,
  availableRooms: [],
  peers: [],
  socketId: undefined,
  isHost: false,
  localPlayer: null,
  isMultiplayer: false,
  gameStarted: false,
  remoteGameState: {},
  error: null,
};

// Reducer
function networkReducer(
  state: NetworkState,
  action: NetworkAction
): NetworkState {
  switch (action.type) {
    case "UPDATE_SIGNALING":
      return { ...state, ...action.payload };
    case "SET_GAME_STARTED":
      return { ...state, gameStarted: action.payload };
    case "UPDATE_REMOTE_STATE":
      return { ...state, remoteGameState: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET_STATE":
      return initialState;
    default:
      return state;
  }
}

// Context
const NetworkContext = createContext<NetworkContextType | null>(null);

// Provider Component
export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(networkReducer, initialState);

  const {
    isConnected,
    availableRooms,
    currentRoom,
    peers,
    socketId,
    error: signalingError,
    socket,
    createRoom: signalingCreateRoom,
    joinRoom: signalingJoinRoom,
    listRooms: signalingListRooms,
  } = useSignaling();

  const { startConnection, sendMessage, addMessageHandler } = useWebRTC(
    socket,
    currentRoom,
    peers
  );

  // Update state when signaling connection changes
  useEffect(() => {
    const isHost = socketId === peers[0];
    const localPlayer = isHost ? "BLACK" : "WHITE";
    const isMultiplayer = currentRoom !== null && peers.length > 0;

    dispatch({
      type: "UPDATE_SIGNALING",
      payload: {
        isConnected,
        availableRooms,
        currentRoom,
        peers,
        socketId,
        isHost,
        localPlayer: isMultiplayer ? localPlayer : null,
        isMultiplayer,
      },
    });
  }, [isConnected, currentRoom, peers, socketId, availableRooms]);

  // Handle errors
  useEffect(() => {
    if (signalingError) {
      dispatch({ type: "SET_ERROR", payload: signalingError });
    }
  }, [signalingError]);

  // Initialize connections when peers change
  useEffect(() => {
    if (currentRoom && peers.length > 0) {
      peers.forEach((peerId) => {
        // Only initiate if we come after them in the peer list
        if (socketId && peerId < socketId) {
          startConnection(peerId);
        }
      });
    }
  }, [currentRoom, peers, socketId, startConnection]);

  // Set up message handler
  useEffect(() => {
    const cleanup = addMessageHandler((_peerId: string, message: Message) => {
      const isGameMessage = (msg: Message): msg is GameMessage => {
        return ["game-state", "config-change", "start-game"].includes(msg.type);
      };

      if (!isGameMessage(message)) {
        console.warn("Received unknown message type:", message.type);
        return;
      }

      console.log("Received message", { message });

      switch (message.type) {
        case "game-state":
          // Only update if sequence number is higher
          if (
            message.payload.sequence > (state.remoteGameState.sequence || 0)
          ) {
            dispatch({
              type: "UPDATE_REMOTE_STATE",
              payload: {
                ...message.payload.state,
                sequence: message.payload.sequence,
              },
            });
          }
          break;
        case "start-game":
          dispatch({ type: "SET_GAME_STARTED", payload: true });
          break;
      }
    });

    return () => cleanup();
  }, [addMessageHandler, state.remoteGameState.sequence]);

  // Network actions
  const sendGameState = (gameState: Partial<GameState>, sequence: number) => {
    if (state.isMultiplayer && peers.length > 1) {
      const otherPeerId = peers.find((id) => id !== socketId);
      if (otherPeerId) {
        const message: GameStateMessage = {
          type: "game-state",
          payload: { state: gameState, sequence },
        };
        sendMessage(otherPeerId, message);
      }
    }
  };

  const sendConfigChange = (config: OrbitConfig) => {
    if (state.isMultiplayer && peers.length > 1) {
      const otherPeerId = peers.find((id) => id !== socketId);
      if (otherPeerId) {
        const message: ConfigChangeMessage = {
          type: "config-change",
          payload: { config },
        };
        sendMessage(otherPeerId, message);
      }
    }
  };

  const startGame = () => {
    if (state.isMultiplayer && peers.length > 1) {
      const otherPeerId = peers.find((id) => id !== socketId);
      if (otherPeerId) {
        const message: StartGameMessage = {
          type: "start-game",
          payload: null,
        };
        sendMessage(otherPeerId, message);
      }
      dispatch({ type: "SET_GAME_STARTED", payload: true });
    }
  };

  const createRoom = async () => {
    try {
      await signalingCreateRoom();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to create room",
      });
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      await signalingJoinRoom(roomId);
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to join room",
      });
    }
  };

  const listRooms = async () => {
    try {
      await signalingListRooms();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to list rooms",
      });
    }
  };

  const value = {
    ...state,
    sendGameState,
    sendConfigChange,
    startGame,
    createRoom,
    joinRoom,
    listRooms,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

// Hook for using the context
// eslint-disable-next-line react-refresh/only-export-components
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
