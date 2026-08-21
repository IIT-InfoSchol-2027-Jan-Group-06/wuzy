import { Tabs } from 'expo-router';
import { NavBar } from '@/components/NavBar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import type { NavBarItem } from '@/components/NavBar';

export default function TabLayout() {
  const router = useRouter();
  const { href } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'awards' | 'chat' | 'profile'>('home');

  const routes = {
    home: '/',
    events: '/events',
    awards: '/awards',
    chat: '/chat',
    profile: '/profile',
  } as const;

  useEffect(() => {
    if (href?.includes('events')) setActiveTab('events');
    else if (href?.includes('awards')) setActiveTab('awards');
    else if (href?.includes('chat')) setActiveTab('chat');
    else if (href?.includes('profile')) setActiveTab('profile');
    else setActiveTab('home');
  }, [href]);

  const handlePress = (item: NavBarItem) => {
    const key = item as keyof typeof routes;
    if (key in routes) {
      setActiveTab(key as 'home' | 'events' | 'awards' | 'chat' | 'profile');
      router.push(routes[key]);
    }
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => (
        <NavBar active={activeTab} onItemPress={handlePress} />
      )}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="awards" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}