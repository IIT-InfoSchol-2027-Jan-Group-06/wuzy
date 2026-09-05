import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { QrCode } from '@/components/QrCode';
import type { Ticket } from '@/constants/ticket-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface TicketCardProps {
  ticket: Ticket;
  width: number;
  style?: StyleProp<ViewStyle>;
}

export function TicketCard({ ticket, width, style }: TicketCardProps) {
  const height = Math.round(width * 1.58);
  const notchRadius = 15;
  const notchY = Math.round(height * 0.36);
  const qrSize = Math.round(width * 0.52);

  const subtitleText = ticket.date && ticket.venue
    ? `${ticket.date} ${ticket.venue}`
    : (ticket.date || ticket.venue || '');

  return (
    <View
      style={[
        { width, height },
        style,
      ]}
      className="relative rounded-[28px] overflow-hidden select-none bg-[#121824]"
    >
      {/* Event Poster Background */}
      <View className="absolute inset-0 overflow-hidden rounded-[28px]">
        <Image
          source={ticket.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />

        {/* Dark Tint Overlay */}
        <LinearGradient
          colors={[
            'rgba(14, 18, 26, 0.88)',
            'rgba(10, 14, 22, 0.72)',
            'rgba(6, 9, 14, 0.86)',
          ]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Outer Card Border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 28,
            borderWidth: 1.5,
            borderColor: 'rgba(255, 255, 255, 0.20)',
          },
        ]}
      />

      {/* Left Circular Side Notch Cutout */}
      <View
        style={{
          position: 'absolute',
          top: notchY - notchRadius,
          left: -notchRadius,
          width: notchRadius * 2,
          height: notchRadius * 2,
          borderRadius: notchRadius,
          backgroundColor: wuzyColors.bg,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.20)',
          zIndex: 30,
        }}
      />

      {/* Right Circular Side Notch Cutout */}
      <View
        style={{
          position: 'absolute',
          top: notchY - notchRadius,
          right: -notchRadius,
          width: notchRadius * 2,
          height: notchRadius * 2,
          borderRadius: notchRadius,
          backgroundColor: wuzyColors.bg,
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.20)',
          zIndex: 30,
        }}
      />

      {/* Subtle Dashed Separator Line aligned with side notch cutouts */}
      <View
        style={{
          position: 'absolute',
          top: notchY - 1,
          left: notchRadius + 6,
          right: notchRadius + 6,
          height: 2,
          zIndex: 25,
        }}
      >
        <Svg height="2" width="100%">
          <Line
            x1="0"
            y1="1"
            x2="100%"
            y2="1"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="1.5"
            strokeDasharray="6, 6"
          />
        </Svg>
      </View>

      {/* Card Content Layout */}
      <View className="flex-1 z-20">
        {/* Top Section: Event Metadata */}
        <View
          style={{ height: notchY }}
          className="items-center justify-center px-[20px] pt-[8px]"
        >
          {/* Title: Bold, all-caps, clean aesthetic with wide letter-spacing */}
          <Text
            className="text-white text-center font-bold uppercase select-none"
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.bold,
              fontSize: Math.round(width * 0.072),
              lineHeight: Math.round(width * 0.082),
              letterSpacing: 2.5,
            }}
          >
            {ticket.title}
          </Text>

          {/* Subtitle: Slightly smaller, bold sans-serif text placed directly below the title */}
          <Text
            className="mt-[8px] text-white/90 text-center font-semibold uppercase select-none"
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.semibold,
              fontSize: Math.round(width * 0.038),
              letterSpacing: 1.2,
            }}
          >
            {subtitleText}
          </Text>
        </View>

        {/* Lower Section: Centered Scannable QR Code */}
        <View
          style={{ height: height - notchY }}
          className="items-center justify-center px-[20px] pb-[12px]"
        >
          <View className="items-center justify-center">
            <QrCode
              value={`wuzy://ticket/${ticket.code}`}
              size={qrSize}
              color="#FFFFFF"
              card={false}
            />
          </View>

          {/* Ticket Code below QR code */}
          {ticket.code ? (
            <Text
              className="mt-[12px] text-center select-none"
              style={{
                fontFamily: wuzyFonts.semibold,
                fontSize: Math.round(width * 0.030),
                letterSpacing: 2,
                color: wuzyColors.yellow,
                opacity: 0.85,
              }}
            >
              {ticket.code}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
