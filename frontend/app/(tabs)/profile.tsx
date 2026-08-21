import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfilePicture, Hobbies } from '@/components/postcard/Shared';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { wuzyColors } from '@/constants/wuzy-theme';

type UserData = {
  name: string;
  location: string;
  bio: string;
  hobbies: string[];
  avatar: any;
};

const defaultUser: UserData = {
  name: 'Alex Johnson',
  location: 'San Francisco',
  bio: 'Software developer and designer. Building cool stuff with React Native.',
  hobbies: ['photography', 'hiking', 'reading', 'gaming'],
  avatar: require('@/assets/images/avatar1.png'),
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();

  return (
    <View className="flex-1 bg-[color:theme(colors.background)]">
      <SafeAreaView edges={['top']} className="flex-1">
        <View className="px-[32px] pt-[49px]">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[32px] leading-[32px]"
              style={{ fontFamily: 'BebasNeue_400Regular' }}>
              Wuzy
            </Text>
            <Image
              source={require('@/assets/images/notification.png')}
              className="h-[35px] w-[35px]" />
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>

          <View className="px-[32px]">
            <View className="mt-[25px] items-center">
              <ProfilePicture
                source={defaultUser.avatar}
                size={120}
                onPress={() => {}}
                style={{ marginHorizontal: 'auto' }}
              />
              <Text
                className="mt-[16px] text-[24px] text-white text-center font-bold"
                style={{ fontFamily: 'Poppins_600SemiBold' }}>
                {defaultUser.name}
              </Text>
              <Text
                className="mt-[4px] text-[14px] text-gray-400 text-center"
                style={{ fontFamily: 'Poppins_400Regular' }}>
                {defaultUser.location}
              </Text>
            </View>

<View className="mt-[32px] px-[32px]">
              <Text
                className="text-[16px] text-wuzy-yellow text-center mb-[8px]"
                style={{ fontFamily: 'Poppins_500Medium' }}>
                About
              </Text>
              <Text
                className="text-[14px] text-gray-300 text-center"
                style={{ fontFamily: 'Poppins_400Regular' }}>
                {defaultUser.bio}
              </Text>
            </View>

            <View className="mt-[32px] px-[32px]">
              <Text
                className="text-[16px] text-wuzy-yellow text-center mb-[8px]"
                style={{ fontFamily: 'Poppins_500Medium' }}>
                Hobbies
              </Text>
              <Hobbies hobbies={defaultUser.hobbies} />
            </View>
          </View>

          <View
            className="absolute bottom-[103px] right-[16px] h-[45px] w-[45px] items-center justify-center rounded-full"
            style={{ backgroundColor: wuzyColors.yellowDim }}>
            <Image
              source={require('@/assets/images/plus.png')}
              className="h-[30px] w-[30px]" />
          </View>
        </ScrollView>

        
      </SafeAreaView>
    </View>
  );
}