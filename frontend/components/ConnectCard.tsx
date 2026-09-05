import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassNavButton } from '@/components/GlassNavButton';
import { wuzyFonts, wuzyColors } from '@/constants/wuzy-theme';
import QRCode from 'react-native-qrcode-svg';

interface ConnectCardProps {
  username: string;
  qrValue: string;
  onBack: () => void;
  backgroundImage?: any;
}

export function ConnectCard({ username, qrValue, onBack, backgroundImage }: ConnectCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;

  const maxCardWidth = isDesktop ? 420 : isTablet ? 380 : screenWidth * 0.88;
  const cardWidth = Math.min(maxCardWidth, screenWidth - 48);
  const cardHeight = isDesktop ? 580 : isTablet ? 540 : screenHeight * 0.68;
  const qrSize = Math.min(cardWidth * 0.6, isDesktop ? 240 : 200);
  const backButtonSize = Math.round((42 / 375) * Math.min(screenWidth, 375));
  const headerFontSize = Math.round(Math.min(screenWidth, 375) * 0.061);
  const nameFontSize = Math.round(Math.min(screenWidth, 375) * 0.10);
  const nameLineHeight = Math.round(Math.min(screenWidth, 375) * 0.11);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={StyleSheet.absoluteFill}>
          {backgroundImage && (
            <Image
              source={backgroundImage}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              blurRadius={50}
            />
          )}
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['transparent', '#0A0F17', '#0A0F17']}
            locations={[0, 0.6, 1]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.centerWrapper}>
          <View style={[styles.backButtonWrapper, { top: 50, left: 24 }]}>
            <GlassNavButton
              icon="arrow-back"
              size={backButtonSize}
              onPress={onBack}
            />
          </View>

          <View style={[styles.card, { width: cardWidth, height: cardHeight }]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[styles.cardOverlay, { borderRadius: 24 }]} />
            <View style={[styles.cardBorder, { borderRadius: 24 }]} />
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              locations={[0, 0.5, 1]}
            />
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.cardBorderStrong, { borderRadius: 24 }]} />

            <View style={styles.cardContent}>
              <Text style={[
                styles.headerTitle,
                { fontSize: headerFontSize, color: wuzyColors.yellow }
              ]}>
                Connect
              </Text>

              <Text style={[
                styles.username,
                { fontSize: nameFontSize, lineHeight: nameLineHeight }
              ]}>
                {username.toUpperCase()}
              </Text>

              <View style={[styles.qrContainer, { width: qrSize, height: qrSize }]}>
                <QRCode
                  value={qrValue}
                  size={qrSize - 32}
                  color="#0A0F17"
                  backgroundColor="#FFFFFF"
                  getRef={(ref) => {}}
                />
              </View>

              <Text style={styles.subtitle}>
                Scan to connect
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F17',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0F17',
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backButtonWrapper: {
    position: 'absolute',
    zIndex: 50,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(244, 196, 0, 0.08)',
    borderRadius: 24,
  },
  cardBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
  },
  cardBorderStrong: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: wuzyFonts.display,
    letterSpacing: 2,
    marginBottom: 8,
  },
  username: {
    fontFamily: wuzyFonts.display,
    color: '#FDF3C0',
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: wuzyFonts.body,
    fontSize: Math.round(375 * 0.035),
    lineHeight: Math.round(375 * 0.05),
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.7,
  },
});

export default ConnectCard;