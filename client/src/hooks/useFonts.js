// src/hooks/useFonts.js
import * as Font from "expo-font";
import { useEffect, useState } from "react";

export default function useFonts() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                "Galindo-Regular": require("../../assets/fonts/Galindo-Regular.ttf"),
                "Outfit-Variable": require("../../assets/fonts/Outfit-Regular.ttf"),
                "CalSans-Regular": require("../../assets/fonts/CalSans-Regular.ttf")
            });
            setFontsLoaded(true);
        }

        loadFonts();
    }, []);

    return fontsLoaded;
}
