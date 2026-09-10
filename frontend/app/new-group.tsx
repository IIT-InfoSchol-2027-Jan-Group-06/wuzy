import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { GlassNavButton } from '@/components/GlassNavButton';
import { LabeledInput } from '@/components/create-event/LabeledInput';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SearchBar } from '@/components/SearchBar';
import { wuzyColors, wuzyFonts, wuzyLayout, wuzyType } from '@/constants/wuzy-theme';
import { useAuth } from '@/context/auth';
import { apiGet, apiPost, assetUrl, type ApiGroup, type ApiUser } from '@/lib/api';
import { markThreadActive } from '@/lib/chat-activity';

const defaultAvatar = require('@/assets/images/avatar1.jpg');

const AVATAR = 44;

export default function NewGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await apiGet<ApiUser[]>('/users/');
        if (active) {
          setUsers(all.filter((u) => u.id !== user?.id));
          setLoading(false);
        }
      } catch {
        if (active) {
          setError('Could not load people to add.');
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q
      ? users
      : users.filter(
          (u) =>
            u.display_name?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q),
        );
  }, [users, query]);

  const toggle = useCallback((id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const create = useCallback(async () => {
    if (creating || !name.trim() || selected.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      const group = await apiPost<ApiGroup>('/groups', {
        name: name.trim(),
        member_ids: selected,
      });
      markThreadActive({ kind: 'group', id: group.id });
      router.replace({ pathname: '/chat/[id]', params: { id: String(group.id), kind: 'group' } });
    } catch {
      setError('Could not create the group. Try again.');
      setCreating(false);
    }
  }, [creating, name, selected, router]);

  const creatable = name.trim().length > 0 && selected.length > 0;

  return (
    <Screen>
      <ScreenHeader title="New Group" />

      <View style={{ flex: 1, gap: wuzyLayout.gap }}>
        <View style={{ gap: wuzyLayout.itemGap }}>
          <LabeledInput
            label="Group name"
            value={name}
            onChangeText={setName}
            placeholder="Weekend squad"
            autoCapitalize="words"
          />
          <SearchBar value={query} onChangeText={setQuery} placeholder="Add people" />
        </View>

        {error ? (
          <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.small, color: wuzyColors.yellow }}>
            {error}
          </Text>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color={wuzyColors.yellow} style={{ marginTop: wuzyLayout.gap }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: wuzyLayout.itemGap, paddingBottom: wuzyLayout.gap }}
            ListEmptyComponent={
              <Text style={{ fontFamily: wuzyFonts.medium, fontSize: wuzyType.body, color: wuzyColors.gray }}>
                No one matches your search
              </Text>
            }
            renderItem={({ item }) => {
              const isSel = selected.includes(item.id);
              return (
                <Pressable
                  onPress={() => toggle(item.id)}
                  className="flex-row items-center active:opacity-70"
                  style={{ gap: wuzyLayout.itemGap }}>
                  <View
                    style={{
                      width: AVATAR,
                      height: AVATAR,
                      borderRadius: AVATAR / 2,
                      borderWidth: 1,
                      borderColor: wuzyColors.yellow,
                      padding: 2,
                    }}>
                    <Image
                      source={item.avatar_url ? { uri: assetUrl(item.avatar_url) } : defaultAvatar}
                      style={{ width: '100%', height: '100%', borderRadius: AVATAR / 2 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.semibold, fontSize: wuzyType.body, color: wuzyColors.white }}>
                      {item.display_name ?? item.username}
                    </Text>
                    <Text numberOfLines={1} style={{ fontFamily: wuzyFonts.body, fontSize: wuzyType.small, color: wuzyColors.gray }}>
                      @{item.username}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSel ? wuzyColors.yellow : wuzyColors.gray,
                      backgroundColor: isSel ? wuzyColors.yellow : 'transparent',
                    }}
                  />
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {creatable ? (
        <View style={{ alignItems: 'center', paddingBottom: wuzyLayout.gap }}>
          <GlassNavButton
            onPress={create}
            accessibilityLabel="Create group"
            style={{ width: 200, height: wuzyLayout.control }}>
            <Text style={{ fontFamily: wuzyFonts.bold, fontSize: wuzyType.section, color: wuzyColors.white }}>
              {creating ? 'Creating...' : 'Create group'}
            </Text>
          </GlassNavButton>
        </View>
      ) : null}
    </Screen>
  );
}
