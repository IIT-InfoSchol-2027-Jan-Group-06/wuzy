import { Image, ImageSourcePropType, StyleProp, View, ViewStyle } from 'react-native';

type AvatarProps = {
  source: ImageSourcePropType;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  source,
  size = 35,
  borderColor = 'white',
  borderWidth = 1,
  style,
}: AvatarProps) {
  return (
    <View
      className="overflow-hidden rounded-full"
      style={[{ width: size, height: size, borderWidth, borderColor }, style]}>
      <Image source={source} className="h-full w-full" resizeMode="cover" />
    </View>
  );
}