import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export interface QrCodeProps {
  value: string;
  size?: number;
  /** Module color; defaults to dark for use on light surfaces. */
  color?: string;
  /** Renders the white padded card behind the code when true (default). */
  card?: boolean;
}

/** Scannable QR; default is dark modules on a white card, set card={false} for overlays. */
export function QrCode({ value, size = 180, color = '#0A0F17', card = true }: QrCodeProps) {
  const qr = (
    <QRCode value={value} size={size} color={color} backgroundColor="transparent" />
  );

  if (!card) {
    return qr;
  }

  return <View className="rounded-[16px] bg-white p-[12px]">{qr}</View>;
}
