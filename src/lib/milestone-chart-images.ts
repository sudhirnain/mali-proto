/**
 * Static milestone-chart images (Jonas round-2 s12: "We don't have this graph
 * as data, but just as pictures. Can you show us how we can add this to the
 * new design with the existing images?").
 *
 * Their CMS has the curve only as a rendered PNG — but the one personalized
 * element, the "now" marker, doesn't need curve data: it only needs the
 * x-axis scale and the baby's age. So image-mode renders their PNG inside the
 * same card chrome and overlays our marker at the calibrated x position.
 *
 * Calibration is per-image (fractions of the image box): x of month 0 / month
 * `monthsMax`, and the vertical extent of the plot area. One sample is
 * calibrated (m-face, cropped from their production screenshot in the round-2
 * deck); per-image calibration is the cost of this approach — fine if their
 * chart PNGs share one layout, painful if every image differs.
 */
export type MilestoneChartImage = {
  src: string;
  /** x position of month 0 / month monthsMax, as fractions of image width. */
  x0: number;
  x1: number;
  monthsMax: number;
  /** Vertical extent of the plot area, as fractions of image height. */
  yTop: number;
  yBottom: number;
};

export const MILESTONE_CHART_IMAGES: Record<string, MilestoneChartImage> = {
  "m-face": {
    src: "/mali-art/charts/denver-m-face.png",
    x0: 0.088,
    x1: 0.918,
    monthsMax: 6,
    yTop: 0.13,
    yBottom: 0.855,
  },
};
