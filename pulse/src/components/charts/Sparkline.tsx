import { useId, useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Polyline, Stop } from 'react-native-svg';

type SparklineProps = { values: number[]; color: string; height: number };

const LINE_WIDTH = 2;
const FILL_OPACITY = 0.3;

export function Sparkline({ values, color, height }: SparklineProps) {
  const [width, setWidth] = useState(0);
  // SVG gradient ids must be unique on screen and can't contain React's ":" characters.
  const gradientId = `sparkline-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const canDraw = width > 0 && values.length >= 2;
  let points: { x: number; y: number }[] = [];
  if (canDraw) {
    const min = Math.min(...values);
    const range = Math.max(1, Math.max(...values) - min);
    const usableHeight = height - LINE_WIDTH * 2;
    points = values.map((value, i) => ({
      x: (i / (values.length - 1)) * width,
      y: LINE_WIDTH + usableHeight * (1 - (value - min) / range),
    }));
  }
  const line = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M0,${height} L${points.map((p) => `${p.x},${p.y}`).join(' L')} L${width},${height} Z`;

  return (
    <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {canDraw && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={FILL_OPACITY} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={area} fill={`url(#${gradientId})`} />
          <Polyline points={line} fill="none" stroke={color} strokeWidth={LINE_WIDTH} strokeLinejoin="round" />
        </Svg>
      )}
    </View>
  );
}
