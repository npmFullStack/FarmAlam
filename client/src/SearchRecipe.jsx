import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SearchRecipe = () => {
  return (
    <View style={styles.container}>
      <Text>SearchRecipe</Text>
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

export default SearchRecipe;
