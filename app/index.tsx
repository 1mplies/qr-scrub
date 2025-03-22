import { View, Text, Button, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Hospital Logo - Adjusted higher */}
      <Image source={require("../assets/images/hospital_logo.png")} style={styles.logo} />

      {/* App Title */}
      <Text style={styles.title}>Hospital Scrub Borrowing System</Text>

      {/* App Description */}
      <Text style={styles.description}>
        Welcome to our hospital's scrub borrowing system! Easily borrow and return scrubs with 
        just a few taps. Log in to get started.
      </Text>

      {/* Larger Button */}
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/login")}>
        <Text style={styles.loginButtonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E3F2FD", // Light blue hospital theme
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10, // Reduced margin to move it up
    marginTop: -40, // Moves logo higher
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1565C0", // Dark blue title
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#1565C0", // Dark blue button
    paddingVertical: 15, // Increased padding for larger button
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 10, // Adds space from description
  },
  loginButtonText: {
    fontSize: 18, // Larger text
    color: "#fff",
    fontWeight: "bold",
  },
});
