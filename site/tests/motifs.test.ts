import { describe, expect, it } from 'vitest';

import { barcodeMotif, motifHash, pointCloudMotif } from '../src/lib/motifs';

describe('geometric motifs', () => {
  it('generates stable point-cloud geometry from note metadata', () => {
    const seed = 'package:petls:method/persistent-laplacian';
    expect(pointCloudMotif(seed)).toEqual(pointCloudMotif(seed));
    expect(pointCloudMotif(seed)).not.toEqual(pointCloudMotif(`${seed}:changed`));
    expect(pointCloudMotif(seed).points).toHaveLength(8);
  });

  it('keeps generated geometry inside its compact view boxes', () => {
    const cloud = pointCloudMotif('environment:topometry-1.1');
    for (const point of cloud.points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(104);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(44);
    }

    for (const interval of barcodeMotif('collection:environments')) {
      expect(interval.x1).toBeGreaterThanOrEqual(0);
      expect(interval.x2).toBeLessThanOrEqual(100);
      expect(interval.x2).toBeGreaterThan(interval.x1);
    }
  });

  it('publishes a stable unsigned metadata hash', () => {
    expect(motifHash('topology')).toBe(motifHash('topology'));
    expect(motifHash('topology')).not.toBe(motifHash('Topology'));
  });
});
