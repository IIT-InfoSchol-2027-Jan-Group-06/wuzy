import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path } from 'react-native-svg';
import { SearchIcon } from '@/components/ChatIcons';
import { CategoryFilter } from '@/components/CategoryFilter';
import { chatMessages, CATEGORIES, type ChatMessage } from '@/constants/chat-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

const profileAvatar = require('@/assets/images/profile.png');
const prizeIcon = require('@/assets/images/prize.png');

export default function ChatScreen() {
  const [active, setActive] = React.useState('All');
  const { width: screenWidth } = useWindowDimensions();

  const navWidth = Math.round(screenWidth * 0.72);
  const navHeight = Math.round(navWidth * (50 / 290));
  const iconSize = Math.round(navHeight * 0.52);
  const buttonSize = Math.round(navHeight * 0.8);

  const categoryOptions = CATEGORIES.map((c) => ({ id: c, label: c }));

  return (
    <View className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: wuzyColors.bg }}>
        <Text
          className="text-center text-2xl pt-2 mt-[14px]"
          style={{ color: wuzyColors.yellow, fontFamily: wuzyFonts.semibold }}>
          Messages
        </Text>

        <View
          className="flex-row items-center rounded-[20px] px-4 mx-[30px] mt-[19px] h-[41px]"
          style={{ backgroundColor: wuzyColors.yellowDim }}>
          <SearchIcon size={18} color={wuzyColors.white} />
        </View>

        <View className="mt-[25px] px-[30px]">
          <CategoryFilter<ChatMessage>
            options={categoryOptions}
            selectedId={active}
            onSelect={setActive}
            containerStyle={{ paddingHorizontal: 0 }}
          />
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 22, paddingBottom: 150 }}
          renderItem={({ item }) => <MessageRow item={item} />}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          className="absolute bottom-[96px] right-[67px] h-[45px] w-[45px] items-center justify-center rounded-full"
          style={{ backgroundColor: wuzyColors.yellowDim }}>
          <Image
            source={require('@/assets/images/plus.png')}
            className="h-[30px] w-[30px]"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <BottomNav
          width={navWidth}
          height={navHeight}
          iconSize={iconSize}
          buttonSize={buttonSize}
        />
      </SafeAreaView>
    </View>
  );
}

function MessageRow({ item }: { item: ChatMessage }) {
  return (
    <TouchableOpacity className="h-[60px] flex-row items-center px-[30px] py-[10px]">
      <View className="h-10 w-10 rounded-full items-center justify-center" style={{ borderWidth: 1, borderColor: wuzyColors.yellow }}>
        <Image source={item.avatar} className="h-10 w-10 rounded-full" />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className="text-[13px] leading-[19.5px] text-white"
          style={{ fontFamily: wuzyFonts.semibold }}>
          {item.name}
        </Text>
        <View className="flex-row items-center">
          <Text
            numberOfLines={1}
            className="flex-1 text-[13px] leading-[19.5px] text-white"
            style={{ fontFamily: wuzyFonts.semibold }}>
            {item.preview}
          </Text>
          <Text
            className="text-[14px] leading-[21px]"
            style={{ fontFamily: wuzyFonts.semibold, color: wuzyColors.gray }}>
            {item.time}
          </Text>
        </View>
      </View>
      {item.unread && (
        <View className="ml-2 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: wuzyColors.yellow }} />
      )}
    </TouchableOpacity>
  );
}

function BottomNav({
  width,
  height,
  iconSize,
  buttonSize,
}: {
  width: number;
  height: number;
  iconSize: number;
  buttonSize: number;
}) {
  return (
    <View className="absolute bottom-8 self-center overflow-hidden rounded-full border border-white/20"
      style={{
        width,
        height,
        backgroundColor: 'rgba(244, 196, 0, 0.1)',
        shadowColor: 'black',
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
      }}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
      <View className="flex-1 flex-row items-center justify-between px-6">
        <NavItem icon={<HomeIcon size={iconSize} color="#FFFFFF" />} size={buttonSize} />
        <NavItem icon={<ChatIcon size={iconSize} color="#FFE783" />} size={buttonSize} />
        <NavItem icon={<Image source={prizeIcon} className="h-[30px] w-[30px]" resizeMode="contain" />} size={buttonSize} />
        <NavItem icon={<PartyIcon size={iconSize} color="#FFFFFF" />} size={buttonSize} />
        <NavItem icon={<Image source={profileAvatar} className="h-[30px] w-[30px] rounded-full border border-white" />} size={buttonSize} />
      </View>
    </View>
  );
}

function NavItem({ icon, size }: { icon: React.ReactNode; size: number }) {
  return (
    <TouchableOpacity
      className="items-center justify-center rounded-full active:scale-95"
      style={{ width: size, height: size }}>
      {icon}
    </TouchableOpacity>
  );
}

function HomeIcon({ size = 28, color = '#FFFFFF', strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22v-6h6v6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChatIcon({ size = 28, color = '#FFFFFF', strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.32 0-2.58-.3-3.7-.83L3 21l1.6-5.7A8.5 8.5 0 1 1 21 11.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke={color} strokeWidth={strokeWidth * 1.6} strokeLinecap="round" />
    </Svg>
  );
}

function PartyIcon({ size = 28, color = '#FFFFFF', strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 8a2 2 0 0 1 4 0c0 1.5-1 3-1.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M19 8a2 2 0 0 0-4 0c0 1.5 1 3 1.5 4.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M12 4v2M7.5 12c1.5 0 2.5 1 3.5 2s2 2 3.5 2M4.5 14.5c1-.5 1.5 0 2 .5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="m5 13 3 6h3l-3-6zM14.5 9.5l2.5 4.5H12z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}