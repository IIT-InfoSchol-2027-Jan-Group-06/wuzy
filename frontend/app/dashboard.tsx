import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { EventBanner } from '@/components/dashboard/EventBanner';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DropdownPill } from '@/components/dashboard/DropdownPill';
import { IncomeChart } from '@/components/dashboard/IncomeChart';
import { eventBanner, metrics, incomeTotal } from '@/constants/dashboard-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

const rangeOptions = ['This Month', 'Last Month', 'This Year'];

export default function DashboardScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [rangeIndex, setRangeIndex] = useState(0);
  const range = rangeOptions[rangeIndex];

  const titleSize = Math.round(screenWidth * 0.05);
  const totalSize = Math.round(screenWidth * 0.058);
  const bodyPad = Math.round(screenWidth * 0.085);

  return (
    <View className="flex-1 bg-wuzy-bg">
      <SafeAreaView edges={['top', 'bottom']} className="flex-1" style={{ backgroundColor: '#0A0F17' }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}>
          <ScreenHeader title="Dashboard" />

          <View style={{ paddingHorizontal: bodyPad, marginTop: Math.round(screenWidth * 0.05) }}>
            <EventBanner data={eventBanner} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              gap: Math.round(screenWidth * 0.04),
              paddingHorizontal: bodyPad,
              marginTop: Math.round(screenWidth * 0.05),
            }}>
            {metrics.map((m) => (
              <MetricCard key={m.id} label={m.label} value={m.value} />
            ))}
          </View>

          <View
            style={{
              paddingHorizontal: bodyPad,
              marginTop: Math.round(screenWidth * 0.07),
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: wuzyColors.yellow, fontFamily: wuzyFonts.semibold, fontSize: titleSize }}>
                  Income Trend
                </Text>
                <Text style={{ color: wuzyColors.white, fontFamily: wuzyFonts.bold, fontSize: totalSize, marginTop: 4 }}>
                  {incomeTotal}
                </Text>
              </View>
              <DropdownPill label={range} onPress={() => setRangeIndex((rangeIndex + 1) % rangeOptions.length)} />
            </View>
          </View>

          <View style={{ paddingHorizontal: bodyPad, marginTop: Math.round(screenWidth * 0.04) }}>
            <IncomeChart />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
