import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-slate-100 p-5">
      <Text className="text-2xl font-bold text-slate-900">This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text className="text-blue-600 underline">Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});