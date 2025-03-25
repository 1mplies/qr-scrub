import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";  // Import AsyncStorage


const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    // Validate email format
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Ensure password is not empty
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    router.push("/qr");

    try {
        // Sending POST request to backend API
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
    
        const data = await response.json(); // Parse the response body into JSON
    
        if (response.ok) {
          // If login is successful, store the authentication token in AsyncStorage
          await AsyncStorage.setItem("authToken", data.token);
    
          // Navigate to another screen after successful login
          router.push("/qr"); // Navigate to your QR screen (or the desired route)
        } else {
          // Show error message if login fails
          setError(data.message || "Login failed. Please try again.");
        }
      } catch (error) {
        // Handle network errors or any other issues
        setError("An error occurred. Please try again.");
      }
    
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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

      {/* Error Message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Login Button */}
      <Button title="Login" onPress={handleLogin} />

      {/* Register Redirect */}
      <View style={styles.registerContainer}>
        <Text>Don't have an account?</Text>
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
  title: { fontSize: 24, marginBottom: 20 },
  input: { 
    width: "100%", 
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
