import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";
import { useFocusEffect } from "@react-navigation/native";
import { db, doc, onSnapshot } from "./Config";

const BalanceCircle = ({ userId }) => {
  const [inAmount, setInAmount] = useState(0);
  const [outAmount, setOutAmount] = useState(0);
  const [inData, setInData] = useState([]);
  const [outData, setOutData] = useState([]);

  const fetchData = useCallback(() => {
    if (userId) {
      const userRef = doc(db, "users", userId);

      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          const transactions = userData.history || [];

          let totalInAmount = 0;
          let totalOutAmount = 0;
          let inDataMap = new Map();
          let outDataMap = new Map();

          transactions.forEach((transaction) => {
            if (transaction.type === "IN") {
              totalInAmount += transaction.amount;
              inDataMap.set(
                transaction.reason,
                (inDataMap.get(transaction.reason) || 0) + transaction.amount
              );
            } else if (transaction.type === "OUT") {
              totalOutAmount += transaction.amount;
              outDataMap.set(
                transaction.reason,
                (outDataMap.get(transaction.reason) || 0) + transaction.amount
              );
            }
          });

          setInAmount(totalInAmount);
          setOutAmount(totalOutAmount);
          setInData(Array.from(inDataMap.entries()));
          setOutData(Array.from(outDataMap.entries()));
        }
      });

      return () => unsubscribe();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const widthAndHeight = 150;

  const totalAmount = inAmount + outAmount;

  const balanceSeries = totalAmount > 0 ? [inAmount, outAmount] : [];
  const balanceSliceColor = totalAmount > 0 ? ["#86Dc3D", "red"] : [];

  const inSeries = inData.map(([reason, amount]) => amount);
  const inTotal = inSeries.reduce((a, b) => a + b, 0);
  const inSliceColor = inData.map(
    (_, index) => `hsl(${(index * 360) / inData.length}, 70%, 50%)`
  );

  const outSeries = outData.map(([reason, amount]) => amount);
  const outTotal = outSeries.reduce((a, b) => a + b, 0);
  const outSliceColor = outData.map(
    (_, index) => `hsl(${(index * 360) / outData.length}, 70%, 50%)`
  );

  const hasBalanceData =
    balanceSeries.length > 0 && balanceSeries.some((value) => value > 0);
  const hasInData = inSeries.length > 0 && inSeries.some((value) => value > 0);
  const hasOutData =
    outSeries.length > 0 && outSeries.some((value) => value > 0);

  return (
    <View style={styles.container}>
      {/* Balance Doughnut Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Total Balance</Text>
        {hasBalanceData ? (
          <PieChart
            widthAndHeight={widthAndHeight}
            series={balanceSeries}
            sliceColor={balanceSliceColor}
            coverRadius={0.75}
            coverFill={"black"}
          />
        ) : (
          <Text style={styles.placeholderText}>No Balance Data Available</Text>
        )}
      </View>

      {/* IN Amount Doughnut Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>IN Amounts</Text>
        {hasInData ? (
          <PieChart
            widthAndHeight={widthAndHeight}
            series={inSeries}
            sliceColor={inSliceColor}
            coverRadius={0.75}
            coverFill={"black"}
          />
        ) : (
          <Text style={styles.placeholderText}>
            No IN Amount Data Available
          </Text>
        )}
        <View style={styles.legend}>
          {inData.map(([reason, amount], index) => {
            const percentage = ((amount / inTotal) * 100).toFixed(2);
            return (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.colorBox,
                    { backgroundColor: inSliceColor[index] },
                  ]}
                />
                <Text style={styles.legendText}>
                  {reason}: {amount} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* OUT Amount Doughnut Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>OUT Amounts</Text>
        {hasOutData ? (
          <PieChart
            widthAndHeight={widthAndHeight}
            series={outSeries}
            sliceColor={outSliceColor}
            coverRadius={0.75}
            coverFill={"black"}
          />
        ) : (
          <Text style={styles.placeholderText}>
            No OUT Amount Data Available
          </Text>
        )}
        <View style={styles.legend}>
          {outData.map(([reason, amount], index) => {
            const percentage = ((amount / outTotal) * 100).toFixed(2);
            return (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.colorBox,
                    { backgroundColor: outSliceColor[index] },
                  ]}
                />
                <Text style={styles.legendText}>
                  {reason}: {amount} ({percentage}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chartTitle: {
    color: "#FFF5EE",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  placeholderText: {
    color: "#FFF5EE",
    fontSize: 14,
    fontStyle: "italic",
  },
  legend: {
    marginTop: 10,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  colorBox: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  legendText: {
    color: "#FFF5EE",
    fontSize: 14,
  },
});

export default BalanceCircle;
