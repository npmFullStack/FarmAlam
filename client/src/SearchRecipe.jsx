import React from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import BottomNav from "./components/BottomNav";
import { useNavigation } from "@react-navigation/native";

const SearchRecipe = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                <View style={styles.topHeader}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color="#E25822"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Search Recipe</Text>
                    <View style={styles.headerRightPlaceholder} />
                </View>

                {/* Your main content here */}
                <View style={styles.content}>
                    <Text>Search content goes here</Text>
                </View>

                {/* Floating Add Button */}
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => navigation.navigate("AddRecipe")}
                >
                    <MaterialIcons name="add" size={28} color="white" />
                </TouchableOpacity>

                {/* Bottom Navigation */}
                <BottomNav />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff"
    },
    container: {
        flex: 1,
        position: "relative"
    },
    content: {
        flex: 1,
        padding: 15
    },
    topHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        marginTop: Platform.OS === "android" ? 20 : 0
    },
    backButton: {
        padding: 5
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: "Galindo-Regular",
        color: "#E25822"
    },
    headerRightPlaceholder: {
        width: 24
    },
    floatingButton: {
        position: "absolute",
        bottom: 150, // Adjust this based on your BottomNav height
        right: 30,
        backgroundColor: "#E25822",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 10
    }
});

export default SearchRecipe;
