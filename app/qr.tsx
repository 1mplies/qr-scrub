import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QRScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [uuid, setUuid] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        // redirect to login on no valid token
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        
        // fetch user data
        try {
          const response = await fetch("http://localhost:5000/api/auth/qr", { 
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (response.ok) {
            setFullName(data.fullName);
            setUuid(data.uuid);
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


  const handleViewInventory = () => {
    router.push("/inventory");
  };

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
      <Text style={styles.title}>
        {fullName ? `Welcome, ${fullName}` : "Loading..."}
      </Text>
      
      {/* only render if uuid available */}
      {uuid && <QRCode value={uuid} size={300} />}
      
          {/* View Inventory Button */}
    <View style={styles.buttonWrapper}>
      <Button title="View Inventory" onPress={handleViewInventory} />
    </View>

      {/* Logout Button */}
      <View style={styles.buttonWrapper}>
        <Button title="Log Out" onPress={handleLogout} />
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
    fontSize: 40, 
    marginBottom: 20,
    fontWeight: "bold",
    fontStyle: "italic",
  },
  buttonWrapper: {
    width: 200,
    marginTop: 15,
    borderRadius: 12, 
    overflow: "hidden",
  },
});