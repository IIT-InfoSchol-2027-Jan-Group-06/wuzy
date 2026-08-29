import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { EventCoverBanner } from '@/components/create-event/EventCoverBanner';
import { LabeledInput } from '@/components/create-event/LabeledInput';
import { PublishButton } from '@/components/create-event/PublishButton';
import { SelectRow } from '@/components/create-event/SelectRow';
import { ToggleRow } from '@/components/create-event/ToggleRow';

export default function CreateEventScreen() {
  const [title, setTitle] = useState('Jungle run 2026');
  const [description, setDescription] = useState('idk what this event is but okay');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader title="Create Event" />

          <View className="px-[32px] mt-[24px] gap-[24px]">
            <EventCoverBanner imageUri={require('@/assets/images/event-poster-c.png')} />

            <View className="gap-[20px]">
              <LabeledInput
                label="Event Title"
                value={title}
                onChangeText={setTitle}
                placeholder="Event title"
                autoCapitalize="words"
              />
              <LabeledInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your event"
                multiline
              />
            </View>

            <View>
              <SelectRow label="Date" onPress={() => {}} />
              <SelectRow label="Time" onPress={() => {}} />
              <SelectRow label="Location" onPress={() => {}} />
              <SelectRow label="Category" onPress={() => {}} />
            </View>

            <View>
              <ToggleRow label="Private" value={isPrivate} onValueChange={setIsPrivate} />
              <ToggleRow label="Paid" value={isPaid} onValueChange={setIsPaid} />
            </View>

            <PublishButton />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}