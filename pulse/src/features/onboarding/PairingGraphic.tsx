import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';

import { RingIllustration } from '@/components/RingIllustration';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';

import type { PairingState } from './usePairing';

type PairingGraphicProps = { state: PairingState['kind'] };

const PHONE_HEIGHT_RATIO = 1.9;
const LINE_HEIGHT = 2;
const SPINNER_STROKE = 3;
// The link row is a fixed height so the line, the end nodes and the middle node share one center.
const LINK_HEIGHT = layout.pairingCheckSize + 24;

// Original art in the composition of a pairing screen: phone on the left, ring on the right,
// a line between them with a node at each end and a status node in the middle.
export function PairingGraphic({ state }: PairingGraphicProps) {
  const pulse = useSharedValue(0);
  const spin = useSharedValue(0);
  const check = useSharedValue(0);
  const isConnected = state === 'connected';
  const lineColor = isConnected ? colors.good : colors.textSecondary;

  useEffect(() => {
    pulse.set(state === 'searching' ? withRepeat(withTiming(1, { duration: 700 }), -1, true) : withTiming(0));
    spin.set(0);
    if (state === 'connecting') spin.set(withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1));
    check.set(isConnected ? withSpring(1, { damping: 9, stiffness: 140 }) : 0);
  }, [state, isConnected, pulse, spin, check]);

  const lineStyle = useAnimatedStyle(() => ({ opacity: 1 - 0.65 * pulse.get() }));
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.get()}deg` }] }));
  const checkStyle = useAnimatedStyle(() => ({ opacity: check.get(), transform: [{ scale: check.get() }] }));

  const phoneWidth = layout.pairingPhoneWidth;
  const phoneHeight = phoneWidth * PHONE_HEIGHT_RATIO;
  const node = layout.pairingNodeSize;
  const checkSize = layout.pairingCheckSize;
  const hub = node * 2 + SPINNER_STROKE * 2;

  return (
    <View style={styles.row} accessibilityLabel={isConnected ? 'Ring connected' : 'Connecting phone to ring'}>
      <Svg width={phoneWidth} height={phoneHeight}>
        <Rect x={1} y={1} width={phoneWidth - 2} height={phoneHeight - 2} rx={14} stroke={colors.textPrimary} strokeWidth={2} fill={colors.card} />
        <Rect x={phoneWidth * 0.35} y={8} width={phoneWidth * 0.3} height={5} rx={2.5} fill={colors.track} />
      </Svg>

      <View style={styles.link}>
        <Animated.View style={[styles.line, { backgroundColor: lineColor }, lineStyle]} />
        <View style={[styles.endNode, styles.leftNode, { width: node, height: node, borderColor: lineColor }]} />
        <View style={[styles.endNode, styles.rightNode, { width: node, height: node, borderColor: lineColor }]} />
        <View style={styles.center}>
          {/* The spinner and the middle node share one box, so the spinner turns around the node. */}
          {!isConnected && (
            <View style={{ width: hub, height: hub }}>
              <View style={[styles.idleNode, { top: (hub - node) / 2, left: (hub - node) / 2, width: node, height: node }]} />
              {state === 'connecting' && (
                <Animated.View style={[styles.fill, spinStyle]}>
                  <Svg width={hub} height={hub} style={styles.fill}>
                    <Circle
                      cx={hub / 2}
                      cy={hub / 2}
                      r={hub / 2 - SPINNER_STROKE}
                      stroke={colors.link}
                      strokeWidth={SPINNER_STROKE}
                      strokeDasharray={`${hub} ${hub * 2}`}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                </Animated.View>
              )}
            </View>
          )}
          {isConnected && (
            <Animated.View style={[styles.check, { width: checkSize, height: checkSize, borderRadius: checkSize / 2 }, checkStyle]}>
              <Ionicons name="checkmark" size={checkSize * 0.6} color={colors.textPrimary} />
            </Animated.View>
          )}
        </View>
      </View>

      <RingIllustration width={layout.ringIllustrationWidth * 0.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  link: { flex: 1, height: LINK_HEIGHT, marginHorizontal: -4 },
  line: { position: 'absolute', top: (LINK_HEIGHT - LINE_HEIGHT) / 2, left: layout.pairingNodeSize / 2, right: layout.pairingNodeSize / 2, height: LINE_HEIGHT },
  endNode: { position: 'absolute', top: (LINK_HEIGHT - layout.pairingNodeSize) / 2, borderRadius: layout.pairingNodeSize / 2, borderWidth: 2, backgroundColor: colors.bgBottom },
  leftNode: { left: 0 },
  rightNode: { right: 0 },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  idleNode: { position: 'absolute', borderRadius: layout.pairingNodeSize / 2, backgroundColor: colors.card, borderColor: colors.textSecondary, borderWidth: 2 },
  check: {
    backgroundColor: colors.good,
    alignItems: 'center',
    justifyContent: 'center',
    // The glow around the green circle.
    shadowColor: colors.good,
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
