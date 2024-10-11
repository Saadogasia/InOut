// Welcome.js
import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Image source={require("./assets/io.png")} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "black",
  },
  image: {
    width: 500,
    height: 500,
  },
});
