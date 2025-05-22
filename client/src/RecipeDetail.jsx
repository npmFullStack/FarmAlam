import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Alert
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "./components/BottomNav";

const RecipeDetail = ({ route }) => {
    const navigation = useNavigation();
    const { recipeId } = route.params;
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [rated, setRated] = useState(false);
    const [ratingLoading, setRatingLoading] = useState(false);

    useEffect(() => {
        fetchRecipe();
        fetchUserRating();
    }, [recipeId]);

    const fetchRecipe = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get(
                `http://127.0.0.1:8000/api/recipes/${recipeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );
            setRecipe(response.data);
            setAverageRating(response.data.average_rating || 0);
        } catch (error) {
            console.error(
                "Error fetching recipe:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Error",
                error.response?.data?.message ||
                    "Failed to fetch recipe details."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRating = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get(
                `http://127.0.0.1:8000/api/ratings/${recipeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    }
                }
            );
            if (response.data.success) {
                setUserRating(response.data.rating);
            } else {
                console.error("Rating fetch failed:", response.data.message);
            }
        } catch (error) {
            console.error(
                "Error fetching user rating:",
                error.response?.data || error.message
            );
        }
    };

    const handleRating = async rating => {
        try {
            setRatingLoading(true);
            const token = await AsyncStorage.getItem("token");
            const response = await axios.post(
                "http://127.0.0.1:8000/api/ratings",
                {
                    recipe_id: recipeId,
                    rating: rating
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.data.success) {
                setUserRating(response.data.user_rating);
                setAverageRating(response.data.average_rating);
                setRated(true);
                Alert.alert("Success", "Thank you for rating this recipe!");
            } else {
                Alert.alert("Error", response.data.message);
            }
        } catch (error) {
            console.error(
                "Error submitting rating:",
                error.response?.data || error.message
            );
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to submit rating."
            );
        } finally {
            setRatingLoading(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        return [1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
                key={star}
                disabled={!interactive || ratingLoading}
                onPress={() => interactive && handleRating(star)}
            >
                <FontAwesome
                    name={star <= rating ? "star" : "star-o"}
                    size={32}
                    color={interactive ? "#FFD700" : "#FFD700"}
                    style={styles.star}
                />
            </TouchableOpacity>
        ));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E25822" />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.container}>
                <Text>Recipe not found</Text>
            </View>
        );
    }

    const formattedDate = new Date(recipe.created_at).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

    return (
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
                <Text style={styles.headerTitle}>Details</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {recipe.image ? (
                    <Image
                        source={{
                            uri: `http://127.0.0.1:8000/storage/${recipe.image}`
                        }}
                        style={styles.recipeImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialIcons name="no-food" size={50} color="#ccc" />
                    </View>
                )}

                <View style={styles.contentContainer}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>

                    <View style={styles.metaContainer}>
                        <Text style={styles.category}>{recipe.category}</Text>
                        <Text style={styles.date}>
                            Shared on {formattedDate}
                        </Text>
                    </View>

                    <Text style={styles.username}>
                        By @{recipe.user?.username || "unknown"}
                    </Text>

                    <View style={styles.timeContainer}>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={16}
                                color="#666"
                            />
                            <Text style={styles.timeText}>
                                Prep: {recipe.prep_time}m
                            </Text>
                        </View>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="timer"
                                size={16}
                                color="#666"
                            />
                            <Text style={styles.timeText}>
                                Cook: {recipe.cook_time}m
                            </Text>
                        </View>
                        <View style={styles.timeItem}>
                            <MaterialIcons
                                name="people"
                                size={16}
                                color="#666"
                            />
                            <Text style={styles.timeText}>
                                Serves: {recipe.servings}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{recipe.description}</Text>

                    <Text style={styles.sectionTitle}>Steps</Text>
                    {recipe.steps.map((step, index) => (
                        <View key={step.id} style={styles.stepContainer}>
                            <Text style={styles.stepNumber}>{index + 1}.</Text>
                            <Text style={styles.stepText}>
                                {step.description}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingTitle}>
                        {rated ? "Thank you for rating!" : "Rate this recipe"}
                    </Text>
                    <View style={styles.starsContainer}>
                        {renderStars(userRating, true)}
                    </View>
                    <Text style={styles.averageRating}>
                        Average rating: {averageRating.toFixed(1)}/5
                    </Text>
                </View>
            </ScrollView>

            <BottomNav />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    scrollContainer: {
        paddingBottom: 80
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
    recipeImage: {
        width: "100%",
        height: 250
    },
    imagePlaceholder: {
        width: "100%",
        height: 250,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center"
    },
    contentContainer: {
        padding: 20
    },
    recipeName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        fontFamily: "Galindo-Regular"
    },
    metaContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },
    category: {
        fontSize: 16,
        color: "#E25822",
        fontWeight: "600",
        fontFamily: "Outfit-Variable"
    },
    date: {
        fontSize: 14,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    username: {
        fontSize: 16,
        color: "#666",
        marginBottom: 15,
        fontFamily: "Outfit-Variable"
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20
    },
    timeItem: {
        flexDirection: "row",
        alignItems: "center"
    },
    timeText: {
        marginLeft: 5,
        fontSize: 14,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 10,
        fontFamily: "Outfit-Variable"
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: "#333",
        marginBottom: 10,
        fontFamily: "Outfit-Variable"
    },
    stepContainer: {
        flexDirection: "row",
        marginBottom: 10
    },
    stepNumber: {
        fontWeight: "bold",
        marginRight: 10,
        fontFamily: "Outfit-Variable"
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        color: "#333",
        fontFamily: "Outfit-Variable"
    },
    ratingContainer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        marginTop: 20
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
        fontFamily: "Outfit-Variable"
    },
    starsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10
    },
    star: {
        marginHorizontal: 5
    },
    averageRating: {
        textAlign: "center",
        fontSize: 16,
        color: "#666",
        fontFamily: "Outfit-Variable"
    }
});

export default RecipeDetail;
