import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
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
