export interface MotifPoint {
  x: number;
  y: number;
}

export interface MotifEdge {
  from: MotifPoint;
  to: MotifPoint;
}

export interface PointCloudMotif {
  key: string;
  points: MotifPoint[];
  edges: MotifEdge[];
  loop: string;
}

export interface BarcodeInterval {
  x1: number;
  x2: number;
  y: number;
}

/** A small stable hash: metadata in, repeatable geometry out. */
export function motifHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFrom(seed: number): () => number {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const rounded = (value: number) => Math.round(value * 10) / 10;

export function pointCloudMotif(seed: string, count = 8): PointCloudMotif {
  const hash = motifHash(seed);
  const random = randomFrom(hash);
  const step = 84 / Math.max(1, count - 1);
  const points = Array.from({ length: count }, (_, index) => ({
    x: rounded(10 + step * index + (random() - 0.5) * 7),
    y: rounded(8 + random() * 28),
  }));

  const edges = points.slice(1).map((point, index) => ({ from: points[index], to: point }));
  for (let index = 0; index < count - 2; index += 2) {
    if (random() > 0.38) edges.push({ from: points[index], to: points[index + 2] });
  }

  const left = rounded(25 + random() * 7);
  const right = rounded(73 + random() * 7);
  const top = rounded(8 + random() * 5);
  const bottom = rounded(32 + random() * 5);
  const middle = rounded((top + bottom) / 2);
  const loop = [
    `M ${left} ${middle}`,
    `C ${left - 2} ${top}, ${right - 8} ${top - 2}, ${right} ${middle - 2}`,
    `C ${right + 3} ${bottom}, ${left + 9} ${bottom + 2}, ${left} ${middle}`,
    'Z',
  ].join(' ');

  return { key: hash.toString(16).padStart(8, '0'), points, edges, loop };
}

export function barcodeMotif(seed: string, count = 7): BarcodeInterval[] {
  const hash = motifHash(seed);
  const random = randomFrom(hash);
  const persistentIndex = hash % count;
  return Array.from({ length: count }, (_, index) => {
    const persistent = index === persistentIndex;
    const x1 = persistent ? 5 + random() * 8 : 12 + random() * 33;
    const x2 = persistent ? 88 + random() * 7 : Math.max(x1 + 13, 57 + random() * 36);
    return {
      x1: rounded(x1),
      x2: rounded(Math.min(96, x2)),
      y: rounded(4 + index * (12 / Math.max(1, count - 1))),
    };
  });
}
