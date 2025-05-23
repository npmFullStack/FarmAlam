import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UpdateRecipe = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { recipe } = route.params;
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});
    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "main course",
        servings: "2",
        prep_time: "",
        cook_time: "",
        steps: [{ description: "" }]
    });

    // Fetch recipe data
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/recipes/${recipe.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const recipeData = response.data;
                setCurrentImage(recipeData.image);
                setFormData({
                    name: recipeData.name,
                    description: recipeData.description,
                    category: recipeData.category,
                    servings: recipeData.servings,
                    prep_time: recipeData.prep_time.toString(),
                    cook_time: recipeData.cook_time.toString(),
                    steps: recipeData.steps.map(step => ({
                        description: step.description
                    }))
                });
            } catch (error) {
                console.error("Error fetching recipe:", error);
                Alert.alert("Error", "Failed to fetch recipe data.");
            } finally {
                setFetching(false);
            }
        };

        fetchRecipe();
    }, [recipe.id]);

    // Handle image upload
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setCurrentImage(null); // Clear current image if new one is selected
        }
    };

    // Handle input changes
    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle step changes
    const handleStepChange = (index, value) => {
        const newSteps = [...formData.steps];
        newSteps[index].description = value;
        setFormData({
            ...formData,
            steps: newSteps
        });
    };

    // Add a new step
    const addStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, { description: "" }]
        });
    };

    // Remove a step
    const removeStep = index => {
        if (formData.steps.length > 1) {
            const newSteps = [...formData.steps];
            newSteps.splice(index, 1);
            setFormData({
                ...formData,
                steps: newSteps
            });
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");
            const data = new FormData();
            data.append("_method", "PUT");

            // Add all other fields
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("category", formData.category);
            data.append("servings", formData.servings);
            data.append("prep_time", parseInt(formData.prep_time) || 0);
            data.append("cook_time", parseInt(formData.cook_time) || 0);

            // Add steps
            formData.steps.forEach((step, index) => {
                data.append(`steps[${index}][description]`, step.description);
            });

            // Handle image cases:
            if (image) {
                // New image selected
                const localUri = image;
                const filename = localUri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                data.append("image", { uri: localUri, name: filename, type });
            } else if (!currentImage) {
                // No image selected and no current image - explicitly set to null
                data.append("image", ""); // Send empty string to remove image
            }
            // Else: keep current image (don't send anything about image)

            const response = await axios.post(
                `http://127.0.0.1:8000/api/recipes/${recipe.id}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json"
                    }
                }
            );

            Alert.alert("Success", "Recipe updated successfully!");
            navigation.navigate("RecipeDetail", { recipeId: recipe.id });
        } catch (error) {
            console.error("Error updating recipe:", error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                Alert.alert(
                    "Validation Error",
                    "Please check your input and try again."
                );
            } else if (error.response?.data?.message) {
                Alert.alert("Error", error.response.data.message);
            } else {
                Alert.alert(
                    "Error",
                    "Failed to update recipe. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
                <ActivityIndicator size="large" color="#E25822" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialIcons
                                name="arrow-back"
                                size={24}
                                color="#E25822"
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Update Recipe</Text>
                        <View style={styles.headerRightPlaceholder} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* Recipe Image Upload */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Recipe Image</Text>
                            <TouchableOpacity
                                style={styles.imageUploadContainer}
                                onPress={pickImage}
                            >
                                {image ? (
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: image }}
                                            style={styles.uploadedImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.editIconOverlay}>
                                            <MaterialIcons
                                                name="edit"
                                                size={24}
                                                color="white"
                                            />
                                        </View>
                                    </View>
                                ) : currentImage ? (
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{
                                                uri: `http://127.0.0.1:8000/storage/${currentImage}`
                                            }}
                                            style={styles.uploadedImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.editIconOverlay}>
                                            <MaterialIcons
                                                name="edit"
                                                size={24}
                                                color="white"
                                            />
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <MaterialIcons
                                            name="add-a-photo"
                                            size={40}
                                            color="#E25822"
                                        />
                                        <Text style={styles.uploadText}>
                                            Tap to add image
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {errors.image && (
                                <Text style={styles.errorText}>
                                    {errors.image[0]}
                                </Text>
                            )}
                        </View>

                        {/* Recipe Name */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Recipe Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={text =>
                                    handleChange("name", text)
                                }
                                placeholder="Enter recipe name"
                            />
                            {errors.name && (
                                <Text style={styles.errorText}>
                                    {errors.name[0]}
                                </Text>
                            )}
                        </View>

                        {/* Description */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={text =>
                                    handleChange("description", text)
                                }
                                placeholder="Enter recipe description"
                                multiline
                                numberOfLines={4}
                            />
                            {errors.description && (
                                <Text style={styles.errorText}>
                                    {errors.description[0]}
                                </Text>
                            )}
                        </View>

                        {/* Category */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.category}
                                    onValueChange={itemValue =>
                                        handleChange("category", itemValue)
                                    }
                                    style={styles.picker}
                                >
                                    <Picker.Item
                                        label="Appetizer"
                                        value="appetizer"
                                    />
                                    <Picker.Item
                                        label="Main Course"
                                        value="main course"
                                    />
                                    <Picker.Item
                                        label="Dessert"
                                        value="dessert"
                                    />
                                    <Picker.Item label="Salad" value="salad" />
                                    <Picker.Item label="Soup" value="soup" />
                                    <Picker.Item
                                        label="Side Dish"
                                        value="side dish"
                                    />
                                    <Picker.Item
                                        label="Breakfast"
                                        value="breakfast"
                                    />
                                    <Picker.Item
                                        label="Beverage"
                                        value="beverage"
                                    />
                                </Picker>
                            </View>
                        </View>

                        {/* Servings */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Servings</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.servings}
                                    onValueChange={itemValue =>
                                        handleChange("servings", itemValue)
                                    }
                                    style={styles.picker}
                                >
                                    <Picker.Item label="1" value="1" />
                                    <Picker.Item label="2" value="2" />
                                    <Picker.Item label="4" value="4" />
                                    <Picker.Item label="8+" value="8+" />
                                </Picker>
                            </View>
                        </View>

                        {/* Prep Time */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Prep Time (minutes)
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formData.prep_time}
                                onChangeText={text =>
                                    handleChange("prep_time", text)
                                }
                                placeholder="Enter prep time"
                                keyboardType="numeric"
                            />
                            {errors.prep_time && (
                                <Text style={styles.errorText}>
                                    {errors.prep_time[0]}
                                </Text>
                            )}
                        </View>

                        {/* Cook Time */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Cook Time (minutes)
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formData.cook_time}
                                onChangeText={text =>
                                    handleChange("cook_time", text)
                                }
                                placeholder="Enter cook time"
                                keyboardType="numeric"
                            />
                            {errors.cook_time && (
                                <Text style={styles.errorText}>
                                    {errors.cook_time[0]}
                                </Text>
                            )}
                        </View>

                        {/* Steps */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Steps</Text>
                            {formData.steps.map((step, index) => (
                                <View key={index} style={styles.stepContainer}>
                                    <Text style={styles.stepNumber}>
                                        Step {index + 1}
                                    </Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={step.description}
                                        onChangeText={text =>
                                            handleStepChange(index, text)
                                        }
                                        placeholder={`Describe step ${
                                            index + 1
                                        }`}
                                        multiline
                                    />
                                    {formData.steps.length > 1 && (
                                        <TouchableOpacity
                                            style={styles.removeStepButton}
                                            onPress={() => removeStep(index)}
                                        >
                                            <MaterialIcons
                                                name="delete"
                                                size={20}
                                                color="#E25822"
                                            />
                                        </TouchableOpacity>
                                    )}
                                    {errors[`steps.${index}.description`] && (
                                        <Text style={styles.errorText}>
                                            {
                                                errors[
                                                    `steps.${index}.description`
                                                ][0]
                                            }
                                        </Text>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity
                                style={styles.addStepButton}
                                onPress={addStep}
                            >
                                <MaterialIcons
                                    name="add"
                                    size={24}
                                    color="#E25822"
                                />
                                <Text style={styles.addStepText}>
                                    Add Another Step
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Update Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleUpdate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    Update Recipe
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 15,
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
        width: 24
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 100
    },
    formGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#333",
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        fontFamily: "Outfit-Variable"
    },
    textArea: {
        height: 100,
        textAlignVertical: "top"
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        overflow: "hidden"
    },
    picker: {
        height: 50,
        width: "100%"
    },
    stepContainer: {
        marginBottom: 15,
        position: "relative"
    },
    stepNumber: {
        fontSize: 14,
        fontFamily: "Outfit-Variable",
        color: "#666",
        marginBottom: 5
    },
    removeStepButton: {
        position: "absolute",
        right: 10,
        top: 10,
        padding: 5
    },
    addStepButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        marginTop: 10
    },
    addStepText: {
        marginLeft: 5,
        color: "#E25822",
        fontFamily: "Outfit-Variable"
    },
    submitButton: {
        backgroundColor: "#E25822",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20
    },
    submitButtonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 18
    },
    errorText: {
        color: "#E25822",
        fontSize: 14,
        marginTop: 5,
        fontFamily: "Outfit-Variable"
    },
    imageUploadContainer: {
        height: 200,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    uploadPlaceholder: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    uploadText: {
        marginTop: 10,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    uploadedImage: {
        width: "100%",
        height: "100%"
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: "100%"
    },
    editIconOverlay: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        padding: 5
    }
});

export default UpdateRecipe;
