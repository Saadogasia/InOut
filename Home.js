import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";
import { useFocusEffect } from "@react-navigation/native";
import { db, doc, getDoc, updateDoc, arrayUnion, setDoc } from "./Config";

export default function Home({ navigation, userId }) {
  const [amount, setAmount] = useState(0);
  const [inAmount, setInAmount] = useState(0);
  const [outAmount, setOutAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [reason, setReason] = useState("");
  const [seemodal, setSeeModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (userId) {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAmount(userData.balance || 0);
          setInAmount(userData.inAmount || 0);
          setOutAmount(userData.outAmount || 0);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [userId])
  );

  const handleModal = (type) => {
    setModalType(type);
    setSeeModal(true);
  };

  const updateBalance = async (amount, type, reason) => {
    if (userId) {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const newBalance =
            type === "IN"
              ? userData.balance + amount
              : userData.balance - amount;

          await updateDoc(userRef, {
            balance: newBalance,
            [type === "IN" ? "inAmount" : "outAmount"]:
              (userData[type === "IN" ? "inAmount" : "outAmount"] || 0) +
              amount,
            history: arrayUnion({
              type,
              amount,
              reason,
              date: new Date().toISOString(),
            }),
          });

          setAmount(newBalance);
          if (type === "IN") {
            setInAmount((prevInAmount) => prevInAmount + amount);
          } else {
            setOutAmount((prevOutAmount) => prevOutAmount + amount);
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error updating balance:", error);
      } finally {
        setLoading(false);
        setSeeModal(false);
        setInputAmount("");
        setReason("");
      }
    }
  };

  const handleUpdate = () => {
    if (!inputAmount || !reason) {
      Alert.alert("Error", "Please enter both amount and reason.");
      return;
    }

    const amountValue = parseFloat(inputAmount);

    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert(
        "Error",
        "Please enter a valid positive number for the amount."
      );
      return;
    }

    if (modalType === "IN") {
      updateBalance(amountValue, "IN", reason);
    } else if (modalType === "OUT") {
      updateBalance(amountValue, "OUT", reason);
    }
  };

  const inputStyle = modalType === "IN" ? styles.inputIn : styles.inputOut;
  const modalTitleStyle =
    modalType === "IN" ? styles.modalTitleIn : styles.modalTitleOut;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.balanceTitle}>BALANCE</Text>
        <Text style={styles.balanceAmount}>₹ {amount}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <View style={styles.balanceCard}>
          <MaterialCommunityIcons
            name="cash-plus"
            size={30}
            color="#FFF5EE"
            style={styles.icon}
          />
          <Text style={styles.cardTitle}>IN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.cardAmount, styles.inAmount]}>
              ₹ {inAmount}
            </Text>
          </ScrollView>
        </View>

        <View style={styles.balanceCard}>
          <MaterialCommunityIcons
            name="cash-minus"
            size={30}
            color="#FFF5EE"
            style={styles.icon}
          />
          <Text style={styles.cardTitle}>OUT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={[styles.cardAmount, styles.outAmount]}>
              ₹ {outAmount}
            </Text>
          </ScrollView>
        </View>
      </View>
      <View style={styles.circles}>
        <View>
          <TouchableOpacity>
            <Entypo
              name="circle-with-plus"
              size={40}
              color="#00e400"
              style={styles.addIcon}
              onPress={() => handleModal("IN")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity>
            <Entypo
              name="circle-with-minus"
              size={40}
              color="red"
              style={styles.minusIcon}
              onPress={() => handleModal("OUT")}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        transparent={true}
        visible={seemodal}
        onRequestClose={() => setSeeModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSeeModal(false)}
            >
              <MaterialCommunityIcons name="close" size={30} color="red" />
            </TouchableOpacity>
            <Text style={modalTitleStyle}>
              {modalType === "IN" ? "IN" : "OUT"}
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="Amount"
              value={inputAmount}
              onChangeText={setInputAmount}
              keyboardType="numeric"
              placeholderTextColor={"#808080"}
            />
            <TextInput
              style={inputStyle}
              placeholder="Reason"
              value={reason}
              onChangeText={setReason}
              placeholderTextColor={"#808080"}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleUpdate}>
              <Text style={styles.modalButtonText}>
                {modalType === "IN" ? "Done" : "Done"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.activityIndicator}>
          <ActivityIndicator size="small" color="#00e400" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 16,
  },
  header: {
    alignItems: "flex-start",
    marginTop: 20,
  },
  balanceTitle: {
    fontSize: 37,
    color: "#FFF5EE",
    fontFamily: "poppinsbold",
  },
  balanceAmount: {
    fontSize: 47,
    color: "#e4fc5e",
    marginRight: 50,
    fontFamily: "poppinsbold",
    marginTop: -10,
  },
  balanceContainer: {
    justifyContent: "space-between",
    marginTop: 30,
  },
  circles: {
    position: "absolute",
    top: 45,
    right: 10,
    flexDirection: "column",
    alignItems: "center",
  },
  addIcon: {
    marginBottom: 10,
  },
  minusIcon: {
    marginBottom: 10,
  },
  balanceCard: {
    margin: 8,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#222222",
    height: 100,
    width: "100%",
    position: "relative",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 5,
  },
  cardTitle: {
    fontSize: 20,
    color: "white",
    fontFamily: "poppinsbold",
    marginBottom: 5,
  },
  cardAmount: {
    fontSize: 30,
    color: "white",
    fontFamily: "poppinsbold",
  },
  inAmount: {
    color: "#86Dc3D",
  },
  outAmount: {
    color: "red",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#222222",
    borderRadius: 10,
    width: "80%",
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  modalTitleIn: {
    fontSize: 25,
    marginRight: 150,
    bottom: 30,
    color: "#86Dc3D",
    fontFamily: "poppinsbold",
    marginBottom: 10,
  },
  modalTitleOut: {
    fontSize: 25,
    marginRight: 150,
    bottom: 30,
    color: "red",
    fontFamily: "poppinsbold",
    marginBottom: 10,
  },
  inputIn: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#86Dc3D",
    marginBottom: 10,
    color: "white",
    fontSize: 17,
  },
  inputOut: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "red",
    marginBottom: 10,
    color: "white",
    fontSize: 17,
  },
  modalButton: {
    backgroundColor: "#86Dc3D",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "poppinsbold",
  },
  activityIndicator: {
    position: "absolute",
    bottom: "97%",
    left: "102%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
});
