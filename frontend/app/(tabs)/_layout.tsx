import { Tabs, useRouter, useSegments } from 'expo-router';
import { NavBar } from '@/components/NavBar';
import type { NavBarItem } from '@/components/NavBar';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  const routes = {
    home: '/home',
    events: '/explore',
    awards: '/awards',
    chat: '/chat',
    profile: '/profile',
  } as const;

  const path = segments as string[];

  // Read the active tab off the route, so it cannot go stale when a screen navigates on its own.
  const activeTab: NavBarItem = path.includes('explore')
    ? 'events'
    : path.includes('awards')
      ? 'awards'
      : path.includes('chat')
        ? 'chat'
        : path.includes('profile')
          ? 'profile'
          : 'home';

  const handlePress = (item: NavBarItem) => {
    const key = item as keyof typeof routes;
    if (key in routes && key !== activeTab) {
      router.navigate(routes[key]);
    }
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => <NavBar active={activeTab} onItemPress={handlePress} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="awards" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
