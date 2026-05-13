import type { Module, ModuleProps } from "./types";
import { preheader } from "./preheader/preheader";
import { headerUtilityBar } from "./preheader/header-utility-bar";
import { logoLeft } from "./logo/logo-left";
import { logoCenter } from "./logo/logo-center";
import { logoRight } from "./logo/logo-right";
import { bannerHero } from "./banner/banner-hero";
import { heroBgImage } from "./banner/hero-bg-image";
import { heroStacked } from "./banner/hero-stacked";
import { bannerImageLeft } from "./banner/banner-image-left";
import { bannerImageRight } from "./banner/banner-image-right";
import { bodyHeadlineParagraph } from "./body/body-headline-paragraph";
import { bodyHeadlineParagraphCta } from "./body/body-headline-paragraph-cta";
import { bodyTwoColText } from "./body/body-2col-text";
import { bodyTwoColImageText } from "./body/body-2col-image-text";
import { bodyThreeColumns } from "./body/body-three-columns";
import { bodyBullets } from "./body/body-bullets";
import { bodyBulletsNumbered } from "./body/body-bullets-numbered";
import { bodyCtaOnly } from "./body/body-cta-only";
import { bodyCtaPair } from "./body/body-cta-pair";
import { bodyImageCard } from "./body/body-image-card";
import { bodyQuote } from "./body/body-quote";
import { bodyTestimonialImage } from "./body/body-testimonial-image";
import { bodyPromoBanner } from "./body/body-promo-banner";
import { bodyPromoCallout } from "./body/body-promo-callout";
import { bodyProductCard } from "./body/body-product-card";
import { bodyProductReview } from "./body/body-product-review";
import { bodyStatRow } from "./body/body-stat-row";
import { bodyAppBadges } from "./body/body-app-badges";
import { footerLegal } from "./footer/footer-legal";
import { footerSocial } from "./footer/footer-social";
import { footerUnsubscribe } from "./footer/footer-unsubscribe";
import { spacerVertical } from "./spacer/spacer-vertical";
import { spacerDivider } from "./spacer/spacer-divider";
import { spacerDividerAccent } from "./spacer/spacer-divider-accent";

export const MODULES: Module[] = [
  // Preheader
  preheader,
  headerUtilityBar,
  // Logo
  logoLeft,
  logoCenter,
  logoRight,
  // Banner / Hero
  bannerHero,
  heroStacked,
  heroBgImage,
  bannerImageLeft,
  bannerImageRight,
  // Body
  bodyHeadlineParagraph,
  bodyHeadlineParagraphCta,
  bodyTwoColText,
  bodyTwoColImageText,
  bodyThreeColumns,
  bodyBullets,
  bodyBulletsNumbered,
  bodyImageCard,
  bodyQuote,
  bodyTestimonialImage,
  bodyPromoBanner,
  bodyPromoCallout,
  bodyProductCard,
  bodyProductReview,
  bodyStatRow,
  bodyAppBadges,
  bodyCtaOnly,
  bodyCtaPair,
  // Footer
  footerLegal,
  footerSocial,
  footerUnsubscribe,
  // Spacer
  spacerVertical,
  spacerDivider,
  spacerDividerAccent,
];

const moduleMap = new Map<string, Module>(MODULES.map((m) => [m.id, m]));

export function getModule(id: string): Module | undefined {
  return moduleMap.get(id);
}

export function getDefaultProps(id: string): ModuleProps {
  const m = moduleMap.get(id);
  if (!m) return {};
  const props: ModuleProps = {};
  for (const [key, field] of Object.entries(m.schema)) {
    props[key] = field.default;
  }
  return props;
}
