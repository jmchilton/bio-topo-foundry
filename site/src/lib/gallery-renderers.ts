import ContentNote from '@galaxy-foundry/site-kit/ContentNote.astro';
import LicenseBadge from '@galaxy-foundry/site-kit/LicenseBadge.astro';
import LicenseFileBody from '@galaxy-foundry/site-kit/LicenseFileBody.astro';
import ReferenceContract from '@galaxy-foundry/site-kit/ReferenceContract.astro';
import SiteFooter from '@galaxy-foundry/site-kit/SiteFooter.astro';
import SiteHeader from '@galaxy-foundry/site-kit/SiteHeader.astro';
import SiteShell from '@galaxy-foundry/site-kit/SiteShell.astro';
import TagChips from '@galaxy-foundry/site-kit/TagChips.astro';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

import FiltrationHero from '../components/FiltrationHero.astro';
import PersistenceDivider from '../components/PersistenceDivider.astro';
import PointCloudFingerprint from '../components/PointCloudFingerprint.astro';
import TopologyBreadcrumb from '../components/TopologyBreadcrumb.astro';
import { ALL_SPECIMENS } from './gallery';

export const GALLERY_RENDERERS: Record<string, AstroComponentFactory> = {
  ContentNote,
  LicenseBadge,
  LicenseFileBody,
  ReferenceContract,
  SiteFooter,
  SiteHeader,
  SiteShell,
  TagChips,
  FiltrationHero,
  PersistenceDivider,
  PointCloudFingerprint,
  TopologyBreadcrumb,
};

const unrenderable = ALL_SPECIMENS.filter((group) => !GALLERY_RENDERERS[group.component]);
if (unrenderable.length > 0) {
  throw new Error(
    `gallery has no renderer for: ${unrenderable.map((group) => group.component).join(', ')}`,
  );
}
