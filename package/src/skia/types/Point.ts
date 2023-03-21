export enum PointMode {
  Points,
  Lines,
  Polygon,
}

export interface SkPoint {
  readonly x: number;
  readonly y: number;
}

export interface SkPoint3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export type Vector = SkPoint;
