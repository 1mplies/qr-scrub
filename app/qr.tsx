import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QRScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fullName, setFullName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        // Redirect to login if no token
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        
        // Fetch user data after authentication
        try {
          const response = await fetch("http://localhost:5000/api/auth/qr", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (response.ok) {
            setFullName(data.fullName); // Set full name from response
          } else {
            console.error("Failed to fetch user data:", data.message);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    checkAuthentication();
  }, []);

  // Skip rendering QR and name if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  //logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");

      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fullName || "Loading..."}</Text>
      <QRCode value="Placeholder QR Code" size={200} />
      
      {/* Logout Button */}
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} />
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
    fontSize: 24, 
    marginBottom: 20,
  },
  logoutButtonContainer: {
    marginTop: 20,
    padding: 10,
  }
});