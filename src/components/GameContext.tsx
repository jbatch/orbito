import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { Board, Player, Position, OrbitConfig, GameState } from "./types";
import { useNetwork } from "./NetworkContext";
import { availableConfigs } from "./orbitConfig";

// Action types
type GameAction =
  | { type: "SELECT_PIECE"; position: Position }
  | { type: "MOVE_PIECE"; from: Position; to: Position }
  | { type: "PLACE_PIECE"; position: [number, number] }
  | { type: "START_ROTATION" }
  | { type: "SET_LIFTED"; isLifted: boolean }
  | {
      type: "SET_MOVE_OFFSETS";
      offsets: Record<string, { top: number; left: number }>;
    }
  | { type: "APPLY_ROTATION"; newBoard: Board }
  | { type: "END_ROTATION" }
  | { type: "SET_CONFIG"; config: OrbitConfig }
  | { type: "SYNC_STATE"; state: Partial<GameState> }
  | { type: "RESET_GAME" };

// Initial state
const initialState: GameState = {
  board: Array(4)
    .fill(null)
    .map(() => Array(4).fill(null)),
  currentPlayer: "BLACK",
  turnPhase: "PLACE_PIECE",
  selectedPiece: null,
  winner: null,
  currentConfig: availableConfigs[0],
  isRotating: false,
  isLifted: false,
  moveOffsets: {},
  disableTransitions: false,
  sequence: 0,
};

// Helper functions
const checkWinner = (board: Board): Player | null => {
  // Check rows and columns
  for (let i = 0; i < 4; i++) {
    // Check rows
    if (
      board[i][0] !== null &&
      board[i][0] === board[i][1] &&
      board[i][1] === board[i][2] &&
      board[i][2] === board[i][3]
    ) {
      return board[i][0];
    }
    // Check columns
    if (
      board[0][i] !== null &&
      board[0][i] === board[1][i] &&
      board[1][i] === board[2][i] &&
      board[2][i] === board[3][i]
    ) {
      return board[0][i];
    }
  }

  // Check diagonals
  if (
    board[0][0] !== null &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2] &&
    board[2][2] === board[3][3]
  ) {
    return board[0][0];
  }

  if (
    board[0][3] !== null &&
    board[0][3] === board[1][2] &&
    board[1][2] === board[2][1] &&
    board[2][1] === board[3][0]
  ) {
    return board[0][3];
  }

  return null;
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SELECT_PIECE":
      return {
        ...state,
        selectedPiece: action.position,
      };

    case "MOVE_PIECE": {
      if (!action.from || !action.to) return state;
      console.log("MOVE PIECE", { action });
      const newBoard = state.board.map((row) => [...row]);
      newBoard[action.to[0]][action.to[1]] =
        newBoard[action.from[0]][action.from[1]];
      newBoard[action.from[0]][action.from[1]] = null;

      return {
        ...state,
        board: newBoard,
        selectedPiece: null,
        turnPhase: "PLACE_PIECE",
        sequence: state.sequence + 1,
      };
    }

    case "PLACE_PIECE": {
      const newBoard = state.board.map((row) => [...row]);
      newBoard[action.position[0]][action.position[1]] = state.currentPlayer;

      return {
        ...state,
        board: newBoard,
        selectedPiece: null,
        turnPhase: "MUST_ROTATE",
        sequence: state.sequence + 1,
      };
    }

    case "START_ROTATION":
      return {
        ...state,
        isRotating: true,
      };

    case "SET_LIFTED":
      return {
        ...state,
        isLifted: action.isLifted,
      };

    case "SET_MOVE_OFFSETS":
      return {
        ...state,
        moveOffsets: action.offsets,
      };

    case "APPLY_ROTATION": {
      const winner = checkWinner(action.newBoard);
      return {
        ...state,
        board: action.newBoard,
        winner,
        currentPlayer: state.currentPlayer === "BLACK" ? "WHITE" : "BLACK",
        turnPhase: "MOVE_OPPONENT",
        selectedPiece: null,
        disableTransitions: true,
        moveOffsets: {},
      };
    }

    case "END_ROTATION":
      return {
        ...state,
        isRotating: false,
        isLifted: false,
        disableTransitions: false,
      };

    case "SET_CONFIG":
      return {
        ...state,
        currentConfig: action.config,
      };

    case "SYNC_STATE":
      if (!action.state.sequence || action.state.sequence <= state.sequence) {
        console.warn("Ignoring SYNC_STATE", {
          actionSeq: action.state.sequence,
          localSeq: state.sequence,
        });
        return state;
      }
      return {
        ...state,
        ...action.state,
      };

    case "RESET_GAME":
      return initialState;

    default:
      return state;
  }
}

// Context
interface GameContextType extends GameState {
  dispatch: React.Dispatch<GameAction>;
  isValidMove: (row: number, col: number) => boolean;
  getValidMoves: (row: number, col: number) => Position[];
  handleCellClick: (row: number, col: number) => void;
  handleRotate: () => Promise<void>;
}

