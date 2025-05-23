import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ScrollView,
    Platform,
    ActivityIndicator,
    Alert,
    Button
} from "react-native";
import {
    MaterialIcons,
    Ionicons,
    Feather,
    FontAwesome
} from "@expo/vector-icons";
import BottomNav from "./components/BottomNav";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Account = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                await fetchUserData();
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data.user);
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Failed to load user data");
        }
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel"
            },
            {
                text: "Logout",
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("token");
                        await axios.post(
                            "http://127.0.0.1:8000/api/logout",
                            {},
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        );
                        await AsyncStorage.removeItem("token");
                        setIsLoggedIn(false);
                        setUser(null);
                    } catch (error) {
                        console.error("Error logging out:", error);
                        Alert.alert(
                            "Error",
                            "Failed to logout. Please try again."
                        );
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E25822" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                {/* Top Header */}
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
                    <Text style={styles.headerTitle}>My Account</Text>
                    <View style={styles.headerRightPlaceholder} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {isLoggedIn ? (
                        <>
                            {/* User Profile Section */}
                            <View style={styles.profileContainer}>
                                <View style={styles.avatarContainer}>
                                    {user?.profile_picture ? (
                                        <Image
                                            source={{
                                                uri: `http://127.0.0.1:8000/storage/${user.profile_picture}`
                                            }}
                                            style={styles.avatar}
                                        />
                                    ) : (
                                        <Image
                                            source={require("../assets/images/default_profile.png")}
                                            style={styles.avatar}
                                        />
                                    )}
                                </View>
                                <Text style={styles.username}>
                                    @{user?.username || "username"}
                                </Text>
                                <Text style={styles.name}>
                                    {user?.first_name} {user?.last_name}
                                </Text>
                                <Text style={styles.email}>{user?.email}</Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() =>
                                        navigation.navigate("ManageProfile")
                                    }
                                >
                                    <View style={styles.buttonContent}>
                                        <MaterialIcons
                                            name="person-outline"
                                            size={24}
                                            color="#E25822"
                                        />
                                        <Text style={styles.buttonText}>
                                            Update Profile
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() =>
                                        navigation.navigate("ManageRecipe")
                                    }
                                >
                                    <View style={styles.buttonContent}>
                                        <MaterialIcons
                                            name="restaurant-menu"
                                            size={24}
                                            color="#E25822"
                                        />
                                        <Text style={styles.buttonText}>
                                            Manage Recipes
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        styles.logoutButton
                                    ]}
                                    onPress={handleLogout}
                                >
                                    <View style={styles.buttonContent}>
                                        <MaterialIcons
                                            name="logout"
                                            size={24}
                                            color="#FF3B30"
                                        />
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                styles.logoutText
                                            ]}
                                        >
                                            Logout
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.guestContainer}>
                            <Image
                                source={require("../assets/images/default_profile.png")}
                                style={styles.guestAvatar}
                            />
                            <Text style={styles.guestName}>Guest</Text>
                            <Text style={styles.guestMessage}>
                                Join our community to save your recipes and
                                preferences!
                            </Text>
                            <TouchableOpacity
                                style={styles.signupButton}
                                onPress={() => navigation.navigate("Auth")}
                            >
                                <Text style={styles.signupButtonText}>
                                    Sign Up Now
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
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

    scrollContainer: {
        paddingBottom: 80,
        flexGrow: 1
    },
    profileContainer: {
        alignItems: "center",
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    avatarContainer: {
        marginBottom: 15
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "#E25822"
    },
    username: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        fontFamily: "Outfit-Variable"
    },
    name: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
        fontFamily: "Outfit-Variable"
    },
    email: {
        fontSize: 14,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    actionsContainer: {
        paddingHorizontal: 20,
        paddingTop: 20
    },
    actionButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center"
    },
    buttonText: {
        fontSize: 16,
        marginLeft: 15,
        color: "#333",
        fontFamily: "Outfit-Variable"
    },
    logoutButton: {
        marginTop: 10,
        borderBottomWidth: 0
    },
    logoutText: {
        color: "#FF3B30"
    },
    guestContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    guestAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20
    },
    guestName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        fontFamily: "Galindo-Regular"
    },
    guestMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
        color: "#666",
        fontFamily: "Outfit-Variable",
        paddingHorizontal: 40
    },
    signupButton: {
        backgroundColor: "#E25822",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: "80%"
    },
    signupButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: "Outfit-Variable"
    }
});

export default Account;
