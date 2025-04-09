import { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("user"); // Default role is "user"
  const router = useRouter();

  const handleRegister = async () => {
    // Validation for the fields
    if (!fullName) {
      setError("Please enter a full name.");
      return;
    }

    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Ensure role is defined
    if (!role) {
      setError("Role is required.");
      return;
    }

    // Log role to make sure it is being passed correctly
    console.log("Selected Role: ", role);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          password,
          username: email.split("@")[0], // Use the email prefix as the username
          role, // Pass the selected role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setError("");
      alert("Registration successful!");
      router.push("/login"); // Redirect to login after successful registration
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your new account!</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.roleSelection}>
        <Text>Role:</Text>
        <Button title="Set as Admin" onPress={() => setRole("admin")} />
        <Button title="Set as User" onPress={() => setRole("user")} />
        <Text>Selected Role: {role}</Text> {/* Show the selected role */}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Register" onPress={handleRegister} />

      <View style={styles.loginContainer}>
        <Text>Already have an account?  </Text>
        <Button title="Log In" onPress={() => router.push("/login")} />
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
    fontStyle: "italic" 
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
  roleSelection: {
    marginTop: 10,
    marginBottom: 20,
  },
  loginContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
