import React, { useState, useEffect, } from "react";
import { View, Text, StyleSheet, ScrollView, Button,} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function InventoryScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([
    { id: 1, name: "Scrub - S", quantity: 5 },
    { id: 2, name: "Scrub - M", quantity: 3 },
    { id: 3, name: "Scrub - L", quantity: 2 }
  ]);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Inventory:</Text>

      {/* scroll view of items */}
      <ScrollView style={styles.scrollView}>
        {inventoryItems.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemTextQty}>qty: {item.quantity}</Text>
          </View>
        ))}
      </ScrollView>

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
    backgroundColor: "#5e91ff", //item card color
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
    color: "#fff"
  },
  itemTextQty: {
    fontSize: 18,
    marginBottom: 5,
    color: "#252fc2",
    fontWeight: "bold",
  },
  launderingMessage: {
    fontSize: 18,
    color: "#252fc2",
    marginBottom: 20,
  },
});
