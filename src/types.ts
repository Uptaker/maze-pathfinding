export enum Type {
  START = 'S', FINISH = 'F', GRAY = 'G', BLACK = 'B', OBSTACLE = 'O', EMPTY = '.'
}

export enum Direction {
  UP = 'U', DOWN = 'D', LEFT = 'L', RIGHT = 'R'
}

export interface Position {
  x: number,
  y: number
}

export interface Tile {
  type: Type,
  x: number,
  y: number
  direction?: Direction
}