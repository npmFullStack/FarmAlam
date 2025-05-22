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

    const categories = [
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
            const response = await axios.get(
                "http://127.0.0.1:8000/api/recipes",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setRecipes(response.data);
            setFilteredRecipes(response.data);
        } catch (error) {
            console.error("Error fetching recipes:", error);
            Alert.alert("Error", "Failed to fetch recipes. Please try again.");
        } finally {
            setLoading(false);
            setRefreshing(false);
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
        if (selectedCategory) {
            results = results.filter(
                recipe => recipe.category === selectedCategory
            );
        }

        // Apply tab filter (you can add more logic here for different tabs)
        if (activeTab === "popular") {
            // For demo, we'll just sort by name
            results.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Latest - sort by ID (assuming higher ID means newer)
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

    // Generate random rating (for demonstration, since your API doesn't have rating)
    const generateRandomRating = () => {
        const random = Math.random() * 5;
        return Math.round(random * 2) / 2; // Rounds to nearest 0.5
    };

    // Render star rating
    const renderStars = rating => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <FontAwesome
                        key={i}
                        name="star"
                        size={16}
                        color="#FFD700"
                    />
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <FontAwesome
                        key={i}
                        name="star-half-full"
                        size={16}
                        color="#FFD700"
                    />
                );
            } else {
                stars.push(
                    <FontAwesome
                        key={i}
                        name="star-o"
                        size={16}
                        color="#FFD700"
                    />
                );
            }
        }
        return stars;
    };

    // Render servings icon based on count
    const renderServingsIcon = servings => {
        switch (servings) {
            case "1":
                return <MaterialIcons name="person" size={16} color="#666" />;
            case "2":
                return (
                    <MaterialIcons
                        name="people-outline"
                        size={16}
                        color="#666"
                    />
                );
            case "4":
                return <MaterialIcons name="group" size={16} color="#666" />;
            case "8+":
                return <MaterialIcons name="groups" size={16} color="#666" />;
            default:
                return <MaterialIcons name="person" size={16} color="#666" />;
        }
    };

    // Render recipe card
    const renderRecipeCard = ({ item }) => {
        const rating = generateRandomRating();

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
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.recipeName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.recipeCategory}>
                        {item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)}
                    </Text>
                    <View style={styles.timeContainer}>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={12}
                                color="#fff"
                            />
                            <Text style={styles.timeText}>
                                Prep: {item.prep_time}m
                            </Text>
                        </View>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={12}
                                color="#fff"
                            />
                            <Text style={styles.timeText}>
                                Cook: {item.cook_time}m
                            </Text>
                        </View>
                    </View>
                    <View style={styles.bottomRow}>
                        <View style={styles.servingsContainer}>
                            {renderServingsIcon(item.servings)}
                            <Text style={styles.servingsText}>
                                {item.servings}
                            </Text>
                        </View>
                        <View style={styles.ratingContainer}>
                            {renderStars(rating)}
                            <Text style={styles.ratingText}>
                                {rating.toFixed(1)}
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
                    </View>
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
                                            styles.selectedCategoryButton
                                    ]}
                                    onPress={() => {
                                        setSelectedCategory(
                                            selectedCategory === category
                                                ? null
                                                : category
                                        );
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.categoryText,
                                            selectedCategory === category &&
                                                styles.selectedCategoryText
                                        ]}
                                    >
                                        {category.charAt(0).toUpperCase() +
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
        textAlign: "center"
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
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
        paddingHorizontal: 10
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16
    },
    filterButton: {
        marginLeft: 10,
        padding: 8
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
        color: "#333"
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
    selectedCategoryButton: {
        backgroundColor: "#E25822"
    },
    categoryText: {
        fontSize: 14,
        color: "#666"
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
        color: "#666"
    },
    activeTabText: {
        color: "#E25822",
        fontWeight: "bold"
    },
    listContent: {
        padding: 15
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
        height: 150 // Fixed height for all cards
    },
    cardImageContainer: {
        width: "40%",
        height: "100%" // Image takes full height of card
    },
    cardImage: {
        width: "100%",
        height: "100%", // Image takes full height
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
        fontFamily: "Outfit-Variable"
    },
    recipeCategory: {
        fontSize: 12,
        color: "#E25822",
        marginBottom: 10,
        fontWeight: 600
    },
    timeContainer: {
        flexDirection: "row",
        marginBottom: 10
    },
    timeItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 15,
        borderRadius: 16,
        backgroundColor: "#E25822",
        paddingVertical: 2,
        paddingHorizontal: 5
    },
    timeText: {
        marginLeft: 5,
        fontSize: 8,
        color: "#fff"
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    servingsContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    servingsText: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666"
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    ratingText: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666"
    },
    floatingButton: {
        position: "absolute",
        bottom: 150,
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
