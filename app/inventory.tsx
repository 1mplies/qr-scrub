import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg"; // To generate QR code

// Define a type for inventory items
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  uuid: string;
}

export default function InventoryScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Explicitly define the type of inventoryItems as an array of InventoryItem
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
    { id: 1, name: "Scrub - S", quantity: 5, uuid: "uuid-s" },
    { id: 2, name: "Scrub - M", quantity: 3, uuid: "uuid-m" },
    { id: 3, name: "Scrub - L", quantity: 2, uuid: "uuid-l" }
  ]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null); // To hold the selected item for QR generation
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuthentication();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  // Handle item selection
  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item); // Set selected item for QR code generation
  };

  // Handle QR code scanning (simulated on backend)
  const handleItemReturn = async () => {
    if (!selectedItem) {
      return;
    }

    // Call backend API to remove the item from user's inventory
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/inventory/remove/${selectedItem.uuid}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // Remove the item from local state upon successful removal
        setInventoryItems(prevItems =>
          prevItems.map(item =>
            item.uuid === selectedItem.uuid
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        );
        setSelectedItem(null); // Clear the selected item
      } else {
        console.error("Failed to remove item:", response.statusText);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Inventory:</Text>

      {/* Scroll view of items */}
      <ScrollView style={styles.scrollView}>
        {inventoryItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => handleItemSelect(item)}>
            <View style={styles.itemCard}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemTextQty}>qty: {item.quantity}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Display QR Code when an item is selected */}
      {selectedItem && (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Scan this QR code to return the item:</Text>
          <QRCode value={selectedItem.uuid} size={200} />
          <Button title="Return Item" onPress={handleItemReturn} />
        </View>
      )}

      <Text style={styles.launderingMessage}>
        Please return these items & scan your QR code at checkout!
      </Text>

      <View style={{ marginTop: 10 }}>
        <Button title="Return to QR" onPress={() => router.push("/qr")} />
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
    fontWeight: "bold",
    marginBottom: 20,
  },
  scrollView: {
    width: "100%",
  },
  itemCard: {
    backgroundColor: "#5e91ff", // item card color
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemText: {
    fontSize: 18,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#fff",
  },
  itemTextQty: {
    fontSize: 18,
    marginBottom: 5,
    color: "#252fc2",
    fontWeight: "bold",
  },
  qrContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  qrText: {
    fontSize: 18,
    marginBottom: 10,
  },
  launderingMessage: {
    fontSize: 18,
    color: "#252fc2",
    marginBottom: 20,
  },
});
