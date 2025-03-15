export type Symbol = '+' | '-' | '×' | '÷';
export type Edge = Symbol;
export type Edges = [Edge, Edge, Edge, Edge];

export interface Piece {
  id: number;
  edges: Edges;
  rotation: number;
}

export interface GameState {
  pieces: Piece[];
  board: (number | null)[];
  selectedPieceId: number | null;
  message: string;
  checkResult: string | null;
}

export interface Position {
  row: number;
  col: number;
}