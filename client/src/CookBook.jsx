import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CookBook = () => {
  return (
    <View style={styles.container}>
      <Text>CookBook</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default CookBook;
