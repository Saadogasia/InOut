import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { db, doc, getDoc, updateDoc } from "./Config";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
export default function History({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newReason, setNewReason] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState("All");

  const fetchHistory = async () => {
    try {
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          filterTransactions(userData.history || []);
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (allTransactions) => {
    let filteredTransactions = allTransactions;

    if (filterType !== "All") {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.type === filterType
      );
    }

    setTransactions(filteredTransactions);
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [userId, filterType])
  );

  const handleDeleteTransaction = async (index) => {
    if (userId) {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const transactionToDelete = userData.history[index];
          const updatedHistory = userData.history.filter((_, i) => i !== index);

          let updatedBalance = userData.balance;
          let updatedInAmount = userData.inAmount;
          let updatedOutAmount = userData.outAmount;

          if (transactionToDelete.type === "IN") {
            updatedBalance -= transactionToDelete.amount;
            updatedInAmount -= transactionToDelete.amount;
          } else {
            updatedBalance += transactionToDelete.amount;
            updatedOutAmount -= transactionToDelete.amount;
          }

          await updateDoc(userRef, {
            history: updatedHistory,
            balance: updatedBalance,
            inAmount: updatedInAmount,
            outAmount: updatedOutAmount,
          });

          setTransactions(updatedHistory);
          setSelectedTransaction(null);
          setShowModal(false);
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateTransaction = async () => {
    if (userId && selectedTransaction !== null) {
      setLoading(true);
      try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedHistory = [...userData.history];
          const oldTransaction = updatedHistory[selectedTransaction];
          const oldAmount = oldTransaction.amount;
          const newAmountValue = parseFloat(newAmount);

          updatedHistory[selectedTransaction] = {
            ...oldTransaction,
            amount: newAmountValue,
            reason: newReason,
          };

          let newBalance =
            userData.balance +
            (oldTransaction.type === "IN" ? -oldAmount : oldAmount);
          newBalance +=
            oldTransaction.type === "IN" ? newAmountValue : -newAmountValue;

          let newInAmount = userData.inAmount;
          let newOutAmount = userData.outAmount;

          if (oldTransaction.type === "IN") {
            newInAmount -= oldAmount;
          } else {
            newOutAmount -= oldAmount;
          }

          if (oldTransaction.type === "IN") {
            newInAmount += newAmountValue;
          } else {
            newOutAmount += newAmountValue;
          }

          await updateDoc(userRef, {
            history: updatedHistory,
            balance: newBalance,
            inAmount: newInAmount,
            outAmount: newOutAmount,
          });

          setTransactions(updatedHistory);
          setShowModal(false);
        }
      } catch (error) {
        console.error("Error updating transaction:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00e400" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={styles.filterIcon}
        >
          <Ionicons name="filter" size={20} color="#FAF9F6" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.gridContainer}>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.iconAndTextContainer}>
                  <View
                    style={[
                      styles.circleIcon,
                      {
                        backgroundColor:
                          transaction.type === "OUT" ? "#FF4C4C" : "#4CAF50",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        transaction.type === "OUT"
                          ? "arrow-up-bold"
                          : "arrow-down-bold"
                      }
                      size={22}
                      color="#FFFFFF"
                    />
                  </View>
                  <View>
                    <Text style={styles.reasonText}>{transaction.reason}</Text>
                    <Text style={styles.dateText}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.rightContainer}>
                  <Text
                    style={[
                      styles.amountText,
                      {
                        color:
                          transaction.type === "OUT" ? "#FF4C4C" : "#86Dc3D",
                      },
                    ]}
                  >
                    ₹{transaction.amount}
                  </Text>
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTransaction(index);
                        setModalType("Update");
                        setNewAmount(transaction.amount.toString());
                        setNewReason(transaction.reason);
                        setShowModal(true);
                      }}
                      style={styles.iconButton}
                    >
                      <MaterialCommunityIcons
                        name="pencil"
                        size={20}
                        color="#AAAAAA"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTransaction(index);
                        setModalType("Delete");
                        setShowModal(true);
                      }}
                      style={styles.iconButton}
                    >
                      <MaterialCommunityIcons
                        name="trash-can"
                        size={20}
                        color="#AAAAAA"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTransactionsText}>No transactions yet.</Text>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {modalType === "Update" && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="New Amount"
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="New Reason"
                  value={newReason}
                  onChangeText={setNewReason}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleUpdateTransaction}
                >
                  <Text style={styles.modalButtonText}>Update</Text>
                </TouchableOpacity>
              </>
            )}
            {modalType === "Delete" && (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF4C4C" }]}
                onPress={() => handleDeleteTransaction(selectedTransaction)}
              >
                <Text style={styles.modalButtonText}>Confirm Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === "IN" && styles.activeFilterButton,
                ]}
                onPress={() => {
                  setFilterType("IN");
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterButtonText}>IN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === "OUT" && styles.activeFilterButton,
                ]}
                onPress={() => {
                  setFilterType("OUT");
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterButtonText}>OUT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterType === "All" && styles.activeFilterButton,
                ]}
                onPress={() => {
                  setFilterType("All");
                  setShowFilterModal(false);
                }}
              >
                <Text style={styles.filterButtonText}>All</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 10,
    paddingTop: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  filterIcon: {
    backgroundColor: "#222222",
    padding: 10,
    zIndex: 1,
    borderRadius: 20,
  },
  gridContainer: {
    flexDirection: "column",
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
    padding: 15,
    backgroundColor: "#202020",
    borderRadius: 8,
    position: "relative", // For positioning the icon absolutely
    overflow: "hidden", // Ensure the icon stays within the card bounds
  },
  iconAndTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  reasonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  dateText: {
    color: "#999999",
    fontSize: 14,
    top: 1,
  },
  rightContainer: {
    flexDirection: "column",
    justifyContent: "flex-end", // Align items to the bottom
    alignItems: "flex-end", // Align items to the end of the column
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10, // Space between the amount and the bottom of the card
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
  noTransactionsText: {
    color: "#ffffff",
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#222222",
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    marginBottom: 10,
    color: "white",
    borderRadius: 5,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  filterModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#222222",
    borderRadius: 10,
    alignItems: "center",
  },
  filterButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  filterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#444444",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  activeFilterButton: {
    backgroundColor: "black", // Highlight color when selected
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
