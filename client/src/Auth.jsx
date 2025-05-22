import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthTopNav from "./components/AuthTopNav";

const Auth = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("signup");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: ""
    });
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (name, value) => {
        if (activeTab === "signup") {
            setFormData({
                ...formData,
                [name]: value
            });
            // Clear error when user types
            if (errors[name]) {
                setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors[name];
                    return newErrors;
                });
            }
        } else {
            setLoginData({
                ...loginData,
                [name]: value
            });
        }
    };

    const handleSignup = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/register",
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                }
            );
            await AsyncStorage.setItem("token", response.data.token);
            navigation.navigate("CookBook");
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                Alert.alert(
                    "Registration Error",
                    error.response?.data?.message || error.message || "Failed to register"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login",
                loginData
            );
            await AsyncStorage.setItem("token", response.data.token);
            navigation.navigate("CookBook");
        } catch (error) {
            Alert.alert(
                "Login Error",
                error.response?.data?.message || "Failed to login"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (activeTab === "signup") {
            handleSignup();
        } else {
            handleLogin();
        }
    };

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <AuthTopNav activeTab={activeTab} onTabChange={setActiveTab} />
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.header}>
                        <MaterialIcons name="menu-book" size={50} color="#E25822" />
                        <Text style={styles.title}>
                            {activeTab === "signup" ? "Create Your Account" : "Welcome Back"}
                        </Text>
                    </View>

                    {activeTab === "signup" && (
                        <>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.first_name}
                                    onChangeText={text => handleChange("first_name", text)}
                                    placeholder="John"
                                />
                                {errors.first_name && <Text style={styles.errorText}>{errors.first_name[0]}</Text>}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.last_name}
                                    onChangeText={text => handleChange("last_name", text)}
                                    placeholder="Doe"
                                />
                                {errors.last_name && <Text style={styles.errorText}>{errors.last_name[0]}</Text>}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.username}
                                    onChangeText={text => handleChange("username", text)}
                                    placeholder="johndoe123"
                                    autoCapitalize="none"
                                />
                                {errors.username && <Text style={styles.errorText}>{errors.username[0]}</Text>}
                            </View>
                        </>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={activeTab === "signup" ? formData.email : loginData.email}
                            onChangeText={text => handleChange("email", text)}
                            placeholder="john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                value={activeTab === "signup" ? formData.password : loginData.password}
                                onChangeText={text => handleChange("password", text)}
                                placeholder="••••••••"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password[0]}</Text>}
                        {activeTab === "signup" && (
                            <Text style={styles.passwordHint}>Password must be at least 8 characters</Text>
                        )}
                    </View>

                    {activeTab === "signup" && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    value={formData.password_confirmation}
                                    onChangeText={text => handleChange("password_confirmation", text)}
                                    placeholder="••••••••"
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity 
                                    style={styles.eyeIcon}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons 
                                        name={showConfirmPassword ? "eye-off" : "eye"} 
                                        size={24} 
                                        color="#666" 
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password_confirmation && <Text style={styles.errorText}>{errors.password_confirmation[0]}</Text>}
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {activeTab === "signup" ? "Sign Up" : "Log In"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchLink}
                        onPress={() => {
                            setActiveTab(activeTab === "signup" ? "login" : "signup");
                            setErrors({});
                        }}
                    >
                        <Text style={styles.switchText}>
                            {activeTab === "signup"
                                ? "Already have an account? "
                                : "Don't have an account? "}
                            <Text style={styles.switchLinkText}>
                                {activeTab === "signup" ? "Log in" : "Sign up"}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 80
    },
    header: {
        alignItems: "center",
        marginBottom: 30
    },
    title: {
        fontSize: 24,
        fontFamily: "Galindo-Regular",
        color: "#E25822",
        marginTop: 10
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
    passwordContainer: {
        position: 'relative'
    },
    passwordInput: {
        paddingRight: 50
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 15
    },
    button: {
        backgroundColor: "#E25822",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20
    },
    buttonText: {
        color: "white",
        fontFamily: "Galindo-Regular",
        fontSize: 18
    },
    switchLink: {
        marginTop: 20,
        alignItems: "center"
    },
    switchText: {
        fontFamily: "Outfit-Variable",
        color: "#666"
    },
    switchLinkText: {
        color: "#E25822",
        fontWeight: "bold"
    },
    errorText: {
        color: "#E25822",
        fontSize: 14,
        marginTop: 5,
        fontFamily: "Outfit-Variable"
    },
    passwordHint: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
        fontFamily: "Outfit-Variable"
    }
});

export default Auth;