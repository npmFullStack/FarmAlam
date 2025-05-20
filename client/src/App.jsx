import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoadingScreen from "./LoadingScreen";
import Home from "./Home";
import CookBook from "./CookBook";
import SearchRecipe from "./SearchRecipe";
import Account from "./Account";
import * as Font from "expo-font";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                "Galindo-Regular": require("../assets/fonts/Galindo-Regular.ttf"),
                "Outfit-Variable": require("../assets/fonts/Outfit-Regular.ttf"),
                "CalSans-Regular": require("../assets/fonts/CalSans-Regular.ttf")
            });
            setFontsLoaded(true);
        }

        loadFonts();
    }, []);

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Loading"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Loading" component={LoadingScreen} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="CookBook" component={CookBook} />
                <Stack.Screen name="SearchRecipe" component={SearchRecipe} />
                <Stack.Screen name="Account" component={Account} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}