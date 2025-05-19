import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    Alert,
    ActivityIndicator,
    Platform
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import useFonts from "./hooks/useFonts";
import axios from "axios";

const Home = () => {
    const navigation = useNavigation();
    const fontsLoaded = useFonts();
    const [fontsReady, setFontsReady] = useState(false);

    // Additional delay to ensure fonts are fully loaded
    useEffect(() => {
        if (fontsLoaded) {
            const timer = setTimeout(() => {
                setFontsReady(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [fontsLoaded]);

    const handleImagePicker = () => {
        Alert.alert(
            "Upload Photo",
            "Choose an option",
            [
                {
                    text: "Camera",
                    onPress: () => pickImage("camera")
                },
                {
                    text: "Gallery",
                    onPress: () => pickImage("gallery")
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ],
            { cancelable: true }
        );
    };

    const pickImage = async source => {
        let result;
        try {
            if (source === "camera") {
                await ImagePicker.requestCameraPermissionsAsync();
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1
                });
            } else {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1
                });
            }

            if (!result.canceled) {
                navigation.navigate("Results", {
                    imageUri: result.assets[0].uri
                });
            }
        } catch (error) {
            console.log("Image picker error:", error);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    if (!fontsReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../assets/images/logo.png")}
                        style={styles.logo}
                    />
                    <Text style={styles.logoText}>
                        <Text style={styles.farmText}>Farm</Text>
                        <Text style={styles.alamText}>Alam</Text>
                    </Text>
                </View>
            </View>

            {/* Content with Background Image */}
            <ImageBackground
                source={require("../assets/images/bg.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
                renderToHardwareTextureAndroid={true}
            >
                <View style={styles.content}>
                    <Text style={styles.heading}>Plant Disease Detection</Text>
                    <Text style={styles.subHeading}>
                        Upload a photo of your crop or plant to detect diseases
                        and get recommended treatments.
                    </Text>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handleImagePicker}
                    >
                        <MaterialIcons
                            name="cloud-upload"
                            size={24}
                            color="white"
                        />
                        <Text style={styles.buttonText}>Upload</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
        marginTop: Platform.OS === "android" ? 0 : 20,
        marginTop: 20
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "white",
        zIndex: 1
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center"
    },
    logo: {
        width: 30,
        height: 30,
        resizeMode: "contain"
    },
    logoText: {
        fontSize: 20,
        fontFamily: "ZenDots-Regular"
    },
    farmText: {
        color: "#2C7120"
    },
    alamText: {
        color: "#333"
    },
    backgroundImage: {
        flex: 1,
        justifyContent: "center"
    },
    content: {
        backgroundColor: "rgba(255,255,255,0.6)",
        padding: 20,
        margin: 20,
        borderRadius: 10
    },
    heading: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
        fontFamily: "ZenDots-Regular",
        color: "#2C7120",
        ...Platform.select({
            android: {
                includeFontPadding: false
            }
        })
    },
    subHeading: {
        fontSize: 16,
        marginBottom: 40,
        textAlign: "center",
        color: "#666",
        lineHeight: 24,
        fontFamily: "Outfit-Variable",
        fontWeight: 500
    },
    uploadButton: {
        flexDirection: "row",
        backgroundColor: "#59D102",
        padding: 15,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20
    },
    buttonText: {
        color: "white",
        marginLeft: 10,
        fontSize: 18,
        fontWeight: "800",
        fontFamily: "CalSans-Regular"
    }
});

export default Home;
