import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Platform,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView
} from "react-native";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

const ManageProfile = () => {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        profile_picture: null
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/api/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data.user);
            setFormData({
                first_name: response.data.user.first_name,
                last_name: response.data.user.last_name,
                username: response.data.user.username,
                email: response.data.user.email,
                password: "",
                profile_picture:
                    response.data.user.profile_picture ||
                    "assets/images/default_profile.png"
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert("Error", "Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleImagePick = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            });

            if (!result.canceled) {
                setFormData({
                    ...formData,
                    profile_picture: result.assets[0].uri
                });
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to select image");
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setUpdating(true);
            const token = await AsyncStorage.getItem("token");

            const form = new FormData();
            form.append("first_name", formData.first_name);
            form.append("last_name", formData.last_name);
            form.append("username", formData.username);
            form.append("email", formData.email);
            if (formData.password) {
                form.append("password", formData.password);
            }

            if (
                formData.profile_picture &&
                formData.profile_picture.startsWith("file:")
            ) {
                form.append("profile_picture", {
                    uri: formData.profile_picture,
                    name: "profile.jpg",
                    type: "image/jpeg"
                });
            }

            const response = await axios.post(
                "http://127.0.0.1:8000/api/user/update",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            Alert.alert("Success", "Profile updated successfully", [
                {
                    text: "OK",
                    onPress: () => {
                        // Fetch updated data before navigating
                        fetchUserData().then(() => {
                            navigation.navigate("Account");
                        });
                    }
                }
            ]);
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const getProfilePictureUri = () => {
        if (!formData.profile_picture) {
            return require("../assets/images/default_profile.png");
        }
        if (formData.profile_picture.startsWith("file:")) {
            return { uri: formData.profile_picture };
        }
        if (formData.profile_picture.startsWith("assets/")) {
            return require("../assets/images/default_profile.png");
        }
        return {
            uri: `http://127.0.0.1:8000/storage/${formData.profile_picture}`
        };
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#E25822" />
                </View>
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
                    {/* Top Header */}
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
                        <Text style={styles.headerTitle}>Update Profile</Text>
                        <View style={styles.headerRightPlaceholder} />
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        {/* Profile Picture */}
                        <View style={styles.profilePictureContainer}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={getProfilePictureUri()}
                                    style={styles.avatar}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.editPictureButton}
                                onPress={handleImagePick}
                            >
                                <Feather name="edit-2" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.first_name}
                                    onChangeText={text =>
                                        handleChange("first_name", text)
                                    }
                                    placeholder="First Name"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.last_name}
                                    onChangeText={text =>
                                        handleChange("last_name", text)
                                    }
                                    placeholder="Last Name"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.username}
                                    onChangeText={text =>
                                        handleChange("username", text)
                                    }
                                    placeholder="Username"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.email}
                                    onChangeText={text =>
                                        handleChange("email", text)
                                    }
                                    placeholder="Email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    New Password (leave blank to keep current)
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.password}
                                    onChangeText={text =>
                                        handleChange("password", text)
                                    }
                                    placeholder="New Password"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleUpdateProfile}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    Save Changes
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
        flex: 1,
        position: "relative"
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
        paddingHorizontal: 20,
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
    scrollContainer: {
        paddingBottom: 80,
        paddingHorizontal: 20
    },
    profilePictureContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 30
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderWidth: 3,
        borderColor: "#E25822"
    },
    avatar: {
        width: "100%",
        height: "100%"
    },
    avatarPlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#E25822",
        justifyContent: "center",
        alignItems: "center"
    },
    editPictureButton: {
        position: "absolute",
        bottom: 0,
        right: "30%",
        backgroundColor: "#FFA726",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff"
    },
    formContainer: {
        marginBottom: 30
    },
    inputContainer: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
        fontFamily: "Outfit-Variable"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        fontFamily: "Outfit-Variable"
    },
    saveButton: {
        backgroundColor: "#E25822",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: "Outfit-Variable"
    }
});

export default ManageProfile;
