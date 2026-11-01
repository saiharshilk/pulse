import { Tabs } from 'expo-router/tabs';

import { FloatingTabBar } from '@/components/FloatingTabBar';
import { colors } from '@/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bgBottom } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="health" />
      <Tabs.Screen name="device" />
    </Tabs>
  );
}
