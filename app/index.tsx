import { useState } from "react";

import { View, Text, Button, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Hospital Logo */}
      <Image source={require("../assets/images/hospital_logo.png")} style={styles.logo} />

      {/* App Title */}
      <Text style={styles.title}>QR-Scrub</Text>

      {/* App Description */}
      <Text style={styles.description}>
        Welcome to our scrub checkout system!
      </Text>
      <Text style={styles.description}>
        Please log in to borrow and return scrubs in just a swipe!
      </Text>

      <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/login")}>
        <Text style={styles.loginButtonText}>Log in or Register</Text>
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
    backgroundColor: "#E3F2FD",
  },
  logo: {
    width: 200, 
    height: 200, 
    marginBottom: 10,
    marginTop: -40,
    borderRadius: 20, 
    resizeMode: "contain", 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1565C0",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: 'Cochin',
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
