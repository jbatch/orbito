// types.ts
export type Player = "BLACK" | "WHITE";
export type TurnPhase = "MOVE_OPPONENT" | "PLACE_PIECE" | "MUST_ROTATE";
export type CellContent = Player | null;
export type Board = CellContent[][];
export type Position = [number, number] | null;
export type Direction = "up" | "down" | "left" | "right";
export type OrbitPath = {
  position: [number, number];
  nextPosition: [number, number];
};
export type OrbitConfig = {
  name: string;
  paths: OrbitPath[];
  size: number;
};
export interface OrbitConfigValidationResult {
  isValid: boolean;
  errors: string[];
}
