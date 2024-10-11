import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

const auth = getAuth();
const firestore = getFirestore();

export default function Profile() {
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const handleResetBalance = async () => {
    try {
      const userRef = doc(firestore, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        balance: 0,
        inAmount: 0,
        outAmount: 0,
        history: [],
      });
      Alert.alert("Balance Reset", "Your balance has been reset successfully.");
      setConfirmVisible(false);
    } catch (error) {
      console.error("Error resetting balance", error);
    }
  };

  const openConfirmModal = () => {
    setConfirmVisible(true);
  };

  const closeConfirmModal = () => {
    setConfirmVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: "white", fontSize: 20, bottom: 15 }}>WELCOME</Text>
      <Text style={styles.emailText}>{userEmail}</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={openConfirmModal}>
          <Text style={styles.buttonText}>Reset Balance</Text>
        </TouchableOpacity>
        <Text style={styles.description}>
          Warning: All your data will be deleted and cannot be restored.
        </Text>
      </View>

      <Modal
        transparent={true}
        visible={confirmVisible}
        onRequestClose={closeConfirmModal}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Reset</Text>
            <Text style={styles.modalDescription}>
              All your balance and transaction history will be deleted
              permanently.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeConfirmModal}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleResetBalance}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    padding: 16,
  },
  profileCard: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
    marginBottom: 20,
  },
  emailText: {
    fontSize: 18,
    bottom: 10,
    color: "#e4fc5e",
    marginBottom: 10,
  },
  card: {
    width: "90%",
    padding: 15,
    marginTop: 50,
    borderRadius: 10,
    backgroundColor: "#333",
    alignItems: "center",
  },
  description: {
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    color: "#e4fc5e",
    marginBottom: 10,
  },
  modalDescription: {
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    width: "45%",
  },
  cancelButton: {
    backgroundColor: "red",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
