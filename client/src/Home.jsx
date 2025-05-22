import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    Image,
    StyleSheet,
    ImageBackground,
    ActivityIndicator,
    Platform,
    ScrollView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useFonts from "./hooks/useFonts";
import BottomNav from "./components/BottomNav";

const Home = () => {
    const navigation = useNavigation();
    const fontsLoaded = useFonts();
    const [fontsReady, setFontsReady] = useState(false);

    useEffect(() => {
        if (fontsLoaded) {
            const timer = setTimeout(() => {
                setFontsReady(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [fontsLoaded]);

    if (!fontsReady) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
                <ActivityIndicator size="large" color="#E25822" />
            </SafeAreaView>
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
                        <Text style={styles.lutongText}>Lutong</Text>
                        <Text style={styles.bahayText}>Bahay</Text>
                    </Text>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Content with Background Image */}
                <ImageBackground
                    source={require("../assets/images/bg.png")}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.content}>
                        <Text style={styles.heading}>
                            Gutom Na? Tara, Lutooooo!
                        </Text>
                        <Text style={styles.subHeading}>
                            From adobo to sinigang, find all your paborito
                            recipes here!
                        </Text>

                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate("SearchRecipe")}
                        >
                            <MaterialIcons
                                name="search"
                                size={24}
                                color="white"
                            />
                            <Text style={styles.buttonText}>
                                Browse Recipes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNav />
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
        marginTop: 20
    },
    scrollContainer: {
        flexGrow: 1
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
        fontFamily: "Galindo-Regular"
    },
    lutongText: {
        color: "#E25822"
    },
    bahayText: {
        color: "#333"
    },
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
        minHeight: 500 // Adjust as needed
    },
    content: {
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 20,
        margin: 20,
        borderRadius: 10
    },
    heading: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
        fontFamily: "Galindo-Regular",
        color: "#E25822",
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
    browseButton: {
        flexDirection: "row",
        backgroundColor: "#E25822",
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
        fontFamily: "Galindo-Regular",
        fontWeight: 800
    }
});

export default Home;
