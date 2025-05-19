import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import useFonts from "./hooks/useFonts";

const Results = ({ route, navigation }) => {
    const { imageUri } = route.params;
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const fontsLoaded = useFonts();

    useEffect(() => {
        const processImage = async () => {
            try {
                // Create FormData
                const formData = new FormData();
                formData.append("image", {
                    uri: imageUri,
                    name: "plant.jpg",
                    type: "image/jpeg"
                });

                // Send to Laravel backend
                const response = await axios.post(
                    "http://127.0.0.1:8000/api/predict",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                            Accept: "application/json"
                        }
                    }
                );

                setResult(response.data);
            } catch (error) {
                console.error("Error:", error);
                setResult({
                    error: "Failed to process image"
                });
            } finally {
                setLoading(false);
            }
        };

        processImage();
    }, [imageUri]);

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2C7120" />
                <Text style={styles.loadingText}>Analyzing your plant...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
            </View>

            {result?.error ? (
                <View style={styles.resultContainer}>
                    <MaterialIcons name="error" size={50} color="#FF3B30" />
                    <Text style={styles.errorText}>{result.error}</Text>
                </View>
            ) : (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Detection Results</Text>

                    <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Disease:</Text>
                        <Text style={styles.resultValue}>
                            {result?.disease || "Unknown"}
                        </Text>
                    </View>

                    <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Confidence:</Text>
                        <Text style={styles.resultValue}>
                            {result?.confidence
                                ? `${(result.confidence * 100).toFixed(2)}%`
                                : "N/A"}
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: "#2C7120",
        fontFamily: "Outfit-Variable"
    },
    imageContainer: {
        width: "100%",
        height: 250,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 30
    },
    image: {
        width: "100%",
        height: "100%"
    },
    resultContainer: {
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        padding: 20
    },
    resultTitle: {
        fontSize: 22,
        fontFamily: "ZenDots-Regular",
        color: "#2C7120",
        marginBottom: 20,
        textAlign: "center"
    },
    resultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15
    },
    resultLabel: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#333",
        fontWeight: "600"
    },
    resultValue: {
        fontSize: 16,
        fontFamily: "Outfit-Variable",
        color: "#2C7120",
        fontWeight: "600"
    },
    errorText: {
        fontSize: 16,
        color: "#FF3B30",
        marginTop: 10,
        textAlign: "center",
        fontFamily: "Outfit-Variable"
    }
});

export default Results;
