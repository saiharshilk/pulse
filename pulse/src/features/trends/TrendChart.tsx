import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { colors } from '@/theme/colors';

import { TREND_METRICS, type TrendMetricKey } from './trendMetrics';
import type { TrendChartData } from './trendView';

type TrendChartProps = { metric: TrendMetricKey; chart: TrendChartData; height: number };

// Draws a trend card's chart, whichever kind the metric uses.
export function TrendChart({ metric, chart, height }: TrendChartProps) {
  if (chart.kind === 'bar') {
    return (
      <BarChart
        bars={chart.bars}
        maxValue={chart.maxValue}
        target={chart.target}
        showValueLabels={chart.showValueLabels}
        startLabel={chart.startLabel}
        endLabel={chart.endLabel}
        height={height}
      />
    );
  }
  const color = metric === 'restingHR' ? colors.recoveryRed : TREND_METRICS[metric].color(0);
  return (
    <LineChart
      data={chart.data}
      variant={chart.variant}
      band={chart.band}
      xDomain={chart.xDomain}
      startLabel={chart.startLabel}
      endLabel={chart.endLabel}
      color={color}
      height={height}
      maxGapMs={Infinity}
    />
  );
}
