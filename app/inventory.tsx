import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InventoryScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        // redirect to login if no valid token
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuthentication();
  }, []);

  // Skip rendering if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Return button handler
  const handleReturn = () => {
    router.push("/qr");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Page</Text>

      {/* Return Button */}
      <View style={styles.buttonWrapper}>
        <Button title="Return" onPress={handleReturn} />
      </View>
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
    fontSize: 30, 
    marginBottom: 20,
    fontWeight: "bold",
  },
  buttonWrapper: {
    width: 200,
    marginTop: 15,
  },
});
