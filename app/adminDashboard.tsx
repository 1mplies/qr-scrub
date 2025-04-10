import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Admin Dashboard component
export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);  // State for stock data
  const router = useRouter();

  // Admin role and token check
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const role = await AsyncStorage.getItem("userRole");

        if (!token || role !== "admin") {
          Alert.alert("Access Denied", "Only admins can access this page.");
          router.replace("/qr"); // Redirect to QR screen if not an admin
        } else {
          setIsAdmin(true);
          fetchStock();  // Fetch stock data after validating the admin
        }
      } catch (error) {
        console.error("Error checking access:", error);
        Alert.alert("Error", "An error occurred while checking your access.");
      } finally {
        setIsLoading(false); // Stop loading after the check
      }
    };

    checkAccess();
  }, [router]);

  // Fetch stock items from the backend
  const fetchStock = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stock"); 
      const data = await response.json();
      setStockItems(data);  // Set stock items in state
    } catch (error) {
      console.error("Error fetching stock:", error);
      Alert.alert("Error", "Failed to fetch stock data.");
    }
  };

  // Loading indicator when data is being fetched
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {isAdmin ? (
        <>
          <Text style={styles.subtitle}>Stock:</Text>

          {/* Stock Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Item</Text>
              <Text style={styles.tableHeaderText}>Size</Text>
              <Text style={styles.tableHeaderText}>Quantity</Text>
            </View>

            <FlatList
              data={stockItems}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={styles.tableText}>{item.name}</Text>
                  <Text style={styles.tableText}>{item.size}</Text>
                  <Text style={styles.tableText}>{item.quantity}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </>
      ) : (
        <Text>You do not have admin privileges.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  tableContainer: {
    width: "100%",
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableText: {
    flex: 1,
    textAlign: "center",
  },
});
