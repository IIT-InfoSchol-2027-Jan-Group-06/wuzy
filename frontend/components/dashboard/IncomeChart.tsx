import { useState } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Text, View, useWindowDimensions } from 'react-native';

import { incomePoints, yAxisLabels, type IncomePoint } from '@/constants/dashboard-data';
import { wuzyColors, wuzyFonts } from '@/constants/wuzy-theme';

type IncomeChartProps = {
  points?: IncomePoint[];
};

const MAX = 40;

/**
 * Income trend line chart. The SVG spans the full card width, edge to edge,
 * sitting inside a uniform card padding so the y-axis labels and line have
 * breathing room. Inner insets give headroom above the peak badge and clear
 * the baseline from the bottom edge.
 */
export function IncomeChart({ points = incomePoints }: IncomeChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [renderWidth, setRenderWidth] = useState(screenWidth - 32);

  const cardWidth = Math.round(screenWidth * 0.9);
  const cardHeight = Math.round(screenWidth * 0.7);
  const radius = Math.round(screenWidth * 0.035);

  // Uniform internal padding for the card (roughly p-4 on a phone).
  const cardPad = Math.round(screenWidth * 0.04);

  // Inner chart insets: top headroom for the peak pill, bottom for the baseline.
  const topInset = Math.round(screenWidth * 0.07);
  const bottomInset = Math.round(screenWidth * 0.04);
  const rightPad = Math.round(screenWidth * 0.015);

  // SVG region lives inside the card padding and spans the full padded width.
  const svgWidth = renderWidth - cardPad * 2;
  const svgHeight = cardHeight - cardPad * 2;
  const svgLeft = cardPad;
  const svgTop = cardPad;

  const plotHeight = svgHeight - topInset - bottomInset;
  const plotLeft = 0;
  const plotRight = svgWidth - rightPad;
  const plotWidth = plotRight - plotLeft;
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: plotLeft + i * step,
    y: topInset + plotHeight - (p.value / MAX) * plotHeight,
  }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${line} L${plotRight},${topInset + plotHeight} L${plotLeft},${topInset + plotHeight} Z`;

  const peak = points.reduce((a, b) => (b.value > a.value ? b : a), points[0]);
  const peakCoord = coords[points.indexOf(peak)];

  const pillWidth = Math.round(screenWidth * 0.1);
  const pillHeight = Math.round(screenWidth * 0.046);
  const pillRadius = Math.round(screenWidth * 0.023);
  const labelSize = Math.round(screenWidth * 0.022);

  // Clamp horizontally so the pill stays inside the padded area, and keep a
  // small top clearance so it never touches the card edge.
  const pillLeft =
    Math.max(pillWidth / 2, Math.min(plotRight - pillWidth / 2, peakCoord.x)) - pillWidth / 2;
  const pillTop =
    Math.max(cardPad + pillHeight / 2, Math.min(svgHeight - pillHeight / 2, peakCoord.y)) - pillHeight / 2;

  return (
    <View
      onLayout={(e) => setRenderWidth(e.nativeEvent.layout.width)}
      style={{
        alignSelf: 'center',
        width: cardWidth,
        height: cardHeight,
        backgroundColor: '#2A2D24',
        borderRadius: radius,
        overflow: 'hidden',
      }}>
      {/* Y-axis labels, overlaid on the left within the padding */}
      {yAxisLabels.map((label, i) => {
        const y =
          svgTop +
          topInset +
          ((yAxisLabels.length - 1 - i) / (yAxisLabels.length - 1)) * plotHeight;
        return (
          <Text
            key={label}
            style={{
              position: 'absolute',
              left: Math.round(screenWidth * 0.015),
              top: y - labelSize / 2,
              color: '#8A96A6',
              fontFamily: wuzyFonts.medium,
              fontSize: labelSize,
            }}>
            {label}
          </Text>
        );
      })}

      {/* Peak pill, centered on the peak node with headroom */}
      <View
        className="absolute items-center justify-center"
        style={{
          left: svgLeft + pillLeft,
          top: svgTop + pillTop,
          width: pillWidth,
          height: pillHeight,
          backgroundColor: wuzyColors.yellow,
          borderRadius: pillRadius,
        }}>
        <Text style={{ color: '#000811', fontFamily: wuzyFonts.bold, fontSize: Math.round(screenWidth * 0.023) }}>
          12k
        </Text>
      </View>

      <Svg
        width={svgWidth}
        height={svgHeight}
        style={{ position: 'absolute', left: svgLeft, top: svgTop }}>
        <Defs>
          <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={wuzyColors.yellow} stopOpacity="0.25" />
            <Stop offset="1" stopColor={wuzyColors.yellow} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Area + gold line, edge to edge across the padded card */}
        <Path d={area} fill="url(#areaFill)" />
        <Path d={line} stroke="#E5C158" strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />

        {/* Peak node */}
        <Circle cx={peakCoord.x} cy={peakCoord.y} r={Math.round(screenWidth * 0.012)} fill="#E5C158" />
        <Circle
          cx={peakCoord.x}
          cy={peakCoord.y}
          r={Math.round(screenWidth * 0.024)}
          fill="#E5C158"
          opacity={0.25}
        />
      </Svg>
    </View>
  );
}
