import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./components/BottomNav";

const CookBook = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [savedRecipes, setSavedRecipes] = useState([]);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                setUser(null);
                return;
            }

            const response = await axios.get("http://127.0.0.1:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(response.data.user);
            setSavedRecipes(response.data.saved_recipes || []);
        } catch (error) {
            console.error("Error fetching user:", error);
            if (error.response?.status === 401) {
                // Token is invalid or expired
                await AsyncStorage.removeItem("token");
                Alert.alert("Session Expired", "Please log in again", [
                    { text: "OK", onPress: () => navigation.navigate("Auth") }
                ]);
            } else {
                Alert.alert(
                    "Error",
                    "Failed to fetch user data. Please try again."
                );
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleSignUp = () => {
        navigation.navigate("Auth");
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
                <ActivityIndicator size="large" color="#E25822" />
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.content}>
                        <MaterialIcons
                            name="menu-book"
                            size={80}
                            color="#E25822"
                            style={styles.icon}
                        />
                        <Text style={styles.title}>Your Cookbook</Text>
                        <Text style={styles.subtitle}>
                            Sign up or log in to save and organize your favorite
                            recipes
                        </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSignUp}
                        >
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <BottomNav />
            </SafeAreaView>
        );
    }

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
                    <Text style={styles.headerTitle}>CookBook</Text>
                    <View style={styles.headerRightPlaceholder} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#E25822"]}
                            tintColor="#E25822"
                        />
                    }
                >
                    <View style={styles.header}>
                        {user.profile_picture ? (
                            <Image
                                source={{ uri: user.profile_picture }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <MaterialIcons
                                    name="account-circle"
                                    size={80}
                                    color="#E25822"
                                />
                            </View>
                        )}
                        <Text style={styles.welcomeText}>
                            Welcome, {user.username}!
                        </Text>
                    </View>

                    <View style={styles.savedRecipesContainer}>
                        <Text style={styles.sectionTitle}>
                            Your Saved Recipes
                        </Text>

                        {savedRecipes.length > 0 ? (
                            savedRecipes.map(recipe => (
                                <TouchableOpacity
                                    key={recipe.id}
                                    style={styles.recipeCard}
                                    onPress={() =>
                                        navigation.navigate("RecipeDetail", {
                                            recipe
                                        })
                                    }
                                >
                                    <Image
                                        source={{ uri: recipe.image }}
                                        style={styles.recipeImage}
                                    />
                                    <View style={styles.recipeInfo}>
                                        <Text style={styles.recipeTitle}>
                                            {recipe.title}
                                        </Text>
                                        <Text style={styles.recipeCategory}>
                                            {recipe.category}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialIcons
                                    name="bookmark-border"
                                    size={50}
                                    color="#E25822"
                                />
                                <Text style={styles.emptyStateText}>
                                    No saved recipes yet
                                </Text>
                                <TouchableOpacity
                                    style={styles.exploreButton}
                                    onPress={() =>
                                        navigation.navigate("SearchRecipe")
                                    }
                                >
                                    <Text style={styles.exploreButtonText}>
                                        Explore Recipes
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
                <BottomNav />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
        marginTop: 20
    },
    container: {
        flex: 1
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
        borderBottomColor: "#f0f0f0"
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
        flexGrow: 1,
        paddingBottom: 80
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    icon: {
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontFamily: "Galindo-Regular",
        color: "#E25822",
        marginBottom: 10,
        textAlign: "center"
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        paddingHorizontal: 20,
        lineHeight: 24
    },
    button: {
        backgroundColor: "#E25822",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30
    },
    buttonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 18
    },
    header: {
        alignItems: "center",
        paddingVertical: 20
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15
    },
    profilePlaceholder: {
        marginBottom: 15
    },
    welcomeText: {
        fontSize: 20,
        fontFamily: "Galindo-Regular",
        color: "#333",
        marginBottom: 5
    },
    savedRecipesContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        paddingBottom: 20
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: "Galindo-Regular",
        color: "#E25822",
        marginBottom: 20
    },
    recipeCard: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        marginBottom: 15,
        overflow: "hidden"
    },
    recipeImage: {
        width: 100,
        height: 100
    },
    recipeInfo: {
        flex: 1,
        padding: 15,
        justifyContent: "center"
    },
    recipeTitle: {
        fontSize: 16,
        fontFamily: "Galindo-Regular",
        color: "#333",
        marginBottom: 5
    },
    recipeCategory: {
        fontSize: 14,
        fontFamily: "Outfit-Variable",
        color: "#666"
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#666",
        marginTop: 10,
        marginBottom: 20
    },
    exploreButton: {
        backgroundColor: "#E25822",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25
    },
    exploreButtonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 16
    }
});

export default CookBook;
