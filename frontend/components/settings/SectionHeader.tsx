import { Text } from 'react-native';

import { wuzyFonts } from '@/constants/wuzy-theme';

export function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontFamily: wuzyFonts.semibold,
        fontSize: 14,
        color: '#F0CD6D',
      }}
      className="mb-3"
    >
      {title}
    </Text>
  );
}
