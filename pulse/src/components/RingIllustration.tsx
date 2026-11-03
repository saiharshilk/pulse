import { useId } from 'react';
import Svg, { Defs, Ellipse, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

import { svgId } from '@/components/charts/useChartReveal';

type RingIllustrationProps = { width: number };

// Original artwork: a dark, glossy smart ring seen at an angle, with a faint green sensor glow.
export function RingIllustration({ width }: RingIllustrationProps) {
  const height = width * 0.8;
  const reactId = useId();
  const bodyId = svgId('ring-body', reactId);
  const glowId = svgId('ring-glow', reactId);
  const shineId = svgId('ring-shine', reactId);
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Svg width={width} height={height} accessibilityLabel="Smart ring">
      <Defs>
        <LinearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4A545E" />
          <Stop offset="0.45" stopColor="#1C2228" />
          <Stop offset="1" stopColor="#0B0E11" />
        </LinearGradient>
        <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#2DD37B" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#2DD37B" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={shineId} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {/* Sensor glow under the band */}
      <Ellipse cx={cx} cy={cy + height * 0.3} rx={width * 0.3} ry={height * 0.12} fill={`url(#${glowId})`} />
      {/* Band: an outer ellipse with the inner opening cut out by drawing it in the background color */}
      <Ellipse cx={cx} cy={cy} rx={width * 0.46} ry={height * 0.4} fill={`url(#${bodyId})`} />
      <Ellipse cx={cx} cy={cy - height * 0.03} rx={width * 0.33} ry={height * 0.26} fill="#0F1317" />
      {/* Inner sensor strip catching the green light */}
      <Ellipse cx={cx} cy={cy + height * 0.13} rx={width * 0.12} ry={height * 0.035} fill="#2DD37B" opacity={0.5} />
      {/* Highlight along the top edge */}
      <Ellipse cx={cx} cy={cy - height * 0.33} rx={width * 0.26} ry={height * 0.035} fill={`url(#${shineId})`} />
    </Svg>
  );
}
