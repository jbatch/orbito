import React from "react";
import { OrbitCell } from "./OrbitCell";
import { Board, Direction } from "./types";
import { useGame } from "./GameContext";

interface OrbitBoardProps {
  board: Board;
  isValidMove: (row: number, col: number) => boolean;
}

export const OrbitBoard: React.FC<OrbitBoardProps> = ({
  board,
  isValidMove,
}) => {
  const { currentConfig, selectedPiece, isRotating, dispatch } = useGame();
  const getArrowDirection = (
    row: number,
    col: number
  ): Direction | undefined => {
    const path = currentConfig.paths.find(
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
      className={`bg-red-600 p-4 md:p-8 rounded-lg shadow-lg ${
        isRotating ? "animate-rotation-tracker" : ""
      }`}
      onAnimationEnd={() => {
        dispatch({ type: "END_ROTATION" });
      }}
    >
      <div className="grid grid-cols-4 gap-4 md:gap-6 relative">
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
              position={[rowIndex, colIndex]}
            />
          ))
        )}
      </div>
    </div>
  );
};
