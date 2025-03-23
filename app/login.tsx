import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {

    if (email && password) {
      router.push("/qr"); // Route to qr.tsx
    } else {
      alert("Please enter valid credentials.");
    }
  };

  const handleRegister = () => {
    router.push("/register"); // Route to the register page
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

      <Button title="Login" onPress={handleLogin} />

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
    backgroundColor: "#fff"
  },
  registerContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
