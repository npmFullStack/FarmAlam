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
    Platform,
    Modal
} from "react-native";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";
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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

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

    const handleDeleteRecipe = async recipeId => {
        try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(
                `http://127.0.0.1:8000/api/cookbook/${recipeId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSavedRecipes(prev =>
                prev.filter(recipe => recipe.id !== recipeId)
            );
            setShowDeleteModal(false);
            setSelectedRecipe(null);
        } catch (error) {
            console.error("Error deleting recipe:", error);
            Alert.alert("Error", "Failed to remove recipe from cookbook");
        }
    };

    const confirmDelete = recipe => {
        setSelectedRecipe(recipe);
        setShowDeleteModal(true);
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
            <View style={styles.recipeCard}>
                {/* Left side - Image */}
                <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() =>
                        navigation.navigate("RecipeDetail", {
                            recipeId: item.id
                        })
                    }
                >
                    {item.image ? (
                        <Image
                            source={{
                                uri: `http://127.0.0.1:8000/storage/${item.image}`
                            }}
                            style={styles.recipeImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <MaterialIcons
                                name="no-food"
                                size={32}
                                color="#ccc"
                            />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Right side - Details */}
                <TouchableOpacity
                    style={styles.detailsContainer}
                    onPress={() =>
                        navigation.navigate("RecipeDetail", {
                            recipeId: item.id
                        })
                    }
                >
                    <View style={styles.headerRow}>
                        <Text style={styles.recipeName} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => confirmDelete(item)}
                        >
                            <Entypo
                                name="dots-three-horizontal"
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.categoryContainer}>
                        <Text style={styles.categoryTag}>
                            {item.category.charAt(0).toUpperCase() +
                                item.category.slice(1)}
                        </Text>
                    </View>

                    <View style={styles.timeContainer}>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={14}
                                color="#E25822"
                            />
                            <Text style={styles.timeText}>
                                {item.prep_time}m prep
                            </Text>
                        </View>
                        <View style={styles.timeDivider} />
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="local-fire-department"
                                size={14}
                                color="#E25822"
                            />
                            <Text style={styles.timeText}>
                                {item.cook_time}m cook
                            </Text>
                        </View>
                    </View>

                    <View style={styles.bottomSection}>
                        <View style={styles.authorInfo}>
                            {item.user?.profile_picture ? (
                                <Image
                                    source={{
                                        uri: `http://127.0.0.1:8000/storage/${item.user.profile_picture}`
                                    }}
                                    style={styles.authorImage}
                                />
                            ) : (
                                <Image
                                    source={require("../assets/images/default_profile.png")}
                                    style={styles.authorImage}
                                />
                            )}
                            <Text style={styles.authorName}>
                                {item.user?.username || "unknown"}
                            </Text>
                        </View>

                        <View style={styles.ratingSection}>
                            <View style={styles.starsContainer}>
                                {renderStars(
                                    Math.round(item.average_rating || 0)
                                )}
                            </View>
                            <Text style={styles.ratingValue}>
                                {(item.average_rating || 0).toFixed(1)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
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
                    <Text style={styles.headerTitle}>My CookBook</Text>
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
                    <Text style={styles.headerTitle}>My CookBook</Text>
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

                {/* Delete Confirmation Modal */}
                <Modal
                    visible={showDeleteModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDeleteModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Remove Recipe</Text>
                            <Text style={styles.modalMessage}>
                                Are you sure you want to remove "
                                {selectedRecipe?.name}" from your cookbook?
                            </Text>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowDeleteModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() =>
                                        handleDeleteRecipe(selectedRecipe?.id)
                                    }
                                >
                                    <Text style={styles.deleteButtonText}>
                                        Remove
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <BottomNav />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8f9fa"
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        marginTop: Platform.OS === "android" ? 20 : 0
    },

    headerTitle: {
        fontSize: 20,
        fontFamily: "Galindo-Regular",
        color: "#E25822"
    },
    headerRightPlaceholder: {
        width: 40
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
        borderRadius: 30,
        shadowColor: "#E25822",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    buttonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 18
    },
    listContent: {
        paddingBottom: 100,
        paddingTop: 8
    },
    recipeCard: {
      height: 150,
        backgroundColor: "#fff",
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        flexDirection: "row",
        overflow: "hidden"
    },
    imageContainer: {
        width: 120,
        height: "100%"
    },
    recipeImage: {
        width: "100%",
        height: "100%"
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center"
    },
    detailsContainer: {
        flex: 1,
        padding: 16,
        justifyContent: "space-between"
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8
    },
    recipeName: {
        fontSize: 16,
        fontFamily: "Galindo-Regular",
        color: "#2d3748",
        flex: 1,
        marginRight: 8,
        lineHeight: 20
    },
    menuButton: {
        padding: 4,
        borderRadius: 12,
        backgroundColor: "#f7fafc"
    },
    categoryContainer: {
        marginBottom: 12
    },
    categoryTag: {
        fontSize: 11,
        fontFamily: "Outfit-Variable",
        color: "#E25822",
        backgroundColor: "#fff2ef",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        fontWeight: "600"
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12
    },
    timeItem: {
        flexDirection: "row",
        alignItems: "center"
    },
    timeText: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#4a5568",
        marginLeft: 4,
        fontWeight: "500"
    },
    timeDivider: {
        width: 1,
        height: 14,
        backgroundColor: "#e2e8f0",
        marginHorizontal: 12
    },
    bottomSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    authorInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    authorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8
    },
    authorName: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#718096",
        fontWeight: "500"
    },
    ratingSection: {
        flexDirection: "row",
        alignItems: "center"
    },
    starsContainer: {
        flexDirection: "row",
        marginRight: 6
    },
    ratingValue: {
        fontSize: 12,
        fontFamily: "Outfit-Variable",
        color: "#4a5568",
        fontWeight: "600"
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 20
    },
    emptyStateText: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#666",
        marginTop: 16,
        marginBottom: 24,
        textAlign: "center"
    },
    exploreButton: {
        backgroundColor: "#E25822",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        shadowColor: "#E25822",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    exploreButtonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 16
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "Galindo-Regular",
        color: "#2d3748",
        marginBottom: 12,
        textAlign: "center"
    },
    modalMessage: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#4a5568",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: "#f7fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0"
    },
    cancelButtonText: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#4a5568",
        textAlign: "center",
        fontWeight: "600"
    },
    deleteButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: "#e53e3e"
    },
    deleteButtonText: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#fff",
        textAlign: "center",
        fontWeight: "600"
    }
});

export default CookBook;
