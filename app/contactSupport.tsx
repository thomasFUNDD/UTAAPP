import {KeyboardAvoidingView, Platform, ScrollView, View, Text, StyleSheet, Alert, TextInput  } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import Header from '../components/Header'
import InputLabel from '../components/InputLabel'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import Input from '../components/Input'
import { useNavigation } from 'expo-router'
import Button from '../components/Button'
import BalanceProvider from '../../data/BalanceProvider'; // Adjust the path as necessary
import BalanceContext from '../../data/balancesContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import otherContext from '../../data/otherContext';
import otherContextProvider from '../../data/otherContextProvider';
import OtherContext from '../../data/otherContext';
import { Picker } from '@react-native-picker/picker'; // Import Picker

type Nav = {
    navigate: (value: string) => void
}

interface InputValues {
    currentEmail: string
    newEmail: string
    password: string
}

interface InputValidities {
    currentEmail: boolean | undefined
    newEmail: boolean | undefined
    password: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        currentEmail: '',
        newEmail: '',
        password: '',
    },
    inputValidities: {
        currentEmail: false,
        newEmail: false,
        password: false,
    },
    formIsValid: false,
}

const ChangeEmailScreen = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)
    const [selectedSupportType, setSelectedSupportType] = useState('generalEnquiry'); // State to hold the selected option


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
    return (
        <SafeAreaView style={styles.area}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Header title="Contact Support" />
                    <View style={{ margin: 16 }}>
                        <InputLabel title="Type of Enquiry" />
                        <Picker
                            selectedValue={selectedSupportType}
                            onValueChange={(itemValue, itemIndex) =>
                                setSelectedSupportType(itemValue)
                            }
                            style={styles.picker}
                            mode="dropdown"
                        >
                            <Picker.Item label="General Enquiry" value="generalEnquiry" />
                            <Picker.Item label="Technical Support" value="technicalSupport" />
                        </Picker>
                        <InputLabel title="Your Name" />
                        <Input
                            id="name"
                            onInputChanged={inputChangedHandler}
                            errorText={formState.inputValidities['name']}
                            placeholder="John Doe"
                            placeholderTextColor={COLORS.black}
                        />
                        <InputLabel title="Your Email" />
                        <Input
                            id="currentEmail"
                            onInputChanged={inputChangedHandler}
                            errorText={formState.inputValidities['currentEmail']}
                            placeholder="example@mail.com"
                            placeholderTextColor={COLORS.black}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <InputLabel title="Your Message" />
                        <TextInput
                            id="message"
                            onChangeText={(text) => inputChangedHandler('message', text)}
                            value={formState.inputValues['message']}
                            placeholder="Type your message here"
                            placeholderTextColor={COLORS.black}
                            multiline={true}
                            numberOfLines={4}
                            style={styles.textArea}
                        />
                    </View>
                </ScrollView>
                <View style={styles.buttonContainer}>
                <Button
                    title="Save Email"
                    onPress={() => navigate("profile")}
                    filled
                    style={styles.button}
                />
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

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
    multiline: {
        height: 150, // Set a fixed height or make it dynamic as needed
        textAlignVertical: 'top', // For Android
        paddingTop: 10, // Optional: to ensure padding inside the text area
    },
    textArea: {
        height: 100, // You can adjust this as needed
        textAlignVertical: 'top', // Aligns text to the top on Android
        padding: 10, // Add padding as needed
        borderWidth: 1, // Add a border with 1 pixel width
        borderColor: '#000', // Set the border color, you can use any color
        borderRadius: 5, // Optional: if you want rounded corners

    },
    



    buttonContainer: {
        marginTop: 20,
        marginBottom: 0,
        padding: 20, // Add padding as needed
        paddingBottom: 0,
        backgroundColor: COLORS.white // Match the background color of the screen
    },
})

export default ChangeEmailScreen