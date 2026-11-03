import { useId, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Polyline, Rect } from 'react-native-svg';

import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { typography } from '@/theme/typography';

import { scaleLinear, toPolylinePoints, type ChartPoint } from './chartMath';
import { svgId, useChartReveal } from './useChartReveal';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const AWAKE_RAISE = 4; // awake segments stick out this far above and below the bar
const HR_GAP = 8; // space between the heart-rate line and the bar

type SleepTimelineProps = {
  start: number;
  end: number;
  awakeIntervals: { start: number; end: number }[];
  startLabel: string;
  endLabel: string;
  heartRate?: ChartPoint[];
};

export function SleepTimeline({ start, end, awakeIntervals, startLabel, endLabel, heartRate = [] }: SleepTimelineProps) {
  const [width, setWidth] = useState(0);
  const clipId = svgId('sleep-clip', useId());
  const reveal = useChartReveal(start);
  const clipProps = useAnimatedProps(() => ({ width: width * reveal.get() }));

  const showHeartRate = heartRate.length >= 2;
  const hrHeight = showHeartRate ? layout.sleepTimelineHrHeight : 0;
  const barY = hrHeight + (showHeartRate ? HR_GAP : 0) + AWAKE_RAISE;
  const barHeight = layout.sleepTimelineBarHeight;
  const height = barY + barHeight + AWAKE_RAISE;

  const toX = (ts: number) => scaleLinear(ts, [start, end], [0, width]);
  const bpms = heartRate.map((point) => point.y);
  const toY = (bpm: number) => scaleLinear(bpm, [Math.min(...bpms), Math.max(...bpms)], [hrHeight - 2, 2]);

  return (
    <View>
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <ClipPath id={clipId}>
                <AnimatedRect animatedProps={clipProps} x={0} y={0} height={height} />
              </ClipPath>
            </Defs>
            <G clipPath={`url(#${clipId})`}>
              {showHeartRate && (
                <Polyline
                  points={toPolylinePoints(heartRate, toX, toY)}
                  fill="none"
                  stroke={colors.recoveryRed}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
              )}
              <Rect x={0} y={barY} width={width} height={barHeight} rx={barHeight / 2} fill={colors.sleep} />
              {awakeIntervals.map((interval) => (
                <Rect
                  key={interval.start}
                  x={toX(interval.start)}
                  y={barY - AWAKE_RAISE}
                  width={Math.max(2, toX(interval.end) - toX(interval.start))}
                  height={barHeight + AWAKE_RAISE * 2}
                  rx={2}
                  fill={colors.warn}
                />
              ))}
            </G>
          </Svg>
        )}
      </View>
      <View style={styles.labels}>
        <Text style={typography.caption}>{startLabel}</Text>
        <Text style={typography.caption}>{endLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
});
