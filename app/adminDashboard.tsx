import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert, Button, TextInput, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Mock function to fetch users (replace with actual API call)
const fetchUsers = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/users"); // Replace with actual API URL
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Mock function to delete a user (replace with actual API call)
const deleteUser = async (userId: string) => {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}`, { method: "DELETE" });
    if (response.ok) {
      return true;
    }
    throw new Error("Failed to delete user");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Admin Dashboard component
export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isAdmin, setIsAdmin] = useState(false); // Admin check state
  const [users, setUsers] = useState<any[]>([]); // Users list state
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "user" }); // New user state
  const [error, setError] = useState(""); // Error message state
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
          const fetchedUsers = await fetchUsers(); // Fetch users from API
          setUsers(fetchedUsers); // Update users state
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

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      const isDeleted = await deleteUser(userId);
      if (isDeleted) {
        setUsers(users.filter((user) => user.id !== userId)); // Remove user from local state
        Alert.alert("Success", "User has been deleted.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete the user.");
    }
  };

  // Handle user creation
  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email) {
      setError("Please provide both username and email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers([...users, createdUser]); // Add created user to local state
        setNewUser({ username: "", email: "", role: "user" }); // Clear input fields
        Alert.alert("Success", "User created successfully.");
      } else {
        throw new Error("Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      Alert.alert("Error", "Failed to create user.");
    }
  };

  // Handle user role change
  const handleRoleChange = (userId: string, newRole: string) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    setUsers(updatedUsers); // Update local state with new role
    // Optionally, you can make an API call to update the role on the server
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
          <Text>Welcome, Admin! Here you can manage users and their roles.</Text>

          {/* Create New User Form */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={newUser.username}
              onChangeText={(text) => setNewUser({ ...newUser, username: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
            />
            <Button title="Create User" onPress={handleCreateUser} />
            {error && <Text style={styles.error}>{error}</Text>}
          </View>

          {/* List of Users */}
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <Text>{item.username} ({item.email}) - {item.role}</Text>
                <Button title="Delete" onPress={() => handleDeleteUser(item.id)} />
                <Button
                  title={`Set as ${item.role === "user" ? "Admin" : "User"}`}
                  onPress={() =>
                    handleRoleChange(item.id, item.role === "user" ? "admin" : "user")
                  }
                />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
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
  formContainer: {
    marginBottom: 20,
    width: "80%",
    padding: 20,
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
  },
  userItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#eaeaea",
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
});
