// configValidator.ts
import { OrbitConfig, OrbitConfigValidationResult } from "./types";

export class OrbitConfigValidator {
  static validateConfig(config: OrbitConfig): OrbitConfigValidationResult {
    const errors: string[] = [];
    const visitedPositions = new Set<string>();
    const nextPositions = new Set<string>();

    // Check all positions are within bounds
    const isPositionValid = (pos: [number, number]) =>
      pos[0] >= 0 &&
      pos[0] < config.size &&
      pos[1] >= 0 &&
      pos[1] < config.size;

    // Validate each path
    config.paths.forEach((path) => {
      const { position, nextPosition } = path;
      const posKey = `${position[0]},${position[1]}`;
      const nextPosKey = `${nextPosition[0]},${nextPosition[1]}`;

      // Check positions are within bounds
      if (!isPositionValid(position)) {
        errors.push(`Position ${posKey} is out of bounds`);
      }
      if (!isPositionValid(nextPosition)) {
        errors.push(`Next position ${nextPosKey} is out of bounds`);
      }

      // Track positions for cycle validation
      visitedPositions.add(posKey);
      nextPositions.add(nextPosKey);
    });

    // Check every position has exactly one next position
    const duplicateNextPositions = new Set(
      [...nextPositions].filter(
        (pos) => [...nextPositions].filter((p) => p === pos).length > 1
      )
    );
    if (duplicateNextPositions.size > 0) {
      errors.push(
        `Positions ${[
          ...duplicateNextPositions,
        ]} are targeted by multiple paths`
      );
    }

    // Check every position is part of exactly one cycle
    visitedPositions.forEach((pos) => {
      if (!nextPositions.has(pos)) {
        errors.push(`Position ${pos} has no incoming path`);
      }
    });
    nextPositions.forEach((pos) => {
      if (!visitedPositions.has(pos)) {
        errors.push(`Position ${pos} has no outgoing path`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateOrbitCycles(config: OrbitConfig): OrbitConfigValidationResult {
    const errors: string[] = [];
    const visited = new Set<string>();
    const pathMap = new Map(
      config.paths.map((p) => [
        `${p.position[0]},${p.position[1]}`,
        `${p.nextPosition[0]},${p.nextPosition[1]}`,
      ])
    );

    // Find and validate all cycles
    const findCycle = (start: string) => {
      const cycle = new Set<string>();
      let current = start;

      while (!cycle.has(current)) {
        cycle.add(current);
        current = pathMap.get(current)!;
        if (!current || !pathMap.has(current)) {
          errors.push(`Broken cycle detected starting from ${start}`);
          return;
        }
        if (cycle.size > config.size * config.size) {
          errors.push(`Invalid cycle length detected starting from ${start}`);
          return;
        }
      }

      // Mark all positions in this cycle as visited
      cycle.forEach((pos) => visited.add(pos));
    };

    // Check each unvisited position starts a valid cycle
    pathMap.forEach((_, pos) => {
      if (!visited.has(pos)) {
        findCycle(pos);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
