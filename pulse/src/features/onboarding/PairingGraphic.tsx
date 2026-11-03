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
          {state === 'connecting' && (
            <Animated.View style={spinStyle}>
              <Svg width={node * 2} height={node * 2}>
                <Circle cx={node} cy={node} r={node - 2} stroke={colors.link} strokeWidth={3} strokeDasharray={`${node * 2} ${node * 4}`} fill="none" />
              </Svg>
            </Animated.View>
          )}
          {isConnected && (
            <Animated.View style={[styles.check, { width: checkSize, height: checkSize, borderRadius: checkSize / 2 }, checkStyle]}>
              <Ionicons name="checkmark" size={checkSize * 0.6} color={colors.textPrimary} />
            </Animated.View>
          )}
          {(state === 'searching' || state === 'found' || state === 'failed') && (
            <View style={[styles.idleNode, { width: node, height: node, borderRadius: node / 2 }]} />
          )}
        </View>
      </View>

      <RingIllustration width={layout.ringIllustrationWidth * 0.8} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  link: { flex: 1, height: layout.pairingCheckSize + 24, justifyContent: 'center', marginHorizontal: -4 },
  line: { height: LINE_HEIGHT, marginHorizontal: layout.pairingNodeSize / 2 },
  endNode: { position: 'absolute', borderRadius: layout.pairingNodeSize / 2, borderWidth: 2, backgroundColor: colors.bgBottom },
  leftNode: { left: 0 },
  rightNode: { right: 0 },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  idleNode: { backgroundColor: colors.card, borderColor: colors.textSecondary, borderWidth: 2 },
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
