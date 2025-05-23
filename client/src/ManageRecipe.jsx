import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Alert
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./components/BottomNav";
import { Menu, Provider } from "react-native-paper";

const ManageRecipe = () => {
    const navigation = useNavigation();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [visibleMenuId, setVisibleMenuId] = useState(null);

    const fetchUserRecipes = async () => {
    try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(
            "http://127.0.0.1:8000/api/user/recipes",  // Changed endpoint
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );
        setRecipes(response.data);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        Alert.alert("Error", "Failed to fetch your recipes.");
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};

    useEffect(() => {
        fetchUserRecipes();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUserRecipes();
    };

    const deleteRecipe = async recipeId => {
        try {
            const token = await AsyncStorage.getItem("token");
            await axios.delete(
                `http://127.0.0.1:8000/api/recipes/${recipeId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            Alert.alert("Success", "Recipe deleted successfully");
            fetchUserRecipes(); // Refresh the list
        } catch (error) {
            console.error("Error deleting recipe:", error);
            Alert.alert("Error", "Failed to delete recipe.");
        }
    };

    const confirmDelete = recipeId => {
        Alert.alert(
            "Confirm Delete",
            "Are you sure you want to delete this recipe?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => deleteRecipe(recipeId) }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.recipeRow}>
            {item.image ? (
                <Image
                    source={{
                        uri: `http://127.0.0.1:8000/storage/${item.image}`
                    }}
                    style={styles.recipeImage}
                />
            ) : (
                <View style={[styles.recipeImage, styles.imagePlaceholder]}>
                    <MaterialIcons name="no-food" size={24} color="#ccc" />
                </View>
            )}

            <View style={styles.recipeInfo}>
                <Text style={styles.recipeName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.recipeCategory}>
                    {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                </Text>
            </View>

            <Menu
                visible={visibleMenuId === item.id}
                onDismiss={() => setVisibleMenuId(null)}
                anchor={
                    <TouchableOpacity
                        onPress={() => setVisibleMenuId(item.id)}
                        style={styles.menuButton}
                    >
                        <MaterialIcons
                            name="more-vert"
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                }
                contentStyle={styles.menuContent}
            >
                <Menu.Item
                    onPress={() => {
                        setVisibleMenuId(null);
                        navigation.navigate("RecipeDetail", {
                            recipeId: item.id
                        });
                    }}
                    title="View"
                    titleStyle={styles.menuItemText}
                />
                <Menu.Item
                    onPress={() => {
                        setVisibleMenuId(null);
                        navigation.navigate("UpdateRecipe", { recipe: item });
                    }}
                    title="Update"
                    titleStyle={styles.menuItemText}
                />
                <Menu.Item
                    onPress={() => {
                        setVisibleMenuId(null);
                        confirmDelete(item.id);
                    }}
                    title="Delete"
                    titleStyle={[styles.menuItemText, styles.deleteText]}
                />
            </Menu>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
                <ActivityIndicator size="large" color="#E25822" />
            </SafeAreaView>
        );
    }

    return (
        <Provider>
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
                        <Text style={styles.headerTitle}>Manage Recipes</Text>
                        <View style={styles.headerRightPlaceholder} />
                    </View>

                    <FlatList
                        data={recipes}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MaterialIcons
                                    name="no-food"
                                    size={50}
                                    color="#E25822"
                                />
                                <Text style={styles.emptyText}>
                                    No recipes found. Create your first recipe!
                                </Text>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() =>
                                        navigation.navigate("AddRecipe")
                                    }
                                >
                                    <Text style={styles.addButtonText}>
                                        Add Recipe
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                </View>
                <BottomNav />
            </SafeAreaView>
        </Provider>
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
    listContent: {
        flexGrow: 1,
        paddingBottom: 80
    },
    recipeRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    recipeImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 15
    },
    imagePlaceholder: {
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center"
    },
    recipeInfo: {
        flex: 1
    },
    recipeName: {
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
    menuButton: {
        padding: 5
    },
    menuContent: {
        backgroundColor: "#fff",
        borderRadius: 8,
        elevation: 3
    },
    menuItemText: {
        fontFamily: "Outfit-Variable",
        fontSize: 14,
        color: "#333"
    },
    deleteText: {
        color: "#ff4444"
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    emptyText: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#666",
        textAlign: "center",
        marginVertical: 15
    },
    addButton: {
        backgroundColor: "#E25822",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25
    },
    addButtonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 16
    }
});

export default ManageRecipe;
