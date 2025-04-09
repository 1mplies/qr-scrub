import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QRCode from "react-native-qrcode-svg";

// Define a type for inventory items
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  uuid: string;
}

export default function InventoryScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        // fetch inventory data from the server once authenticated
        fetchInventoryData(token);
      }
    };

    checkAuthentication();
  }, []);

  const fetchInventoryData = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/inventory", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inventory data");
      }

      const data = await response.json();
      setInventoryItems(data); // update the state with the fetched inventory
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Handle item selection
  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item); // set selected item for QR code generation
  };

  // Handle return to item list
  const handleBackToInventory = () => {
    setSelectedItem(null); // clear selected item and go back to inventory list
  };

  return (
    <View style={styles.container}>
      {/* If an item is selected, show QR code */}
      {selectedItem ? (
        <View style={styles.qrContainer}>
          <Text style={styles.qrText}>Scan this QR code to return the item:</Text>
          <QRCode value={selectedItem.uuid} size={200} />
          <Text style={styles.itemDetailsText}>Item: {selectedItem.name}</Text>
          <Text style={styles.itemDetailsText}>Quantity: {selectedItem.quantity}</Text>
          <TouchableOpacity onPress={handleBackToInventory} style={styles.returnButton}>
            <Text style={styles.returnButtonText}>Back to Inventory</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // if no item is selected, show the inventory list or an empty inventory message
        <View style={styles.inventoryContainer}>
          <Text style={styles.title}>My Inventory:</Text>

          {inventoryItems.length === 0 ? (
            <Text style={styles.emptyInventoryText}>Your inventory is empty.</Text>
          ) : (
            <ScrollView style={styles.scrollView}>
              {inventoryItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleItemSelect(item)}
                  style={styles.itemCard}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                  <Text style={styles.itemTextQty}>Quantity: {item.quantity}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#99CCFF",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  scrollView: {
    width: "100%",
    marginBottom: 20,
  },
  inventoryContainer: {
    flex: 1,
    width: "100%",
  },
  itemCard: {
    backgroundColor: "#5e91ff",
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
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
  },
  qrContainer: {
    marginTop: 20,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  qrText: {
    fontSize: 18,
    marginBottom: 10,
  },
  itemDetailsText: {
    fontSize: 16,
    color: "#252fc2",
    marginTop: 10,
  },
  returnButton: {
    marginTop: 20,
    backgroundColor: "#5e91ff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  returnButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  emptyInventoryText: {
    fontSize: 18,
    color: "#FF6347",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});