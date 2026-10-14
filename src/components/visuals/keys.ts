/** Every project drawing. Kept free of React so content tests can check against it. */
export const VISUAL_KEYS = ["dashboard", "sensors", "risk", "inquiry", "telemetry", "relevance", "markets", "stems"] as const;
export type VisualKey = (typeof VISUAL_KEYS)[number];
