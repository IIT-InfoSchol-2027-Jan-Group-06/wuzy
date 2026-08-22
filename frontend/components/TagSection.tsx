import { Pressable, ScrollView, Text, View, useWindowDimensions, type ViewStyle, type TextStyle } from 'react-native';
import type { ReactNode } from 'react';

import { wuzyFonts } from '@/constants/wuzy-theme';

export interface TagSectionProps {
  tags: string[];
  onTagPress?: (tag: string) => void;
  containerStyle?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  tagStyle?: ViewStyle;
  textStyle?: TextStyle;
  renderTag?: (tag: string, index: number) => ReactNode;
}

export function TagSection({
  tags,
  onTagPress,
  containerStyle,
  contentContainerStyle,
  tagStyle,
  textStyle,
  renderTag,
}: TagSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const fontSize = Math.round(screenWidth * 0.022);

  return (
    <View style={[{ paddingHorizontal: 10, marginTop: 4 }, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[{ gap: 8, paddingBottom: 4 }, contentContainerStyle]}
      >
        {tags.map((tag, index) => {
          const isCustom = typeof renderTag === 'function';
          return (
            <Pressable
              key={`${tag}-${index}`}
              onPress={() => onTagPress?.(tag)}
              className="items-center justify-center px-[16px] py-[8px] rounded-full"
              style={[
                {
                  backgroundColor: '#171E28',
                  borderWidth: 1,
                  borderColor: '#2B3545',
                },
                tagStyle,
              ]}
            >
              {isCustom ? (
                renderTag(tag, index)
              ) : (
                <Text
                  style={[
                    {
                      fontFamily: wuzyFonts.semibold,
                      fontSize,
                      color: '#FFFFFF',
                    },
                    textStyle,
                  ]}
                >
                  {tag}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}