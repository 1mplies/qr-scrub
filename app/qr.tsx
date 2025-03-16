import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function QRScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>John Doe</Text>
      <QRCode value="Placeholder QR Code" size={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
});
