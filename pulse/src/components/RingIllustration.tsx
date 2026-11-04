import { useId } from "react";
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { svgId } from "@/components/charts/useChartReveal";
import { colors } from "@/theme/colors";

type RingIllustrationProps = { width: number };

const art = colors.ringArt;

// Drawn in a 100 × 80 box and scaled to the requested width.
const VIEW_W = 100;
const VIEW_H = 80;
const TILT_DEG = -14;
const CX = 50;
const TOP_Y = 33; // center of the rim facing the viewer
const BAND_DEPTH = 12; // how far the far rim sits below it on screen
const BOTTOM_Y = TOP_Y + BAND_DEPTH;
const OUTER = { rx: 36, ry: 16 };
const INNER = { rx: 31.5, ry: 13 };

function ellipsePath(cy: number, rx: number, ry: number): string {
  return `M ${CX - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
}

// The outside of the band below the rim: the lower half of the top rim, down the sides and
// along the lower half of the far rim.
const BAND_PATH =
  `M ${CX - OUTER.rx} ${TOP_Y} A ${OUTER.rx} ${OUTER.ry} 0 0 0 ${CX + OUTER.rx} ${TOP_Y} ` +
  `L ${CX + OUTER.rx} ${BOTTOM_Y} A ${OUTER.rx} ${OUTER.ry} 0 0 1 ${CX - OUTER.rx} ${BOTTOM_Y} Z`;
// The top face of the band: the outer edge minus the opening.
const RIM_PATH = `${ellipsePath(TOP_Y, OUTER.rx, OUTER.ry)} ${ellipsePath(TOP_Y, INNER.rx, INNER.ry)}`;
// Seen through the opening: the inner surface of the far side, everywhere except where the far
// opening lets the background show through.
const INNER_WALL_PATH = `M 0 0 H ${VIEW_W} V ${VIEW_H} H 0 Z ${ellipsePath(BOTTOM_Y, INNER.rx, INNER.ry)}`;
// A highlight along the upper left of the rim.
const SHINE_PATH = `M ${CX - OUTER.rx + 3} ${TOP_Y - 5} A ${OUTER.rx - 1} ${OUTER.ry - 1} 0 0 1 ${CX + 6} ${TOP_Y - OUTER.ry + 1}`;
// The sensors sit on the inner surface, just above the far opening.
const SENSOR_Y = BOTTOM_Y - INNER.ry - 2.6;

// Original artwork: a dark metal smart ring, tilted and seen at an angle, with its opening
// visible and the green sensor light glowing on the inner surface.
export function RingIllustration({ width }: RingIllustrationProps) {
  const reactId = useId();
  const ids = {
    rim: svgId("ring-rim", reactId),
    band: svgId("ring-band", reactId),
    inner: svgId("ring-inner", reactId),
    glow: svgId("ring-glow", reactId),
    opening: svgId("ring-opening", reactId),
  };

  return (
    <Svg
      width={width}
      height={(width * VIEW_H) / VIEW_W}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      accessibilityLabel="Smart ring"
    >
      <Defs>
        <LinearGradient id={ids.rim} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={art.rimMid} />
          <Stop offset="0.3" stopColor={art.rimLight} />
          <Stop offset="0.7" stopColor={art.rimDark} />
          <Stop offset="1" stopColor={art.rimMid} />
        </LinearGradient>
        <LinearGradient id={ids.band} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={art.bandDark} />
          <Stop offset="0.28" stopColor={art.bandLight} />
          <Stop offset="0.6" stopColor={art.bandMid} />
          <Stop offset="1" stopColor={art.bandDark} />
        </LinearGradient>
        <LinearGradient id={ids.inner} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={art.inner} />
          <Stop offset="1" stopColor={art.innerEdge} />
        </LinearGradient>
        <RadialGradient id={ids.glow} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={art.sensorGlow} stopOpacity={0.75} />
          <Stop offset="1" stopColor={art.sensorGlow} stopOpacity={0} />
        </RadialGradient>
        <ClipPath id={ids.opening}>
          <Ellipse cx={CX} cy={TOP_Y} rx={INNER.rx} ry={INNER.ry} />
        </ClipPath>
      </Defs>
      <G transform={`rotate(${TILT_DEG} ${CX} ${VIEW_H / 2})`}>
        <Path d={BAND_PATH} fill={`url(#${ids.band})`} />
        <G clipPath={`url(#${ids.opening})`}>
          <Path
            d={INNER_WALL_PATH}
            fill={`url(#${ids.inner})`}
            fillRule="evenodd"
          />
          <Ellipse
            cx={CX}
            cy={SENSOR_Y}
            rx={17}
            ry={6}
            fill={`url(#${ids.glow})`}
          />
          <Ellipse
            cx={CX}
            cy={SENSOR_Y}
            rx={2.6}
            ry={1.2}
            fill={art.sensorDot}
          />
          <Ellipse
            cx={CX - 6}
            cy={SENSOR_Y - 0.3}
            rx={1.6}
            ry={0.8}
            fill={art.sensorGlow}
          />
          <Ellipse
            cx={CX + 6}
            cy={SENSOR_Y - 0.3}
            rx={1.6}
            ry={0.8}
            fill={art.sensorGlow}
          />
        </G>
        <Path d={RIM_PATH} fill={`url(#${ids.rim})`} fillRule="evenodd" />
        <Path
          d={SHINE_PATH}
          stroke={art.shine}
          strokeOpacity={0.45}
          strokeWidth={1.2}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}
