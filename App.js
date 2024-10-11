import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./AppNavigator";

const firestore = getFirestore();
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    poppinsbold: require("./assets/fonts/poppinsbold.ttf"),
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [userId, setUserId] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const handleSplashScreen = async () => {
      if (loaded || error) {
        await SplashScreen.hideAsync();
        const timer = setTimeout(() => {
          setShowWelcome(false);
        }, 1000);
        return () => clearTimeout(timer);
      }
    };
    handleSplashScreen();
  }, [loaded, error]);

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("email");
        const storedPassword = await AsyncStorage.getItem("password");

        if (storedEmail && storedPassword) {
          // Attempt auto-login
          const userCredential = await signInWithEmailAndPassword(
            auth,
            storedEmail,
            storedPassword
          );
          const user = userCredential.user;
          setUserId(user.uid);

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
        }
      } catch (error) {
        console.error("Error during auto-login:", error);
      }
    };

    checkAutoLogin();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="black" />
      <AppNavigator
        showWelcome={showWelcome}
        userId={userId}
        onAuth={setUserId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
