import React from "react";
import { OrbitCell } from "./OrbitCell";
import { Board, Position, Direction, OrbitConfig } from "./types";
import { useGame } from "./GameContext";

interface OrbitBoardProps {
  board: Board;
  selectedPiece: Position;
  orbitConfig: OrbitConfig;
  isRotating: boolean;
  isValidMove: (row: number, col: number) => boolean;
  onCellClick: (row: number, col: number) => void;
}

export const OrbitBoard: React.FC<OrbitBoardProps> = ({
  board,
  selectedPiece,
  orbitConfig,
  isRotating,
  isValidMove,
  onCellClick,
}) => {
  const { dispatch } = useGame();
  const getArrowDirection = (
    row: number,
    col: number
  ): Direction | undefined => {
    const path = orbitConfig.paths.find(
      (p) => p.position[0] === row && p.position[1] === col
    );

    if (!path) return undefined;

    const [currentRow, currentCol] = path.position;
    const [nextRow, nextCol] = path.nextPosition;

    if (nextRow < currentRow) return "up";
    if (nextRow > currentRow) return "down";
    if (nextCol < currentCol) return "left";
    if (nextCol > currentCol) return "right";

    return undefined;
  };

  return (
    <div
      className={`bg-red-600 p-8 rounded-lg shadow-lg  ${
        isRotating ? "animate-rotation-tracker" : ""
      }`}
      onAnimationEnd={(e) => {
        console.log("Board end", e);
        dispatch({ type: "END_ROTATION" });
      }}
    >
      <div className="grid grid-cols-4 gap-4 relative">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <OrbitCell
              key={`${rowIndex}-${colIndex}`}
              content={cell}
              isSelected={
                selectedPiece?.[0] === rowIndex &&
                selectedPiece?.[1] === colIndex
              }
              isValidMove={isValidMove(rowIndex, colIndex)}
              arrowDirection={getArrowDirection(rowIndex, colIndex)}
              onClick={() => onCellClick(rowIndex, colIndex)}
              config={orbitConfig}
              isRotating={isRotating}
              position={[rowIndex, colIndex]}
            />
          ))
        )}
      </div>
    </div>
  );
};
