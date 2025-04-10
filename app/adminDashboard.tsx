import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator, FlatList, TextInput, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import { ScrollView } from "react-native";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | string>('');
  const [operation, setOperation] = useState<string>('add');
  const [quantity, setQuantity] = useState<number | string>(''); 
  const [loadingAction, setLoadingAction] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const role = await AsyncStorage.getItem("userRole");

        if (!token || role !== "admin") {
          Alert.alert("Access Denied", "Only admins can access this page.");
          router.replace("/qr");
        } else {
          setIsAdmin(true);
          fetchStock();
        }
      } catch (error) {
        console.error("Error checking access:", error);
        Alert.alert("Error", "An error occurred while checking your access.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  const fetchStock = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/stock");
      const data = await response.json();
  
      // Sort by ID to ensure consistent order
      const sortedData = data.sort((a, b) => a.id - b.id);
  
      setStockItems(sortedData);
  
      if (sortedData.length > 0) {
        setSelectedItem(sortedData[0].id);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      Alert.alert("Error", "Failed to fetch stock data.");
    }
  };
  
  const handleStockChange = async () => {
    console.log("Button clicked");
  
    const quantityNumber = Number(quantity);
    console.log("Quantity:", quantity, "Converted to Number:", quantityNumber);
    
    if (!selectedItem || isNaN(quantityNumber) || quantityNumber <= 0) {
      Alert.alert("Invalid Input", "Please select a valid item and provide a valid quantity.");
      return;
    }
  
    const change = quantityNumber;
  
    const updatedItem = stockItems.find((item) => item.id === selectedItem);
    console.log("Updated Item:", updatedItem);
  
    if (updatedItem) {
      setLoadingAction(true);
  
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        const response = await fetch(`http://localhost:5000/api/stock/${updatedItem.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            quantity: change,
            operation: operation,  // Ensure this is either 'add' or 'subtract'
          }),
        });
  
        const data = await response.json();
        console.log("API Response:", data);
  
        if (response.ok) {
          Alert.alert("Success", "Stock updated successfully.");
          fetchStock();  // Refresh stock after the update
        } else {
          Alert.alert("Error", data.message || "Failed to update stock.");
        }
      } catch (error) {
        console.error("Error updating stock:", error);
        Alert.alert("Error", "An error occurred while updating the stock.");
      } finally {
        setLoadingAction(false);
      }
    } else {
      console.log("Selected item not found");
    }
  };
  
  

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
        <ScrollView contentContainerStyle={styles.scrollContent} style={{ width: "100%" }}>
          <Text style={styles.subtitle}>Stock:</Text>
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
              scrollEnabled={false}
            />
          </View>
  
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Select Item:</Text>
            <Picker
              selectedValue={selectedItem}
              style={styles.dropdown}
              onValueChange={(itemValue) => setSelectedItem(itemValue)}
            >
              <Picker.Item label="Select Item" value="" />
              {stockItems.map((item) => (
                <Picker.Item
                  key={item.id}
                  label={`${item.name} - ${item.size}`}
                  value={item.id}
                />
              ))}
            </Picker>
  
            <Text style={styles.inputLabel}>Operation:</Text>
            <Picker
              selectedValue={operation}
              style={styles.dropdown}
              onValueChange={(itemValue) => setOperation(itemValue)}
            >
              <Picker.Item label="Add" value="add" />
              <Picker.Item label="Subtract" value="subtract" />
            </Picker>
  
            <Text style={styles.inputLabel}>Quantity:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity.toString()}
              onChangeText={(text) => setQuantity(text)}
            />
  
            <Button
              title={loadingAction ? "Processing..." : "Update Stock"}
              onPress={handleStockChange}
              disabled={loadingAction}
            />
          </View>
        </ScrollView>
      ) : (
        <Text>You do not have admin privileges.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: "#99CCFF",
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 10,
    alignItems: "center",
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: 'center',
  },
  tableContainer: {
    width: "80%",
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#004c8c",
    backgroundColor: "#ffffff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#004c8c",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffffff",
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
  inputContainer: {
    width: "80%",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#004c8c",
    flexDirection: "column",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    width: "60%",
    minWidth: 80,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
  dropdown: {
    width: "60%",
    minWidth: 80,
    marginBottom: 10,
  },
});
