import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const BottomNav = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.tab}
                onPress={() => navigation.navigate("CookBook")}
            >
                <MaterialIcons name="menu-book" size={24} color="#E25822" />
                <Text style={styles.tabText}>CookBook</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => navigation.navigate("SearchRecipe")}
            >
                <MaterialIcons name="search" size={24} color="#E25822" />
                <Text style={styles.tabText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tab}
                onPress={() => navigation.navigate("Account")}
            >
                <MaterialIcons
                    name="account-circle"
                    size={24}
                    color="#E25822"
                />
                <Text style={styles.tabText}>Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingVertical: 5,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    tab: {
        alignItems: "center",
        paddingVertical: 10
    },
    tabText: {
        fontSize: 12,
        marginTop: 5,
        fontFamily: "Outfit-Variable",
        color: "#E25822"
    }
});

export default BottomNav;
