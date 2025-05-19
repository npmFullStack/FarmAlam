import React, { useEffect } from "react";
import { View, StyleSheet, Image, Text, SafeAreaView } from "react-native";
import LottieView from "lottie-react-native";
import loadingAnimation from "../assets/loading.json";
import logo from "../assets/images/logo.png";

const LoadingScreen = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.navigate("Home");
        }, 4000); // 4 seconds

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <View style={styles.container}>
                <View style={styles.centerContainer}>
                    <View style={styles.logoContainer}>
                        <Image source={logo} style={styles.logo} />
                        <Text style={styles.title}>
                            <Text style={styles.farmText}>Farm</Text>
                            <Text style={styles.alamText}>Alam</Text>
                        </Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <LottieView
                        source={loadingAnimation}
                        autoPlay
                        loop
                        style={styles.animation}
                    />
                </View>
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
        backgroundColor: "#fff"
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    bottomContainer: {
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 40
    },
    logoContainer: {
        alignItems: "center"
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginBottom: 20
    },
    title: {
        fontSize: 32,
        textAlign: "center",
        fontFamily: "ZenDots-Regular"
    },
    farmText: {
        color: "#2C7120"
    },
    alamText: {
        color: "#333"
    },
    animation: {
        width: 250,
        height: 250
    }
});

export default LoadingScreen;
