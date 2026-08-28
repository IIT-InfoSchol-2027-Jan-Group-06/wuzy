import { ImageBackground, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { QrCode } from '@/components/QrCode';
import type { Ticket } from '@/constants/ticket-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

export interface TicketCardProps {
  ticket: Ticket;
  width: number;
  style?: StyleProp<ViewStyle>;
}

/** Authentic ticket card: full photo backdrop with dark overlay,
 * top event info, dashed perforation line with circular side notches,
 * and large centered white QR code.
 */
export function TicketCard({ ticket, width, style }: TicketCardProps) {
  const { height: screenHeight } = useWindowDimensions();
  const height = Math.min(Math.round(width * 1.52), Math.round(screenHeight * 0.65));
  const topHeight = Math.round(height * 0.33);
  const notch = 26;
  const radius = 24;
  const titleSize = Math.round(width * 0.076);
  const metaSize = Math.round(width * 0.033);
  const qrSize = Math.round(width * 0.54);

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: '#121824',
        },
        style,
      ]}
    >
      {/* Full-bleed background event photo */}
      <ImageBackground
        source={ticket.image}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{ resizeMode: 'cover' }}
      >
        {/* Dark frosted overlay spanning the entire card */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: 'rgba(10, 15, 23, 0.74)' },
          ]}
        />
      </ImageBackground>

      {/* Top Event Info Section */}
      <View
        className="items-center justify-center px-[18px]"
        style={{ height: topHeight }}
      >
        <Text
          className="text-white text-center font-bold"
          numberOfLines={1}
          style={{
            fontFamily: wuzyFonts.bold,
            fontSize: titleSize,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
          }}
        >
          {ticket.title}
        </Text>

        <View className="flex-row items-center justify-center mt-[8px] gap-[10px]">
          <Text
            className="text-white/85 text-center font-medium"
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.medium,
              fontSize: metaSize,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {ticket.date}
          </Text>
          <Text
            className="text-white/85 text-center font-medium"
            numberOfLines={1}
            style={{
              fontFamily: wuzyFonts.medium,
              fontSize: metaSize,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            {ticket.venue}
          </Text>
        </View>
      </View>

      {/* Bottom QR Section */}
      <View
        className="flex-1 items-center justify-center pb-[16px]"
      >
        <QrCode
          value={`wuzy://ticket/${ticket.code}`}
          size={qrSize}
          color="#FFFFFF"
          card={false}
        />
      </View>

      {/* Dashed perforation divider with left and right side notch cutouts */}
      <View
        className="absolute left-0 right-0"
        style={{ top: topHeight - notch / 2, height: notch }}
      >
        {/* Left circular notch */}
        <View
          className="absolute rounded-full"
          style={{
            width: notch,
            height: notch,
            left: -notch / 2,
            backgroundColor: wuzyColors.bg,
          }}
        />
        {/* Right circular notch */}
        <View
          className="absolute rounded-full"
          style={{
            width: notch,
            height: notch,
            right: -notch / 2,
            backgroundColor: wuzyColors.bg,
          }}
        />
        {/* Dashed horizontal line */}
        <View
          className="absolute left-[14px] right-[14px]"
          style={{
            top: notch / 2,
            borderTopWidth: 1.5,
            borderTopColor: 'rgba(255, 255, 255, 0.32)',
            borderStyle: 'dashed',
          }}
        />
      </View>
    </View>
  );
}
