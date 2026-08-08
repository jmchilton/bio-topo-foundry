import { contractKeys } from '@galaxy-foundry/reference-contract';
import type { ReferenceContractProps } from '@galaxy-foundry/site-kit';
import {
  SPECIMENS,
  type Specimen,
  type SpecimenGroup,
} from '@galaxy-foundry/site-kit/specimens';

import { contentReader } from './content-reader';
import { referenceContract as loadReferenceContract } from './reference-contract';
import { base } from './site-base';

const referenceContract = loadReferenceContract();

const kindSpecimen = (kind: string): Specimen<ReferenceContractProps> => {
  const term = referenceContract.kinds[kind];
  return {
    id: kind,
    name: term?.label ?? kind,
    why:
      term?.description ??
      `The ${kind} reference kind under this Foundry's palette and fallback accent.`,
    props: {
      contract: referenceContract,
      references: [
        {
          kind,
          ref: `[[gallery-${kind}]]`,
          used_at: 'runtime',
          load: 'upfront',
          mode: 'verbatim',
          evidence: 'corpus-observed',
        },
      ],
    },
  };
};

export const TDA_KIND_SPECIMENS: SpecimenGroup<ReferenceContractProps> = {
  id: 'tda-reference-kinds',
  component: 'ReferenceContract',
  importPath: '@galaxy-foundry/site-kit/ReferenceContract.astro',
  summary:
    'Every reference kind this Foundry declares, derived from its contract so a new kind cannot arrive unseen.',
  surface: 'inline',
  specimens: contractKeys(referenceContract, 'kinds').map(kindSpecimen),
};

export const FILTRATION_HERO_SPECIMENS: SpecimenGroup<{ noteCount: number }> = {
  id: 'tda-filtration-hero',
  component: 'FiltrationHero',
  importPath: '../components/FiltrationHero.astro',
  summary:
    'The interactive frontispiece: a point cloud becomes a complex and leaves one persistent loop.',
  surface: 'isolated',
  specimens: [
    {
      id: 'stable-loop',
      name: 'Structure across scale',
      why:
        'The range control makes filtration tangible while the copy connects multiscale structure to the Foundry workflow.',
      props: { noteCount: contentReader.noteTargets().length },
    },
  ],
};

export const PERSISTENCE_DIVIDER_SPECIMENS: SpecimenGroup<{ seed: string }> = {
  id: 'tda-persistence-divider',
  component: 'PersistenceDivider',
  importPath: '../components/PersistenceDivider.astro',
  summary:
    'A deterministic barcode used as punctuation between conceptual sections.',
  surface: 'inline',
  specimens: [
    {
      id: 'section-punctuation',
      name: 'Persistent section break',
      why:
        'One interval receives the persistent accent, turning a divider into domain-specific hierarchy without adding prose.',
      props: { seed: 'gallery:persistence-divider' },
    },
  ],
};

export const POINT_CLOUD_SPECIMENS: SpecimenGroup<{ seed: string }> = {
  id: 'tda-point-cloud-fingerprint',
  component: 'PointCloudFingerprint',
  importPath: '../components/PointCloudFingerprint.astro',
  summary:
    'Seeded geometric marginalia that gives each surface a stable visual fingerprint.',
  surface: 'inline',
  specimens: [
    {
      id: 'stable-fingerprint',
      name: 'Seeded point cloud',
      why:
        'The same semantic seed always yields the same points, neighborhood edges, and highlighted loop.',
      props: { seed: 'gallery:point-cloud-fingerprint' },
    },
  ],
};

export const TOPOLOGY_BREADCRUMB_SPECIMENS: SpecimenGroup<{
  href: string;
  label: string;
  current: string;
  seed: string;
}> = {
  id: 'tda-topology-breadcrumb',
  component: 'TopologyBreadcrumb',
  importPath: '../components/TopologyBreadcrumb.astro',
  summary:
    'Back navigation drawn as connected nodes, paired with a deterministic point-cloud signature.',
  surface: 'inline',
  specimens: [
    {
      id: 'method-detail',
      name: 'Connected reading path',
      why:
        'The ordinary collection-to-note relationship is expressed as a tiny graph without weakening breadcrumb semantics.',
      props: {
        href: `${base}/methods/`,
        label: 'Methods',
        current: 'Persistent homology',
        seed: 'gallery:topology-breadcrumb',
      },
    },
  ],
};

export const TDA_SPECIMENS: readonly SpecimenGroup[] = [
  TDA_KIND_SPECIMENS,
  FILTRATION_HERO_SPECIMENS,
  PERSISTENCE_DIVIDER_SPECIMENS,
  POINT_CLOUD_SPECIMENS,
  TOPOLOGY_BREADCRUMB_SPECIMENS,
];

export const ALL_SPECIMENS: readonly SpecimenGroup[] = [...SPECIMENS, ...TDA_SPECIMENS];

const groupIds = ALL_SPECIMENS.map((group) => group.id);
if (new Set(groupIds).size !== groupIds.length) {
  throw new Error('gallery specimen group ids must be unique across shared and TDA groups');
}

export const specimenOrigin = (group: SpecimenGroup): 'shared' | 'tda' =>
  TDA_SPECIMENS.some((candidate) => candidate.id === group.id) ? 'tda' : 'shared';
