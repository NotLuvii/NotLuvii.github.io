import type { ComponentType } from "react";
import type { VisualKey } from "./keys";
import type { VisualProps } from "./shared";
import { DashboardVisual } from "./DashboardVisual";
import { SensorsVisual } from "./SensorsVisual";
import { RiskVisual } from "./RiskVisual";
import { InquiryVisual } from "./InquiryVisual";
import { TelemetryVisual } from "./TelemetryVisual";
import { RelevanceVisual } from "./RelevanceVisual";
import { MarketsVisual } from "./MarketsVisual";
import { StemsVisual } from "./StemsVisual";
import { HeroVisual } from "./HeroVisual";

export type StageKey = VisualKey | "hero";

export const visuals: Record<StageKey, ComponentType<VisualProps>> = {
  hero: HeroVisual,
  dashboard: DashboardVisual,
  sensors: SensorsVisual,
  risk: RiskVisual,
  inquiry: InquiryVisual,
  telemetry: TelemetryVisual,
  relevance: RelevanceVisual,
  markets: MarketsVisual,
  stems: StemsVisual,
};
