import { View, StyleSheet, Alert } from 'react-native'
import React, { useCallback, useContext, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import Header from '../components/Header'
import InputLabel from '../components/InputLabel'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import Input from '../components/Input'
import { useNavigation } from 'expo-router'
import Button from '../components/Button'
import OtherContext from '../data/otherContext'
import { API_URL, TOKEN } from '@env'

type Nav = {
    navigate: (value: string) => void
}

interface InputValues {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
}

interface InputValidities {
    currentPassword: boolean | undefined
    newPassword: boolean | undefined
    confirmNewPassword: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    },
    inputValidities: {
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
    },
    formIsValid: false,
}

const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        console.error("No token found");
        setErrorMessage("Authentication failed. Please log in again.");
        return false; // Indicate failure to the caller
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const requestBody = {
        currentPassword: currentPassword,
        newPassword: newPassword,
    };

    try {
        const response = await fetch(`${API_URL}/api/users/${userId}/changepassword`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error(`Password change failed with status code: ${response.status}`);
            setErrorMessage(`Password change failed with status code: ${response.status}. Please try again.`);
            return false; // Indicate failure to the caller
        }

        const responseData = await response.json();
        console.log("Password change successful:", responseData);
        return true; // Indicate success to the caller
    } catch (error) {
        console.error("Password change failed:", error);
        setErrorMessage("Password change failed due to an unexpected error. Please try again.");
        return false; // Indicate failure to the caller
    }
};

const ChangePasswordScreen = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [errorMessage, setErrorMessage] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)
    const { accountDetails } = useContext(OtherContext)
    const vaccountno = accountDetails.vaccountno

    const inputChangedHandler = useCallback(
        (inputId: string, inputValue: string) => {
            const result = validateInput(inputId, inputValue)
            dispatchFormState({
                inputId,
                validationResult: result,
                inputValue,
            })
        },
        [dispatchFormState]
    )

    useEffect(() => {
        if (error) {
            Alert.alert('An error occurred', error)
        }
    }, [error])

    const handlePasswordChange = async () => {
        const currentPassword = formState.inputValues.currentPassword;
        const newPassword = formState.inputValues.newPassword;
        const confirmNewPassword = formState.inputValues.confirmNewPassword;

        if (newPassword !== confirmNewPassword) {
            setErrorMessage("New password and confirm password do not match.");
            return;
        }

        const success = await changePassword(vaccountno, currentPassword, newPassword);
        if (success) {
            navigate("profile");
        }
    };

    return (
        <SafeAreaView style={styles.area}>
            <View style={styles.container}>
                <Header title="Password" />
                <View style={{ margin: 16 }}>
                    <InputLabel title="Enter your old password" />
                    <Input
                        id="currentPassword"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['currentPassword']}
                        placeholder="**********"
                        placeholderTextColor={COLORS.black}
                    />
                    <InputLabel title="Enter your new password" />
                    <Input
                        id="newPassword"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['newPassword']}
                        placeholder=""
                        placeholderTextColor={COLORS.black}
                    />
                    <InputLabel title="Confirm your new password" />
                    <Input
                        id="confirmNewPassword"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['confirmNewPassword']}
                        placeholder=""
                        placeholderTextColor={COLORS.black}
                        secureTextEntry={true}
                    />
                    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                </View>
                <Button
                    title="Save Password"
                    onPress={handlePasswordChange}
                    filled
                    style={{
                        position: "absolute",
                        bottom: 32,
                        width: SIZES.width - 32,
                        marginHorizontal: 16,
                        backgroundColor: '#a98e63',
                        borderColor: '#a98e63',
                        borderWidth: 1,
                    }}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    errorText: {
        color: 'red',
        marginTop: 5,
    },
})

export default ChangePasswordScreen