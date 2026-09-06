import { GlassNavButton } from '@/components/GlassNavButton';
import { useNavBarMetrics } from '@/components/NavBar';
import { wuzyLayout } from '@/constants/wuzy-theme';

/** Floating add button. Sits 16 above the NavBar, flush with the 32 side gutter. Pass via Screen's fab prop. */
export function Fab({ onPress }: { onPress: () => void }) {
  const { clearance } = useNavBarMetrics();
  return (
    <GlassNavButton
      icon="add"
      onPress={onPress}
      style={{ position: 'absolute', right: wuzyLayout.side, bottom: clearance, zIndex: 50 }}
    />
  );
}
