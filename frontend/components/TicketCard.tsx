import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { QrCode } from '@/components/QrCode';
import { wuzyColors, wuzyFonts, wuzyType } from '@/constants/wuzy-theme';

const RADIUS = 24;
const NOTCH = 13;

/** What a ticket card draws. Built from an API ticket by the vault. */
export interface TicketCardData {
  id: number;
  image: ImageSourcePropType;
  title: string;
  date: string;
  venue: string;
  code: string;
}

export interface TicketCardProps {
  ticket: TicketCardData;
  width: number;
  style?: StyleProp<ViewStyle>;
}

/** Ticket silhouette: rounded card, side notches, dashed divider, dark photo backdrop, QR below. Geometry follows the width prop, type is the token scale. */
export function TicketCard({ ticket, width, style }: TicketCardProps) {
  const height = Math.round(width * 1.58);
  const notchY = Math.round(height * 0.36);
  const qrSize = Math.round(width * 0.52);

  const subtitleText = [ticket.date, ticket.venue].filter(Boolean).join('  ');

  const notch = (side: 'left' | 'right') => (
    <View
      style={{
        position: 'absolute',
        top: notchY - NOTCH,
        [side]: -NOTCH,
        width: NOTCH * 2,
        height: NOTCH * 2,
        borderRadius: NOTCH,
        backgroundColor: wuzyColors.bg,
        borderWidth: 1.5,
        borderColor: wuzyColors.glassBorder,
        zIndex: 30,
      }}
    />
  );

  return (
    <View style={[{ width, height, borderRadius: RADIUS, backgroundColor: wuzyColors.surface }, style]} className="relative overflow-hidden">
      <Image source={ticket.image} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(10, 15, 23, 0.88)', 'rgba(10, 15, 23, 0.72)', 'rgba(10, 15, 23, 0.86)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { borderRadius: RADIUS, borderWidth: 1.5, borderColor: wuzyColors.glassBorder }]} />

      {notch('left')}
      {notch('right')}
      <View style={{ position: 'absolute', top: notchY - 1, left: NOTCH + 6, right: NOTCH + 6, height: 2, zIndex: 25 }}>
        <Svg height="2" width="100%">
          <Line x1="0" y1="1" x2="100%" y2="1" stroke={wuzyColors.glassBorder} strokeWidth="1.5" strokeDasharray="6, 6" />
        </Svg>
      </View>

      <View className="flex-1 z-20">
        <View style={{ height: notchY }} className="items-center justify-center px-[20px] pt-[8px]">
          <Text
            className="text-white text-center uppercase"
            numberOfLines={1}
            style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.title, lineHeight: Math.round(wuzyType.title * 1.1), letterSpacing: 2 }}>
            {ticket.title}
          </Text>
          <Text
            className="mt-[8px] text-white/90 text-center uppercase"
            numberOfLines={1}
            style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, letterSpacing: 1.2 }}>
            {subtitleText}
          </Text>
        </View>

        <View style={{ height: height - notchY }} className="items-center justify-center px-[20px] pb-[12px]">
          <QrCode value={`wuzy://ticket/${ticket.code}`} size={qrSize} color={wuzyColors.white} card={false} />
          {ticket.code ? (
            <Text
              className="mt-[12px] text-center"
              style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.small, letterSpacing: 2, color: wuzyColors.yellow, opacity: 0.85 }}>
              {ticket.code}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
