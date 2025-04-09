import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function QRScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fullName, setFullName] = useState("");
  const [uuid, setUuid] = useState("");
  const [role, setRole] = useState("");  // Add role state to handle redirection
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);

        try {
          const response = await fetch("http://localhost:5000/api/auth/qr", { 
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log("User data:", data);

          if (response.ok) {
            setFullName(data.fullName);
            setUuid(data.uuid);
            setRole(data.role);  // Set the role value here

            // Check the role and navigate if it's admin
            if (data.role === 'admin') {
              // Redirect to admin dashboard
              router.push("/adminDashboard");
            }
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

  const handleAdminDashboard = () => {
    if (role === "admin") {
      router.push("/adminDashboard");  // Redirect to admin dashboard if the user is admin
    }
  };

  // Logout
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

      {/* Only render if uuid available */}
      {uuid && <QRCode value={uuid} size={300} />}

      {/* View Inventory Button */}
      <View style={styles.buttonWrapper}>
        <Button title="View Inventory" onPress={handleViewInventory} />
      </View>

      {/* Admin Dashboard Button (only visible to admins) */}
      {role === "admin" && (
        <View style={styles.buttonWrapper}>
          <Button title="Go to Admin Dashboard" onPress={handleAdminDashboard} />
        </View>
      )}

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
