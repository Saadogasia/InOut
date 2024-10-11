import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "./Config";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firestore = getFirestore();

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Error message state

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPassword = await AsyncStorage.getItem("password");

        if (storedEmail && storedPassword) {
          setEmail(storedEmail);
          setPassword(storedPassword);
        }
      } catch (error) {
        console.error("Error fetching stored login info", error);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    setErrorMessage("");
    if (!validatePassword(password)) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
        onAuth(user.uid);

        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            balance: 0,
            inAmount: 0,
            outAmount: 0,
            history: [],
          });
        }
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
        onAuth(user.uid);

        await setDoc(doc(firestore, "users", user.uid), {
          balance: 0,
          inAmount: 0,
          outAmount: 0,
          history: [],
        });
      }
    } catch (error) {
      console.error("Authentication error", error);
      let message = "An unexpected error occurred.";
      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/user-not-found":
          message = "No user found with this email.";
          break;
        case "auth/wrong-password":
          message = "Incorrect password.";
          break;
        case "auth/email-already-in-use":
          message = "Email is already in use.";
          break;
        case "auth/weak-password":
          message = "Password is too weak. Please use a stronger password.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please try again later.";
          break;
        default:
          message = error.message;
      }
      setErrorMessage(message);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password Reset", "Password reset email sent!");
      setShowResetPassword(false);
    } catch (error) {
      console.error("Error sending password reset email", error);
      let message = "Failed to send password reset email.";
      switch (error.code) {
        case "auth/invalid-email":
          message = "Invalid email address.";
          break;
        case "auth/user-not-found":
          message = "No user found with this email.";
          break;
        case "auth/network-request-failed":
          message = "Network error. Please try again later.";
          break;
        default:
          message = error.message;
      }
      setErrorMessage(message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require("./assets/io.png")} style={styles.headerImage} />
      </View>
      <View style={styles.authContainer}>
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
        {showResetPassword ? (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#bbbbbb"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Send Reset Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowResetPassword(false)}
              style={styles.toggleLink}
            >
              <Text style={styles.toggleLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {isLogin ? "Login" : "Create Account"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#bbbbbb"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#bbbbbb"
            />
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
              <Text style={styles.buttonText}>
                {isLogin ? "Login" : "Sign Up"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              style={styles.toggleLink}
            >
              <Text style={styles.toggleLinkText}>
                {isLogin ? "Create an Account" : "Back to Login"}
              </Text>
            </TouchableOpacity>
            {isLogin && (
              <TouchableOpacity
                onPress={() => setShowResetPassword(true)}
                style={styles.toggleLink}
              >
                <Text style={styles.toggleLinkText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerImage: {
    width: 350,
    height: 100,
  },
  authContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderColor: "#dddddd",
    borderWidth: 1,
    color: "white",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleLink: {
    alignItems: "center",
    marginTop: 10,
  },
  toggleLinkText: {
    color: "#007bff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
});
