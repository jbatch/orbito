// OrbitCell.tsx
import React from "react";
import { Player, Direction } from "./types";
import { useGame } from "./GameContext";

interface OrbitCellProps {
  content: Player | null;
  isSelected: boolean;
  isValidMove: boolean;
  arrowDirection?: Direction;
  position: [number, number];
}

export const OrbitCell: React.FC<OrbitCellProps> = ({
  content,
  isSelected,
  isValidMove,
  arrowDirection,
  position,
}) => {
  const { handleCellClick, currentConfig, isRotating, movingState } = useGame();
  const renderArrow = (direction: Direction) => {
    const baseClasses = "absolute w-3 h-3 md:w-4 md:h-4 text-gray-400";
    const positions = {
      right:
        "right-0 top-1/2 translate-x-3 md:translate-x-5 -translate-y-1/2 rotate-0",
      down: "bottom-0 left-1/2 -translate-x-1/2 translate-y-4 md:translate-y-5 rotate-90",
      left: "left-0 top-1/2 -translate-x-3 md:-translate-x-5 -translate-y-1/2 rotate-180",
      up: "top-0 left-1/2 -translate-x-1/2 -translate-y-3 md:-translate-y-5 -rotate-90",
    };

    return (
      <svg
        className={`${baseClasses} ${positions[direction]} transform`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12h14m-4 4l4-4-4-4" />
      </svg>
    );
  };

  const getTargetPosition = () => {
    if (isRotating) {
      const path = currentConfig.paths.find(
        (p) => p.position[0] === position[0] && p.position[1] === position[1]
      );
      if (!path) {
        return null;
      }
      return path.nextPosition;
    }

    if (
      movingState &&
      movingState.from[0] == position[0] &&
      movingState.from[1] == position[1]
    ) {
      return movingState.to;
    }
    return null;
  };

  const isMoving =
    (content && isRotating) ||
    (movingState &&
      movingState.from[0] === position[0] &&
      movingState.from[1] == position[1]);

  const getAnimationStyles = () => {
    if (!isMoving) return {};
    const target = getTargetPosition();
    if (!target) return {};

    const cellUnit = window.innerWidth < 768 ? 60 : 80; // Adjust for mobile
    const topOffset = (target[0] - position[0]) * cellUnit;
    const leftOffset = (target[1] - position[1]) * cellUnit;

    const topPercent = (topOffset / (window.innerWidth < 768 ? 48 : 64)) * 100;
    const leftPercent =
      (leftOffset / (window.innerWidth < 768 ? 48 : 64)) * 100;

    return {
      animation: "rotate-piece 1s ease-in-out forwards",
      "--move-x": `${leftPercent}%`,
      "--move-y": `${topPercent}%`,
    } as React.CSSProperties;
  };

  return (
    <div className="relative w-12 h-12 md:w-16 md:h-16">
      {/* Base cell with empty spot - always visible */}
      <button
        onClick={() => handleCellClick(...position)}
        className={`
          absolute top-0 left-0
          w-12 h-12 md:w-16 md:h-16 rounded-full border-2
          bg-gray-200
          ${
            isSelected
              ? "border-yellow-400 border-4"
              : isValidMove
              ? "border-green-400 border-4"
              : "border-gray-300 hover:border-blue-500"
          }
        `}
      >
        <div className="absolute inset-2 rounded-full bg-gray-300" />
      </button>

      {/* Animated marble layer */}
      {content && (
        <div
          onClick={() => handleCellClick(...position)}
          className={`
            absolute top-0 left-0
            w-12 h-12 md:w-16 md:h-16 rounded-full
            ${content === "BLACK" ? "bg-black" : "bg-white"}
            ${isMoving ? "z-10" : "z-0"}
          `}
          style={getAnimationStyles()}
          onAnimationEnd={(e) => e.stopPropagation()}
        />
      )}
      {arrowDirection && renderArrow(arrowDirection)}
    </div>
  );
};
