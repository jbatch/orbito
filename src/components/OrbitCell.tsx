import React from "react";
import { Player, Direction, OrbitConfig } from "./types";

interface OrbitCellProps {
  content: Player | null;
  isSelected: boolean;
  isValidMove: boolean;
  arrowDirection?: Direction;
  onClick: () => void;
  isRotating: boolean;
  position: [number, number];
  config: OrbitConfig;
}

export const OrbitCell: React.FC<OrbitCellProps> = ({
  content,
  isSelected,
  isValidMove,
  arrowDirection,
  onClick,
  isRotating,
  position,
  config,
}) => {
  const renderArrow = (direction: Direction) => {
    const baseClasses = "absolute w-4 h-4 text-gray-400";
    const positions = {
      right: "right-0 top-1/2 translate-x-4 -translate-y-1/2 rotate-0",
      down: "bottom-0 left-1/2 -translate-x-1/2 translate-y-4 rotate-90",
      left: "left-0 top-1/2 -translate-x-4 -translate-y-1/2 rotate-180",
      up: "top-0 left-1/2 -translate-x-1/2 -translate-y-4 -rotate-90",
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

  const getAnimationStyles = () => {
    if (!isRotating || !content) return {};

    const path = config.paths.find(
      (p) => p.position[0] === position[0] && p.position[1] === position[1]
    );

    if (!path) return {};

    const cellUnit = 80; // 64px cell + 16px gap
    const topOffset = (path.nextPosition[0] - path.position[0]) * cellUnit;
    const leftOffset = (path.nextPosition[1] - path.position[1]) * cellUnit;

    const topPercent = (topOffset / 64) * 100;
    const leftPercent = (leftOffset / 64) * 100;

    return {
      animation: "rotate-piece 1s ease-in-out forwards",
      "--move-x": `${leftPercent}%`,
      "--move-y": `${topPercent}%`,
    } as React.CSSProperties;
  };

  return (
    <div className="relative w-16 h-16">
      {/* Base cell with empty spot - always visible */}
      <button
        onClick={onClick}
        className={`
          absolute top-0 left-0
          w-16 h-16 rounded-full border-2
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
          className={`
            absolute top-0 left-0
            w-16 h-16 rounded-full
            ${content === "BLACK" ? "bg-black" : "bg-white"}
            ${isRotating ? "z-10" : "z-0"}
          `}
          style={getAnimationStyles()}
          onAnimationEnd={(e) => {
            console.log("Marble end");
            e.stopPropagation();
          }}
        />
      )}

      {arrowDirection && renderArrow(arrowDirection)}
    </div>
  );
};
