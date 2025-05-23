import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Platform,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
    FlatList
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import BottomNav from "./components/BottomNav";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchRecipe = () => {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("latest");
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [savedRecipes, setSavedRecipes] = useState([]);

    const categories = [
        "all",
        "appetizer",
        "main course",
        "dessert",
        "salad",
        "soup",
        "side dish",
        "breakfast",
        "beverage"
    ];

    // Fetch recipes from API
    const fetchRecipes = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Get saved recipes from AsyncStorage first
            const savedFromStorage = await AsyncStorage.getItem("savedRecipes");
            const localSavedRecipes = savedFromStorage
                ? JSON.parse(savedFromStorage)
                : [];

            const response = await axios.get(
                "http://127.0.0.1:8000/api/recipes",
                { headers }
            );

            const recipesWithRatings = response.data.map(recipe => ({
                ...recipe,
                ratings_avg_rating: recipe.ratings_avg_rating || 0,
                // Merge is_saved from API with local storage
                is_saved:
                    recipe.is_saved || localSavedRecipes.includes(recipe.id)
            }));

            setRecipes(recipesWithRatings);
            setFilteredRecipes(recipesWithRatings);

            // Combine saved recipes from API and local storage
            const apiSavedIds = response.data
                .filter(recipe => recipe.is_saved)
                .map(recipe => recipe.id);

            const combinedSavedRecipes = [
                ...new Set([...apiSavedIds, ...localSavedRecipes])
            ];
            setSavedRecipes(combinedSavedRecipes);

            // Update AsyncStorage with the combined list
            await AsyncStorage.setItem(
                "savedRecipes",
                JSON.stringify(combinedSavedRecipes)
            );
        } catch (error) {
            console.error("Error fetching data:", error);
            Alert.alert("Error", "Failed to fetch recipes. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    // Load saved recipes from AsyncStorage on component mount
    useEffect(() => {
        fetchRecipes();
    }, []);
    // Toggle recipe save status
    const toggleSaveRecipe = async recipeId => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert("Login Required", "Please login to save recipes.");
                navigation.navigate("Auth");
                return;
            }

            const isCurrentlySaved = savedRecipes.includes(recipeId);
            let newSavedRecipes;

            if (isCurrentlySaved) {
                await axios.delete(
                    `http://127.0.0.1:8000/api/cookbook/${recipeId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                newSavedRecipes = savedRecipes.filter(id => id !== recipeId);
            } else {
                await axios.post(
                    "http://127.0.0.1:8000/api/cookbook",
                    { recipe_id: recipeId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                newSavedRecipes = [...savedRecipes, recipeId];
            }

            // Update state and storage
            setSavedRecipes(newSavedRecipes);
            await AsyncStorage.setItem(
                "savedRecipes",
                JSON.stringify(newSavedRecipes)
            );

            // Update recipes data
            setRecipes(prevRecipes =>
                prevRecipes.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, is_saved: !isCurrentlySaved }
                        : recipe
                )
            );
            setFilteredRecipes(prevRecipes =>
                prevRecipes.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, is_saved: !isCurrentlySaved }
                        : recipe
                )
            );
        } catch (error) {
            console.error("Error toggling save:", error);
            Alert.alert(
                "Error",
                "Failed to update cookbook. Please try again."
            );
        }
    };

    // Filter recipes based on search query and category
    const filterRecipes = () => {
        let results = [...recipes];

        // Apply search filter
        if (searchQuery) {
            results = results.filter(recipe =>
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory && selectedCategory !== "all") {
            results = results.filter(
                recipe => recipe.category === selectedCategory
            );
        }

        // Apply tab filter
        if (activeTab === "popular") {
            results.sort((a, b) => {
                const ratingA = a.ratings_avg_rating || 0;
                const ratingB = b.ratings_avg_rating || 0;
                return ratingB - ratingA;
            });
        } else {
            results.sort((a, b) => b.id - a.id);
        }

        setFilteredRecipes(results);
    };

    // Handle search and filter changes
    useEffect(() => {
        filterRecipes();
    }, [searchQuery, selectedCategory, activeTab, recipes]);

    // Initial fetch
    useEffect(() => {
        fetchRecipes();
    }, []);

    // Handle refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchRecipes();
    };

    // Render star rating
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

    // Get category background color
    const getCategoryColor = category => {
        const colors = {
            appetizer: "#FF9A76",
            "main course": "#FF6B6B",
            dessert: "#FFB677",
            salad: "#A8E6CF",
            soup: "#6EC6CA",
            "side dish": "#FFD3B6",
            breakfast: "#FFAAA5",
            beverage: "#DCEDC1"
        };
        return colors[category] || "#E25822";
    };

    // Render recipe card
    const renderRecipeCard = ({ item }) => {
        const averageRating = item.ratings_avg_rating || 0;
        const displayRating =
            typeof averageRating === "number"
                ? averageRating.toFixed(1)
                : "0.0";
        const roundedRating = Math.round(averageRating);
        const isSaved = savedRecipes.includes(item.id) || item.is_saved;

        return (
            <TouchableOpacity
                style={styles.recipeCard}
                onPress={() =>
                    navigation.navigate("RecipeDetail", { recipeId: item.id })
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

                    <TouchableOpacity
                        style={styles.bookmarkButton}
                        onPress={e => {
                            e.stopPropagation();
                            toggleSaveRecipe(item.id);
                        }}
                    >
                        <MaterialIcons
                            name={isSaved ? "bookmark" : "bookmark-border"}
                            size={24}
                            color={isSaved ? "#E25822" : "#ddd"}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.recipeName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View
                        style={[
                            styles.recipeCategoryContainer,
                            { backgroundColor: getCategoryColor(item.category) }
                        ]}
                    >
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
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="people"
                                size={12}
                                color="#666"
                            />
                            <Text style={styles.timeText}>{item.servings}</Text>
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
                            {renderStars(roundedRating)}
                            <Text style={styles.ratingText}>
                                {displayRating}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

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

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons
                            name="search"
                            size={20}
                            color="#666"
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search recipes..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                        />
                        {selectedCategory && (
                            <View style={styles.selectedCategoryTag}>
                                <Text style={styles.selectedCategoryTagText}>
                                    {selectedCategory.charAt(0).toUpperCase() +
                                        selectedCategory.slice(1)}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedCategory(null)}
                                    style={styles.removeCategoryButton}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={16}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.filterButton}
                            onPress={() =>
                                setShowCategoryFilter(!showCategoryFilter)
                            }
                        >
                            <MaterialIcons
                                name="filter-list"
                                size={24}
                                color="#E25822"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Category Filter Dropdown */}
                {showCategoryFilter && (
                    <View style={styles.categoryFilter}>
                        <Text style={styles.filterTitle}>
                            Filter by Category
                        </Text>
                        <View style={styles.categoryContainer}>
                            {categories.map(category => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryButton,
                                        selectedCategory === category &&
                                            styles.selectedCategoryButton,
                                        category === "all" &&
                                            styles.allCategoryButton
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(
                                            selectedCategory === category
                                                ? null
                                                : category
                                        );
                                        setShowCategoryFilter(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category &&
                                                styles.selectedCategoryText,
                                            category === "all" &&
                                                styles.allCategoryText
                                        ]}
                                    >
                                        {category === "all"
                                            ? "All"
                                            : category.charAt(0).toUpperCase() +
                                              category.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "latest" && styles.activeTab
                        ]}
                        onPress={() => setActiveTab("latest")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "latest" && styles.activeTabText
                            ]}
                        >
                            Latest
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "popular" && styles.activeTab
                        ]}
                        onPress={() => setActiveTab("popular")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "popular" && styles.activeTabText
                            ]}
                        >
                            Popular
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Recipe List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E25822" />
                    </View>
                ) : filteredRecipes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require("../assets/images/no-data.png")}
                            style={styles.noDataImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.emptyText}>
                            {searchQuery || selectedCategory
                                ? "No recipes match your search"
                                : "No recipes found. Add a new recipe!"}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRecipes}
                        renderItem={renderRecipeCard}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                )}

                {/* Floating Add Button */}
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={async () => {
                        const token = await AsyncStorage.getItem("token");
                        if (!token) {
                            Alert.alert(
                                "Signup Required",
                                "Please sign up to add recipes."
                            );
                            navigation.navigate("Auth");
                        } else {
                            navigation.navigate("AddRecipe");
                        }
                    }}
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    emptyText: {
        marginTop: 20,
        color: "#666",
        fontSize: 16,
        textAlign: "center",
        fontFamily: "Outfit-Variable"
    },
    noDataImage: {
        width: 200,
        height: 200
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
    searchContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: "Outfit-Variable"
    },
    filterButton: {
        marginLeft: "auto",
        padding: 8
    },
    selectedCategoryTag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#E25822",
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 8
    },
    selectedCategoryTagText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "Outfit-Variable"
    },
    removeCategoryButton: {
        marginLeft: 4
    },
    categoryFilter: {
        padding: 15,
        backgroundColor: "#f9f9f9",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    filterTitle: {
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
        fontFamily: "Outfit-Variable"
    },
    categoryContainer: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 20,
        backgroundColor: "#eee"
    },
    allCategoryButton: {
        backgroundColor: "#f0f0f0"
    },
    allCategoryText: {
        fontWeight: "bold"
    },
    selectedCategoryButton: {
        backgroundColor: "#E25822"
    },
    categoryText: {
        fontSize: 14,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    selectedCategoryText: {
        color: "#fff"
    },
    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0"
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center"
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#E25822"
    },
    tabText: {
        fontSize: 16,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    activeTabText: {
        color: "#E25822",
        fontWeight: "bold"
    },
    listContent: {
        padding: 15,
        paddingBottom: 100
    },
    recipeCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: 150
    },
    cardImageContainer: {
        width: "40%",
        height: "100%"
    },
    cardImage: {
        width: "100%",
        height: "100%",
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8
    },
    cardImagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8
    },
    cardContent: {
        width: "60%",
        padding: 12,
        justifyContent: "space-between"
    },
    recipeName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        fontFamily: "Galindo-Regular"
    },
    recipeCategoryContainer: {
        alignSelf: "flex-start",
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 10
    },
    recipeCategory: {
        fontSize: 12,
        color: "#fff",
        fontWeight: "600",
        fontFamily: "Outfit-Variable"
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },
    timeItem: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingVertical: 2,
        paddingHorizontal: 5
    },
    timeText: {
        marginLeft: 5,
        fontSize: 10,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    usernameText: {
        fontSize: 8,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    bookmarkButton: {
        position: "absolute",
        top: 5,
        left: 5,
        padding: 5,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 20,
        padding: 5
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center"
    },
    profileImage: {
        width: 15,
        height: 15,
        borderRadius: 50,
        marginRight: 2.5,
        borderWidth: 1,
        borderColor: "#E25822"
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 10,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    floatingButton: {
        position: "absolute",
        bottom: 100,
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
