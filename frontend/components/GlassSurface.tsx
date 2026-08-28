import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

export function GlassSurface({ radius }: { radius: number }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { borderRadius: radius, overflow: 'hidden' }]}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(84, 82, 56, 0.35)' }]} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(244, 196, 0, 0.1)' }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.03)', 'rgba(0,0,0,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.25)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { borderRadius: radius, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
        ]}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          borderTopWidth: 1,
          borderColor: 'rgba(255,255,255,0.5)',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          borderBottomWidth: 1,
          borderColor: 'rgba(0,0,0,0.3)',
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
        }}
      />
    </View>
  );
}
