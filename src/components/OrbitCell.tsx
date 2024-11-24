// OrbitCell.tsx
import React from "react";
import { Player, Direction } from "./types";

interface OrbitCellProps {
  content: Player | null;
  isSelected: boolean;
  isValidMove: boolean;
  arrowDirection?: Direction;
  onClick: () => void;
}

export const OrbitCell: React.FC<OrbitCellProps> = ({
  content,
  isSelected,
  isValidMove,
  arrowDirection,
  onClick,
}) => {
  const renderArrow = (direction: Direction) => {
    const baseClasses = "absolute w-4 h-4 text-gray-400";
    let positionClasses = "";

    const positions = {
      right: "right-0 top-1/2 translate-x-4 -translate-y-1/2 rotate-0",
      down: "bottom-0 left-1/2 -translate-x-1/2 translate-y-4 rotate-90",
      left: "left-0 top-1/2 -translate-x-4 -translate-y-1/2 rotate-180",
      up: "top-0 left-1/2 -translate-x-1/2 -translate-y-4 -rotate-90",
    };

    positionClasses = positions[direction];

    return (
      <svg
        className={`${baseClasses} ${positionClasses} transform`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12h14m-4 4l4-4-4-4" />
      </svg>
    );
  };

  return (
    <div className="relative">
      <button
        className={`
          w-16 h-16 rounded-full border-2 transition-colors relative
          ${
            content === "BLACK"
              ? "bg-black"
              : content === "WHITE"
              ? "bg-white"
              : "bg-gray-200"
          } 
          ${
            isSelected
              ? "border-yellow-400 border-4"
              : isValidMove
              ? "border-green-400 border-4"
              : "border-gray-300 hover:border-blue-500"
          }
        `}
        onClick={onClick}
      >
        {content === null && (
          <div className="absolute inset-2 rounded-full bg-gray-300"></div>
        )}
      </button>
      {arrowDirection && renderArrow(arrowDirection)}
    </div>
  );
};
