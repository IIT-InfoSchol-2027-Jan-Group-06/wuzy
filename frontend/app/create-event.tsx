import { useState } from "react";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EventCoverBanner } from "@/components/create-event/EventCoverBanner";
import { LabeledInput } from "@/components/create-event/LabeledInput";
import { PublishButton } from "@/components/create-event/PublishButton";
import { SelectRow } from "@/components/create-event/SelectRow";
import { ToggleRow } from "@/components/create-event/ToggleRow";
import { wuzyLayout } from "@/constants/wuzy-theme";

export default function CreateEventScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  return (
    <Screen scroll style={{ gap: wuzyLayout.gap }}>
      <ScreenHeader title="Create event" />

      <View className="gap-[24px]">
        <EventCoverBanner
          imageUri={require("@/assets/images/event-poster-c.png")}
        />

        <View style={{ gap: wuzyLayout.itemGap }}>
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
          <ToggleRow
            label="Private"
            value={isPrivate}
            onValueChange={setIsPrivate}
          />
          <ToggleRow label="Paid" value={isPaid} onValueChange={setIsPaid} />
        </View>

        <PublishButton />
      </View>
    </Screen>
  );
}
