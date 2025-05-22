import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const AddRecipe = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [image, setImage] = useState(null);

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

    // Handle image upload
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("token");

            // Create FormData for file upload
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('servings', formData.servings);
            data.append('prep_time', parseInt(formData.prep_time) || 0);
            data.append('cook_time', parseInt(formData.cook_time) || 0);
            
            // Add steps
            formData.steps.forEach((step, index) => {
                data.append(`steps[${index}][description]`, step.description);
            });

            // Add image if exists
            if (image) {
                const localUri = image;
                const filename = localUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                data.append('image', { uri: localUri, name: filename, type });
            }

            const response = await axios.post(
                "http://127.0.0.1:8000/api/recipes",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                        Accept: 'application/json',
                    }
                }
            );

            Alert.alert("Success", "Recipe added successfully!");
            navigation.navigate("CookBook");
        } catch (error) {
            console.error("Error adding recipe:", error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                Alert.alert(
                    "Validation Error",
                    "Please check your input and try again."
                );
            } else if (error.response?.data?.message) {
                Alert.alert("Error", error.response.data.message);
            } else {
                Alert.alert("Error", "Failed to add recipe. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

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
                        <Text style={styles.headerTitle}>Add New Recipe</Text>
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
                                    <Image 
                                        source={{ uri: image }} 
                                        style={styles.uploadedImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <MaterialIcons 
                                            name="add-a-photo" 
                                            size={40} 
                                            color="#E25822" 
                                        />
                                        <Text style={styles.uploadText}>Tap to upload image</Text>
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

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    Save Recipe
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
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    uploadPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    uploadText: {
        marginTop: 10,
        color: "#666",
        fontFamily: "Outfit-Variable"
    },
    uploadedImage: {
        width: '100%',
        height: '100%'
    }
});

export default AddRecipe;