const GameContext = createContext<GameContextType | null>(null);

// Provider
const CELL_SIZE = 64;
const GAP_SIZE = 16;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { isMultiplayer, localPlayer, sendGameState } = useNetwork();

  const calculateMoveOffsets = () => {
    const offsets: Record<string, { top: number; left: number }> = {};

    state.currentConfig.paths.forEach((path) => {
      const [fromRow, fromCol] = path.position;
      const [toRow, toCol] = path.nextPosition;

      const topOffset = (toRow - fromRow) * (CELL_SIZE + GAP_SIZE);
      const leftOffset = (toCol - fromCol) * (CELL_SIZE + GAP_SIZE);

      offsets[`${fromRow},${fromCol}`] = { top: topOffset, left: leftOffset };
    });

    return offsets;
  };

  const getValidMoves = useCallback(
    (row: number, col: number): Position[] => {
      const moves: Position[] = [];
      const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];

      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (
          newRow >= 0 &&
          newRow < 4 &&
          newCol >= 0 &&
          newCol < 4 &&
          state.board[newRow][newCol] === null
        ) {
          moves.push([newRow, newCol]);
        }
      }

      return moves;
    },
    [state.board]
  );

  const isValidMove = useCallback(
    (row: number, col: number): boolean => {
      if (!state.selectedPiece) return false;
      return getValidMoves(state.selectedPiece[0], state.selectedPiece[1]).some(
        (position) => position![0] === row && position![1] === col
      );
    },
    [state.selectedPiece, getValidMoves]
  );

  const handleRotate = async () => {
    if (state.turnPhase !== "MUST_ROTATE" || state.isRotating) {
      return;
    }

    dispatch({ type: "START_ROTATION" });
    dispatch({ type: "SET_LIFTED", isLifted: true });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const offsets = calculateMoveOffsets();
    dispatch({ type: "SET_MOVE_OFFSETS", offsets });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const newBoard = state.board.map((row) => [...row]);
    state.currentConfig.paths.forEach((path) => {
      const [fromRow, fromCol] = path.position;
      const [toRow, toCol] = path.nextPosition;
      newBoard[toRow][toCol] = state.board[fromRow][fromCol];
    });

    dispatch({ type: "APPLY_ROTATION", newBoard });

    await new Promise((resolve) => requestAnimationFrame(resolve));

    await new Promise((resolve) => setTimeout(resolve, 300));

    dispatch({ type: "END_ROTATION" });

    if (isMultiplayer) {
      sendGameState(
        {
          board: newBoard,
          currentPlayer: state.currentPlayer === "BLACK" ? "WHITE" : "BLACK",
          turnPhase: "MOVE_OPPONENT",
        },
        state.sequence + 1
      );
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (state.winner) return;
    if (state.turnPhase === "MUST_ROTATE") return;
    if (isMultiplayer && state.currentPlayer !== localPlayer) return;

    if (state.turnPhase === "MOVE_OPPONENT") {
      const opposingPlayer =
        state.currentPlayer === "BLACK" ? "WHITE" : "BLACK";

      if (state.board[row][col] === opposingPlayer) {
        if (
          state.selectedPiece &&
          state.selectedPiece[0] === row &&
          state.selectedPiece[1] === col
        ) {
          dispatch({ type: "SELECT_PIECE", position: null });
        } else {
          dispatch({ type: "SELECT_PIECE", position: [row, col] });
        }
        return;
      }

      if (state.selectedPiece && isValidMove(row, col)) {
        dispatch({
          type: "MOVE_PIECE",
          from: state.selectedPiece,
          to: [row, col],
        });
        if (isMultiplayer) {
          const newBoard = state.board.map((row) => [...row]);
          newBoard[row][col] =
            newBoard[state.selectedPiece[0]][state.selectedPiece[1]];
          newBoard[state.selectedPiece[0]][state.selectedPiece[1]] = null;
          sendGameState(
            { board: newBoard, turnPhase: "PLACE_PIECE" },
            state.sequence + 1
          );
        }
        return;
      }

      if (state.board[row][col] === null && !state.selectedPiece) {
        dispatch({ type: "PLACE_PIECE", position: [row, col] });
        if (isMultiplayer) {
          const newBoard = state.board.map((row) => [...row]);
          newBoard[row][col] = state.currentPlayer;
          sendGameState(
            { board: newBoard, turnPhase: "MUST_ROTATE" },
            state.sequence + 1
          );
        }
        return;
      }
    }

    if (state.turnPhase === "PLACE_PIECE" && state.board[row][col] === null) {
      dispatch({ type: "PLACE_PIECE", position: [row, col] });
      if (isMultiplayer) {
        const newBoard = state.board.map((row) => [...row]);
        newBoard[row][col] = state.currentPlayer;
        sendGameState(
          { board: newBoard, turnPhase: "MUST_ROTATE" },
          state.sequence + 1
        );
      }
    }
  };

  const value = {
    ...state,
    dispatch,
    isValidMove,
    getValidMoves,
    handleCellClick,
    handleRotate,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
