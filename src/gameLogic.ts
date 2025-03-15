import { Symbol, Edge, Edges, Piece, GameState } from './types';

const SYMBOLS: Symbol[] = ['+', '-', '×', '÷'];
const BOARD_SIZE = 3;

export class GameLogic {
  private state: GameState;

  constructor() {
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    return {
      pieces: this.createPieces(),
      board: Array(9).fill(null),
      selectedPieceId: null,
      message: 'Select a piece and place it on the board',
      checkResult: null
    };
  }

  private createPieces(): Piece[] {
    const pieces: Piece[] = [];
    const usedPatterns = new Set<string>();

    for (let i = 0; i < 9; i++) {
      let edges: Edges;
      let patternKey: string;
      
      do {
        edges = this.generateRandomEdges();
        patternKey = edges.join(',');
      } while (usedPatterns.has(patternKey));

      usedPatterns.add(patternKey);
      pieces.push({
        id: i,
        edges,
        rotation: 0
      });
    }

    return pieces;
  }

  private generateRandomEdges(): Edges {
    const edges: Edges = ['×', '×', '×', '×'] as Edges;
    
    for (let i = 0; i < 4; i++) {
      edges[i] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }

    return edges;
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public selectPiece(pieceId: number): void {
    if (!this.isPieceAvailable(pieceId)) {
      this.state.message = 'This piece is already placed on the board';
      return;
    }

    this.state.selectedPieceId = pieceId;
    this.state.message = 'Piece selected. Rotate or place it on the board.';
  }

  public rotatePiece(direction: 'clockwise' | 'anticlockwise'): void {
    if (this.state.selectedPieceId === null) {
      this.state.message = 'Select a piece first';
      return;
    }

    const piece = this.state.pieces.find(p => p.id === this.state.selectedPieceId);
    if (!piece) return;

    const rotationDelta = direction === 'clockwise' ? 90 : -90;
    piece.rotation = (piece.rotation + rotationDelta + 360) % 360;

    const edges = [...piece.edges];
    if (direction === 'clockwise') {
      const temp = edges[0];
      edges[0] = edges[3];
      edges[3] = edges[2];
      edges[2] = edges[1];
      edges[1] = temp;
    } else {
      const temp = edges[0];
      edges[0] = edges[1];
      edges[1] = edges[2];
      edges[2] = edges[3];
      edges[3] = temp;
    }
    piece.edges = edges as Edges;
  }

  public placePiece(position: number): void {
    if (this.state.selectedPieceId === null) {
      this.state.message = 'Select a piece first';
      return;
    }

    if (this.state.board[position] !== null) {
      this.state.message = 'This position is already occupied';
      return;
    }

    const piece = this.state.pieces.find(p => p.id === this.state.selectedPieceId);
    if (piece && !this.isValidPlacement(piece, position)) {
      this.state.message = 'Invalid placement. Edges must match adjacent pieces.';
      return;
    }

    this.state.board[position] = this.state.selectedPieceId;
    this.state.selectedPieceId = null;
    this.state.message = 'Piece placed! Select another piece.';
  }

  private isValidPlacement(piece: Piece, position: number): boolean {
    const row = Math.floor(position / BOARD_SIZE);
    const col = position % BOARD_SIZE;

    if (row > 0) {
      const topPiece = this.getPieceAt((row - 1) * BOARD_SIZE + col);
      if (topPiece && topPiece.edges[2] !== piece.edges[0]) {
        return false;
      }
    }

    if (col < BOARD_SIZE - 1) {
      const rightPiece = this.getPieceAt(row * BOARD_SIZE + col + 1);
      if (rightPiece && rightPiece.edges[3] !== piece.edges[1]) {
        return false;
      }
    }

    if (row < BOARD_SIZE - 1) {
      const bottomPiece = this.getPieceAt((row + 1) * BOARD_SIZE + col);
      if (bottomPiece && bottomPiece.edges[0] !== piece.edges[2]) {
        return false;
      }
    }

    if (col > 0) {
      const leftPiece = this.getPieceAt(row * BOARD_SIZE + col - 1);
      if (leftPiece && leftPiece.edges[1] !== piece.edges[3]) {
        return false;
      }
    }

    return true;
  }

  public checkSolution(): void {
    if (this.state.board.some(cell => cell === null)) {
      this.state.checkResult = 'Incomplete: Fill all positions on the board';
      return;
    }

    const errors: string[] = [];
    let validPatterns = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 1; col++) {
        const pos1 = row * BOARD_SIZE + col;
        const pos2 = row * BOARD_SIZE + col + 1;
        
        const piece1 = this.getPieceAt(pos1);
        const piece2 = this.getPieceAt(pos2);
        
        if (piece1 && piece2) {
          if (piece1.edges[1] === piece2.edges[3]) {
            validPatterns++;
          } else {
            errors.push(`Mismatch at row ${row + 1}, between columns ${col + 1} and ${col + 2}`);
          }
        }
      }
    }

