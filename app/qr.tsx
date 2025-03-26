import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QRScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        // redirect to login without token
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuthentication();
  }, []);

  // skip qr render when not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>John Doe</Text>
      <QRCode value="Placeholder QR Code" size={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20,
    backgroundColor: "#99CCFF",
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20,
  },
});