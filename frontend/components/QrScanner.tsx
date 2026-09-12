import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';

import { Chip } from '@/components/Chip';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { apiGet, apiPost, type ApiUser } from '@/lib/api';

// A Wuzy QR encodes the owner's profile URL (https://wuzy.app/profile/<username>).
const PROFILE_PATTERN = /\/profile\/([^/?#]+)/;

type Phase = 'camera' | 'looking' | 'found' | 'missing';

const SCAN_BOX: ViewStyle = {
  width: '100%',
  aspectRatio: 1,
  borderRadius: 24,
  overflow: 'hidden',
  backgroundColor: wuzyColors.surface,
  alignItems: 'center',
  justifyContent: 'center',
  padding: wuzyLayout.itemGap,
  gap: wuzyLayout.itemGap,
};

function ScanBox({ children }: { children: ReactNode }) {
  return <View style={SCAN_BOX}>{children}</View>;
}

/** Camera side of the Connect card. Scans another user's Wuzy code and connects with them.
 *  The new connection's card shows on the Connections screen, not in the camera view. */
export function QrScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('camera');

  // phase as a ref pairs with setPhase so the camera's callback never acts on a stale value.
  const phaseRef = useRef(phase);
  const lastScan = useRef({ data: '', at: 0 });
  const go = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  // "Connected!" is brief feedback; the camera returns to scanning on its own.
  useEffect(() => {
    if (phase !== 'found') return;
    const timer = setTimeout(() => go('camera'), 1500);
    return () => clearTimeout(timer);
  }, [phase, go]);

  const handleScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (phaseRef.current !== 'camera') return;
      const match = PROFILE_PATTERN.exec(result.data);
      if (!match) return;
      const username = match[1];
      // Ignore immediate repeat reads of the same code while it is processed.
      if (lastScan.current.data === result.data && Date.now() - lastScan.current.at < 2500) {
        return;
      }
      lastScan.current = { data: result.data, at: Date.now() };
      go('looking');
      try {
        const user = await apiGet<ApiUser>(`/users/by-username/${username}`);
        try {
          // The mutual follow is what makes them a Connection and turns the count up.
          await apiPost(`/users/${user.id}/connect`, {});
        } catch {
          // Connecting is best-effort; the connection still shows on Connections.
        }
        go('found');
      } catch {
        go('missing');
      }
    },
    [go],
  );

  if (!permission) {
    return (
      <ScanBox>
        <ActivityIndicator size="large" color={wuzyColors.yellow} />
      </ScanBox>
    );
  }

  if (!permission.granted) {
    return (
      <ScanBox>
        <Text className="text-center" style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.white }}>
          Camera access lets you scan another user&apos;s code
        </Text>
        <Chip label="Allow camera" onPress={requestPermission} />
      </ScanBox>
    );
  }

  if (phase === 'found') {
    return (
      <ScanBox>
        <Text className="uppercase" style={{ fontFamily: wuzyFonts.display, fontSize: wuzyType.title, letterSpacing: 2, color: wuzyColors.yellow }}>
          Connected!
        </Text>
      </ScanBox>
    );
  }

  if (phase === 'missing') {
    return (
      <ScanBox>
        <Text className="text-center" style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.body, color: wuzyColors.gray }}>
          No Wuzy user found for that code
        </Text>
        <Chip label="Scan again" onPress={() => go('camera')} />
      </ScanBox>
    );
  }

  return (
    <View className="overflow-hidden" style={{ width: '100%', aspectRatio: 1, borderRadius: 24, backgroundColor: wuzyColors.surface }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanned}
      />
      <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
        <View
          style={{
            width: '70%',
            aspectRatio: 1,
            borderWidth: 2,
            borderColor: wuzyColors.yellow,
            borderRadius: 24,
            opacity: 0.6,
          }}
        />
      </View>
      {phase === 'looking' && (
        <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(10, 15, 23, 0.5)' }}>
          <ActivityIndicator size="large" color={wuzyColors.yellow} />
        </View>
      )}
    </View>
  );
}