    for (let row = 0; row < BOARD_SIZE - 1; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const pos1 = row * BOARD_SIZE + col;
        const pos2 = (row + 1) * BOARD_SIZE + col;
        
        const piece1 = this.getPieceAt(pos1);
        const piece2 = this.getPieceAt(pos2);
        
        if (piece1 && piece2) {
          if (piece1.edges[2] === piece2.edges[0]) {
            validPatterns++;
          } else {
            errors.push(`Mismatch at column ${col + 1}, between rows ${row + 1} and ${row + 2}`);
          }
        }
      }
    }

    const totalPossiblePatterns = (BOARD_SIZE - 1) * BOARD_SIZE * 2;
    const patternCompletionPercentage = Math.round((validPatterns / totalPossiblePatterns) * 100);

    this.state.checkResult = errors.length === 0 
      ? `Success! All edges match correctly and form valid patterns (100% complete)`
      : `Incorrect: Found ${errors.length} mismatches (${patternCompletionPercentage}% patterns complete)\n${errors.join('\n')}`;
  }

  public resetGame(): void {
    this.state = this.initializeGame();
  }

  private getPieceAt(position: number): Piece | null {
    const pieceId = this.state.board[position];
    return pieceId !== null ? this.state.pieces.find(p => p.id === pieceId) || null : null;
  }

  private isPieceAvailable(pieceId: number): boolean {
    return !this.state.board.includes(pieceId);
  }

  public getAvailablePieces(): Piece[] {
    return this.state.pieces.filter(piece => !this.state.board.includes(piece.id));
  }

  public solvePuzzle(): void {
    this.state.board = Array(9).fill(null);
    this.state.selectedPieceId = null;

    const pieces = [...this.state.pieces];
    const solution = this.findSolution(pieces);

    if (solution) {
      this.state.board = solution;
      this.state.message = 'Puzzle solved automatically!';
      this.checkSolution();
    } else {
      this.state.message = 'Could not find a valid solution. Try resetting the puzzle.';
    }
  }

  private findSolution(remainingPieces: Piece[], position: number = 0, board: (number | null)[] = Array(9).fill(null)): (number | null)[] | null {
    if (position >= 9) {
      return board;
    }

    for (let i = 0; i < remainingPieces.length; i++) {
      const piece = remainingPieces[i];
      const originalEdges = [...piece.edges];

      for (let rotation = 0; rotation < 4; rotation++) {
        if (this.canPlacePieceAt(piece, position, board)) {
          const newBoard = [...board];
          newBoard[position] = piece.id;

          const newRemaining = [...remainingPieces];
          newRemaining.splice(i, 1);

          const solution = this.findSolution(newRemaining, position + 1, newBoard);
          if (solution) {
            return solution;
          }
        }

        const temp = piece.edges[0];
        piece.edges[0] = piece.edges[3];
        piece.edges[3] = piece.edges[2];
        piece.edges[2] = piece.edges[1];
        piece.edges[1] = temp;
      }

      piece.edges = [...originalEdges] as Edges;
    }

    return null;
  }

  private canPlacePieceAt(piece: Piece, position: number, board: (number | null)[]): boolean {
    const row = Math.floor(position / BOARD_SIZE);
    const col = position % BOARD_SIZE;

    if (row > 0) {
      const topPiece = this.getPieceAtFromBoard((row - 1) * BOARD_SIZE + col, board);
      if (topPiece && topPiece.edges[2] !== piece.edges[0]) {
        return false;
      }
    }

    if (col < BOARD_SIZE - 1) {
      const rightPiece = this.getPieceAtFromBoard(row * BOARD_SIZE + col + 1, board);
      if (rightPiece && rightPiece.edges[3] !== piece.edges[1]) {
        return false;
      }
    }

    if (row < BOARD_SIZE - 1) {
      const bottomPiece = this.getPieceAtFromBoard((row + 1) * BOARD_SIZE + col, board);
      if (bottomPiece && bottomPiece.edges[0] !== piece.edges[2]) {
        return false;
      }
    }

    if (col > 0) {
      const leftPiece = this.getPieceAtFromBoard(row * BOARD_SIZE + col - 1, board);
      if (leftPiece && leftPiece.edges[1] !== piece.edges[3]) {
        return false;
      }
    }

    return true;
  }

  private getPieceAtFromBoard(position: number, board: (number | null)[]): Piece | null {
    const pieceId = board[position];
    return pieceId !== null ? this.state.pieces.find(p => p.id === pieceId) || null : null;
  }
}