import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // Validate email and password input
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
  
    if (!password) {
      setError("Please enter your password.");
      return;
    }
  
    setError(""); // Clear any previous errors
  
    try {
      // Send POST request to login API
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Save the authentication token and user role to AsyncStorage
        await AsyncStorage.setItem("authToken", data.token);
        await AsyncStorage.setItem("userRole", data.role);  // Save the role
  
        // Check if the user is an admin and navigate accordingly
        if (data.role === "admin") {
          router.push("/adminDashboard");  // Navigate to Admin Dashboard
        } else {
          router.push("/qr");  // Navigate to QR page for regular users
        }
      } else {
        // Display error message if login fails
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      // Handle any network or server errors
      setError("An error occurred. Please try again.");
    }
  };

  const handleRegister = () => {
    // Navigate to the registration screen
    router.push("/register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Please Log In!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Log In" onPress={handleLogin} />

      <View style={styles.registerContainer}>
        <Text>Don't have an account?  </Text>
        <Button title="Register" onPress={handleRegister} />
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
    fontWeight: "bold", 
    fontStyle: "italic", 
  },
  input: { 
    width: "70%", 
    padding: 10, 
    borderWidth: 1, 
    borderRadius: 5, 
    marginBottom: 20, 
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    marginBottom: 20,
    fontSize: 14,
  },
  registerContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
