import { useId, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Line, Polyline, Rect } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { MS_PER_MINUTE } from '@/utils/time';

import { paddedDomain, scaleLinear, splitAtGaps, toPolylinePoints, type ChartPoint } from './chartMath';
import { svgId, useChartReveal } from './useChartReveal';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const PAD_LEFT = 30; // room for the y-axis labels
const PAD_TOP = 8;
const PAD_BOTTOM = 4;
const LINE_WIDTH = 2;
const DOT_RADIUS = 3.5;
const Y_LABEL_HALF_HEIGHT = 7;
const DEFAULT_MAX_GAP_MS = 20 * MS_PER_MINUTE;

type Range = { start: number; end: number };

type LineChartProps = {
  data: ChartPoint[];
  color: string;
  height: number;
  xDomain?: Range; // defaults to the first and last point
  shadedRanges?: Range[]; // e.g. activities
  shadeColor?: string;
  band?: { low: number; high: number }; // e.g. baseline ± 1 SD
  referenceLine?: number; // dashed horizontal line
  startLabel?: string;
  endLabel?: string;
  maxGapMs?: number; // longer gaps break the line
  variant?: 'line' | 'dots'; // dots suit sparse readings like SpO2 spot checks
  animateReveal?: boolean; // false for live charts that update every second
  minYSpan?: number; // keeps a nearly flat series from looking dramatic, e.g. 20 bpm
};

export function LineChart({
  data,
  color,
  height,
  xDomain,
  shadedRanges = [],
  shadeColor = colors.strainTranslucent,
  band,
  referenceLine,
  startLabel,
  endLabel,
  maxGapMs = DEFAULT_MAX_GAP_MS,
  variant = 'line',
  animateReveal = true,
  minYSpan = 0,
}: LineChartProps) {
  const [width, setWidth] = useState(0);
  const clipId = svgId('line-clip', useId());
  const reveal = useChartReveal(data.length, animateReveal);
  const plotWidth = Math.max(0, width - PAD_LEFT);
  const clipProps = useAnimatedProps(() => ({ width: plotWidth * reveal.get() }));

  const first = data[0];
  const last = data.at(-1);
  const x0 = xDomain?.start ?? first?.x ?? 0;
  const x1 = xDomain?.end ?? last?.x ?? 1;
  const yValues = data.map((point) => point.y);
  if (band !== undefined) yValues.push(band.low, band.high);
  if (referenceLine !== undefined) yValues.push(referenceLine);
  const y = paddedDomain(Math.min(...yValues), Math.max(...yValues), { minSpan: minYSpan });

  const toX = (value: number) => PAD_LEFT + scaleLinear(value, [x0, x1], [0, plotWidth]);
  const toY = (value: number) => scaleLinear(value, [y.min, y.max], [height - PAD_BOTTOM, PAD_TOP]);
  const canDraw = width > 0 && data.length >= (variant === 'dots' ? 1 : 2);

  return (
    <View>
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {canDraw && (
          <Svg width={width} height={height}>
            <Defs>
              <ClipPath id={clipId}>
                <AnimatedRect animatedProps={clipProps} x={PAD_LEFT} y={0} height={height} />
              </ClipPath>
            </Defs>
            {[y.min, y.max].map((value) => (
              <Line key={value} x1={PAD_LEFT} x2={width} y1={toY(value)} y2={toY(value)} stroke={colors.track} strokeWidth={1} />
            ))}
            {band !== undefined && (
              <Rect
                x={PAD_LEFT}
                width={plotWidth}
                y={toY(band.high)}
                height={Math.max(0, toY(band.low) - toY(band.high))}
                fill={colors.chartBand}
              />
            )}
            {shadedRanges.map((range) => (
              <Rect
                key={range.start}
                x={toX(range.start)}
                width={Math.max(1, toX(range.end) - toX(range.start))}
                y={PAD_TOP}
                height={height - PAD_TOP - PAD_BOTTOM}
                fill={shadeColor}
              />
            ))}
            {referenceLine !== undefined && (
              <Line
                x1={PAD_LEFT}
                x2={width}
                y1={toY(referenceLine)}
                y2={toY(referenceLine)}
                stroke={colors.textSecondary}
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            )}
            <G clipPath={`url(#${clipId})`}>
              {variant === 'dots' &&
                data.map((point) => <Circle key={point.x} cx={toX(point.x)} cy={toY(point.y)} r={DOT_RADIUS} fill={color} />)}
              {variant === 'line' && splitAtGaps(data, maxGapMs).map((segment) => (
                <Polyline
                  key={segment[0].x}
                  points={toPolylinePoints(segment, toX, toY)}
                  fill="none"
                  stroke={color}
                  strokeWidth={LINE_WIDTH}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
            </G>
          </Svg>
        )}
        {/* Labels are plain Text so they use the system font, which SVG text doesn't. */}
        {canDraw &&
          [y.min, y.max].map((value) => (
            <Text key={value} style={[styles.yLabel, { top: toY(value) - Y_LABEL_HALF_HEIGHT }]}>
              {String(Math.round(value))}
            </Text>
          ))}
      </View>
      {(startLabel !== undefined || endLabel !== undefined) && (
        <View style={styles.xLabels}>
          <Text style={typography.caption}>{startLabel}</Text>
          <Text style={typography.caption}>{endLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  yLabel: { ...typography.caption, fontSize: 11, position: 'absolute', left: 0 },
  xLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: PAD_LEFT, marginTop: 4 },
});
