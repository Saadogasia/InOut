import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, doc, getDoc } from "./Config";
import { useFocusEffect } from "@react-navigation/native";

const generateVibrantColor = () => {
  const getRandomInt = (max) => Math.floor(Math.random() * max);
  const r = getRandomInt(200) + 55;
  const g = getRandomInt(200) + 55;
  const b = getRandomInt(200) + 55;
  return `rgb(${r}, ${g}, ${b})`;
};

const BalanceCircle = ({ userId }) => {
  const [inAmount, setInAmount] = useState(0);
  const [outAmount, setOutAmount] = useState(0);
  const [inData, setInData] = useState([]);
  const [outData, setOutData] = useState([]);
  const [colorMap, setColorMap] = useState({});

  const fetchHistory = async () => {
    try {
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
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

          // Fetch or generate colors
          const storedColorMap = await AsyncStorage.getItem(
            `colorMap_${userId}`
          );
          if (storedColorMap) {
            setColorMap(JSON.parse(storedColorMap));
          } else {
            setColorMap({});
          }
        }
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const updateColors = async () => {
    if (userId) {
      const newColorMap = { ...colorMap };

      inData.forEach(([reason]) => {
        if (!newColorMap[reason]) {
          newColorMap[reason] = generateVibrantColor();
        }
      });

      outData.forEach(([reason]) => {
        if (!newColorMap[reason]) {
          newColorMap[reason] = generateVibrantColor();
        }
      });

      await AsyncStorage.setItem(
        `colorMap_${userId}`,
        JSON.stringify(newColorMap)
      );
      setColorMap(newColorMap);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchHistory();
    }, [userId])
  );

  useEffect(() => {
    updateColors();
  }, [inData, outData, userId]);

  const widthAndHeight = 150;

  const totalAmount = inAmount + outAmount;

  const balanceSeries = totalAmount > 0 ? [inAmount, outAmount] : [];
  const balanceSliceColor = totalAmount > 0 ? ["#86Dc3D", "red"] : [];

  const inSeries = inData.map(([reason, amount]) => amount);
  const inSliceColor = inSeries.map(
    (_, index) => colorMap[inData[index][0]] || "#FFFFFF"
  );

  const outSeries = outData.map(([reason, amount]) => amount);
  const outSliceColor = outSeries.map(
    (_, index) => colorMap[outData[index][0]] || "#FFFFFF"
  );

  const hasBalanceData =
    balanceSeries.length > 0 && balanceSeries.some((value) => value > 0);
  const hasInData = inSeries.length > 0 && inSeries.some((value) => value > 0);
  const hasOutData =
    outSeries.length > 0 && outSeries.some((value) => value > 0);

  return (
    <View style={styles.container}>
      {/* Total Balance Doughnut Chart */}
      <View style={styles.totalChartContainer}>
        <Text style={styles.chartTitle}>Balance</Text>

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
      <View style={styles.balanceLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSquare, { backgroundColor: "#86Dc3D" }]} />
          <Text style={[styles.legendText]}>IN</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSquare, { backgroundColor: "red" }]} />
          <Text style={[styles.legendText]}>OUT</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  totalChartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  bottomChartsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  bottomLeftChartContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },
  bottomRightChartContainer: {
    flex: 1,
    alignItems: "center",
    marginLeft: 10,
  },
  chartTitle: {
    color: "#FFF5EE",
    fontFamily: "poppinsbold",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  placeholderText: {
    color: "#FFF5EE",
    fontSize: 14,
    fontStyle: "italic",
  },
  balanceLegend: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  legendSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    color: "#FFF5EE",
    fontSize: 14,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginRight: 8,
  },
  legend: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

export default BalanceCircle;
