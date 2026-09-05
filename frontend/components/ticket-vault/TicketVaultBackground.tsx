import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';

import type { Ticket } from '@/constants/ticket-data';

interface TicketVaultBackgroundProps {
  ticket: Ticket;
}

// Frosted-glass backdrop that shows the active ticket's image, heavily blurred
// behind a translucent dark overlay so the card on top stays readable.
export function TicketVaultBackground({ ticket }: TicketVaultBackgroundProps) {
  // Blur the image below, then add a glass haze for a frosted look.
  const glassHaze = Platform.OS === 'web'
    ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', pointerEvents: 'none' } as any,
          ]}
        />
      )
    : (
        <BlurView
          intensity={45}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      );

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image
        key={ticket.id}
        source={ticket.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={300}
        blurRadius={20}
      />
      {glassHaze}
      <LinearGradient
        colors={['rgba(10, 14, 20, 0.38)', 'rgba(8, 12, 18, 0.5)', 'rgba(5, 8, 14, 0.64)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
