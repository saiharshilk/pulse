import Svg, { Circle, Polyline } from 'react-native-svg';

import { colors } from '@/theme/colors';

type LogoProps = { size: number; color?: string };

// The heartbeat line, as fractions of the logo's size: flat, a small bump, a tall spike, a dip, flat.
export const LOGO_HEARTBEAT: [number, number][] = [
  [0.14, 0.52],
  [0.36, 0.52],
  [0.42, 0.44],
  [0.47, 0.56],
  [0.53, 0.22],
  [0.6, 0.76],
  [0.66, 0.52],
  [0.86, 0.52],
];
export const LOGO_STROKE_RATIO = 0.035;

// PULSE's original mark: a thin circle with a heartbeat line through it.
export function Logo({ size, color = colors.textPrimary }: LogoProps) {
  const stroke = size * LOGO_STROKE_RATIO;
  const points = LOGO_HEARTBEAT.map(([x, y]) => `${x * size},${y * size}`).join(' ');
  return (
    <Svg width={size} height={size} accessibilityLabel="PULSE logo">
      <Circle cx={size / 2} cy={size / 2} r={size / 2 - stroke} stroke={color} strokeWidth={stroke} fill="none" />
      <Polyline
        points={points}
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
