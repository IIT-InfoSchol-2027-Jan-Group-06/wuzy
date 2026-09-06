import { BlurView } from 'expo-blur';
import { Image, StyleSheet, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';

// Badges must be transparent PNGs with no square frame baked into the file.
const badgeImages: ImageSourcePropType[] = [
  require('@/assets/badges/img1.png'),
  require('@/assets/badges/img2.png'),
  require('@/assets/badges/img3.png'),
  require('@/assets/badges/img4.png'),
  require('@/assets/badges/img5.png'),
  require('@/assets/badges/img6.png'),
  require('@/assets/badges/img7.png'),
  require('@/assets/badges/img8.png'),
  require('@/assets/badges/img9.png'),
  require('@/assets/badges/img10.png'),
  require('@/assets/badges/img11.png'),
  require('@/assets/badges/img12.png'),
  require('@/assets/badges/img13.png'),
  require('@/assets/badges/img14.png'),
  require('@/assets/badges/img15.png'),
];

/** Clean 3 rows by 5 columns board of the badge images, bare images centered in each cell. */
export function BadgeGrid() {
  const { width: screenWidth } = useWindowDimensions();

  // Page padding is px-[32px] on both sides; a 12px gutter keeps 5 cells per row.
  const containerWidth = screenWidth - 64;
  const gap = 12;
  const cellSize = Math.round((containerWidth - gap * 4) / 5);
  // Visible box each badge sits in; the artwork renders larger and is nudged up
  // inside an overflow-hidden crop so stray top-edge pixels never show.
  const badgeBox = Math.round(cellSize * 0.94);
  const imageRender = Math.round(badgeBox * 1.08);
  // The 2nd and 9th badges render a touch smaller so they sit in line with the rest.
  const smallBadgeBox = Math.round(cellSize * 0.82);
  const smallImageRender = Math.round(smallBadgeBox * 1.08);

  return (
    <View
      className="overflow-hidden rounded-3xl border border-white/10 bg-[#FFE783]/10 p-5">
      <BlurView
        intensity={40}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-row flex-wrap justify-center" style={{ rowGap: gap }}>
        {badgeImages.map((src, index) => {
          const isSmall = index === 1 || index === 8;
          const box = isSmall ? smallBadgeBox : badgeBox;
          const render = isSmall ? smallImageRender : imageRender;
          return (
            <View
              key={index}
              className="items-center justify-center"
              style={{ width: cellSize, height: cellSize }}>
              <View
                className="items-center justify-center overflow-hidden"
                style={{
                  width: box,
                  height: box,
                  shadowColor: '#000000',
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 4,
                }}>
                <Image
                  source={src}
                  resizeMode="contain"
                  style={{
                    width: render,
                    height: render,
                    transform: [{ translateY: -render * 0.02 }],
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}