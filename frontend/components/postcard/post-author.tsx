import { StyleProp, Text, View, ViewStyle } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';

type PostAuthorProps = {
  name: string;
  location: string;
  style?: StyleProp<ViewStyle>;
};

export function PostAuthor({ name, location, style }: PostAuthorProps) {
  return (
    <View style={style}>
      <Text className="text-[14px] text-white" style={{ fontFamily: wuzyFonts.medium }}>
        {name}
      </Text>
      <Text className="-mt-[2px] text-[12px] text-white" style={{ fontFamily: wuzyFonts.medium }}>
        {location}
      </Text>
    </View>
  );
}