import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AuthTopNav = ({ activeTab, onTabChange }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "signup" && styles.activeTab]}
                onPress={() => onTabChange("signup")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "signup" && styles.activeTabText
                    ]}
                >
                    Signup
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === "login" && styles.activeTab]}
                onPress={() => onTabChange("login")}
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "login" && styles.activeTabText
                    ]}
                >
                    Login
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        marginTop: 20
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#E25822"
    },
    tabText: {
        fontFamily: "Galindo-Regular",
        fontSize: 16,
        color: "#666"
    },
    activeTabText: {
        color: "#E25822"
    }
});

export default AuthTopNav;
