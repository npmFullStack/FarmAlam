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
    SafeAreaView,
    FlatList,
    Platform
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
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

            const [userResponse, savedResponse] = await Promise.all([
                axios.get("http://127.0.0.1:8000/api/user", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("http://127.0.0.1:8000/api/cookbook", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setUser(userResponse.data.user);
            setSavedRecipes(savedResponse.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response?.status === 401) {
                await AsyncStorage.removeItem("token");
                Alert.alert("Session Expired", "Please log in again", [
                    { text: "OK", onPress: () => navigation.navigate("Auth") }
                ]);
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

    const renderStars = rating => {
        const safeRating = rating || 0;
        return [1, 2, 3, 4, 5].map(star => (
            <FontAwesome
                key={star}
                name={star <= safeRating ? "star" : "star-o"}
                size={12}
                color="#FFD700"
            />
        ));
    };

    const renderRecipeCard = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.recipeCard}
                onPress={() =>
                    navigation.navigate("RecipeDetail", {
                        recipeId: item.id
                    })
                }
            >
                <View style={styles.cardImageContainer}>
                    {item.image ? (
                        <Image
                            source={{
                                uri: `http://127.0.0.1:8000/storage/${item.image}`
                            }}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.cardImagePlaceholder}>
                            <MaterialIcons
                                name="no-food"
                                size={40}
                                color="#ccc"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.cardContent}>
                    <Text style={styles.recipeName} numberOfLines={1}>
                        {item.name}
                    </Text>

                    <View style={styles.recipeCategoryContainer}>
                        <Text style={styles.recipeCategory}>
                            {item.category.charAt(0).toUpperCase() +
                                item.category.slice(1)}
                        </Text>
                    </View>

                    <View style={styles.timeRow}>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={12}
                                color="#666"
                            />
                            <Text style={styles.timeText}>
                                Prep: {item.prep_time}m
                            </Text>
                        </View>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={12}
                                color="#666"
                            />
                            <Text style={styles.timeText}>
                                Cook: {item.cook_time}m
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bottomRow}>
                        <View style={styles.userInfo}>
                            {item.user?.profile_picture ? (
                                <Image
                                    source={{
                                        uri: `http://127.0.0.1:8000/storage/${item.user.profile_picture}`
                                    }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <Image
                                    source={require("../assets/images/default_profile.png")}
                                    style={styles.profileImage}
                                />
                            )}
                            <Text style={styles.usernameText}>
                                {item.user?.username || "unknown"}
                            </Text>
                        </View>

                        <View style={styles.ratingContainer}>
                            {renderStars(Math.round(item.average_rating || 0))}
                            <Text style={styles.ratingText}>
                                {(item.average_rating || 0).toFixed(1)}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
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
                    <Text style={styles.headerTitle}>Search Recipe</Text>
                    <View style={styles.headerRightPlaceholder} />
                </View>

                <FlatList
                    data={savedRecipes}
                    renderItem={renderRecipeCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#E25822"]}
                            tintColor="#E25822"
                        />
                    }
                    ListEmptyComponent={
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
                    }
                />
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
    listContent: {
        paddingBottom: 20
    },
    recipeCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginHorizontal: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    cardImageContainer: {
        height: 180,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        overflow: "hidden"
    },
    cardImage: {
        width: "100%",
        height: "100%"
    },
    cardImagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center"
    },
    cardContent: {
        padding: 15
    },
    recipeName: {
        fontSize: 18,
        fontFamily: "Galindo-Regular",
        color: "#333",
        marginBottom: 8
    },
    recipeCategoryContainer: {
        backgroundColor: "#E25822",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        alignSelf: "flex-start",
        marginBottom: 10
    },
    recipeCategory: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#fff"
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    timeItem: {
        flexDirection: "row",
        alignItems: "center"
    },
    timeText: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#666",
        marginLeft: 5
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center"
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8
    },
    usernameText: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#666"
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    ratingText: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#666",
        marginLeft: 5
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
        paddingHorizontal: 20
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#666",
        marginTop: 10,
        marginBottom: 20,
        textAlign: "center"
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
