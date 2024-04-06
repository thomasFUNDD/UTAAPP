import { View, StyleSheet, Alert, Text, Modal, TouchableOpacity } from 'react-native'
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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

const changePassword = async (currentPassword, newPassword) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            console.error("No token found");
            setErrorMessage("Authentication failed. Please log in again.");
            return false; // Indicate failure to the caller
        }

        const requestConfig = {
            method: 'put',
            url: `${API_URL}/client/accounts/password`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: {
                old_password: currentPassword,
                new_password: newPassword,
            },
        };

        const response = await axios(requestConfig);

        console.log("Password change successful:", response.data);
        return true; // Indicate success to the caller
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error("Password change failed with status code:", error.response.status);
            setErrorMessage(`Password change failed with status code: ${error.response.status}. Please try again.`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Password change failed, no response received");
            setErrorMessage("Password change failed, no response received. Please try again.");
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Password change failed:", error.message);
            setErrorMessage(`Password change failed: ${error.message}. Please try again.`);
        }
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
    const [modalVisible, setModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');

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

        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            setNewPassword(newPassword);
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        navigate("profile");
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Password changed successfully!</Text>
                        <Text style={styles.passwordText}>Your new password is: {newPassword}</Text>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={closeModal}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonClose: {
        backgroundColor: '#a98e63',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    passwordText: {
        marginBottom: 20,
        textAlign: 'center',
    },
})

export default ChangePasswordScreen