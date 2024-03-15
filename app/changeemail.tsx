import {KeyboardAvoidingView, Platform, ScrollView, View, Text, StyleSheet, Alert, TextInput  } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState, useContext } from 'react'
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
import otherContext from '../data/otherContext';
import otherContextProvider from '../../data/otherContextProvider';
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

    const [selectedSupportType, setSelectedSupportType] = useState('generalEnquiry'); // State to hold the selected option
    const {  accountDetails } = useContext(otherContext);

    const [formState, dispatchFormState] = useReducer(reducer, {
        ...initialState,
        inputValues: {
            ...initialState.inputValues,
            currentEmail: accountDetails.em_address ? accountDetails.em_address : '',
        },
    });

    console.log(accountDetails.em_address);
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

    // Function to post data to PHP
    const postDataToPHP = async () => {
        const formData = new FormData();
        formData.append('name', formState.inputValues.name); // Assuming you have a name field
        formData.append('email', formState.inputValues.currentEmail);
        formData.append('message', formState.inputValues.message); // Assuming you have a message field
        formData.append('vaccountno', accountDetails.vaccountno); // Example account number, adjust as needed
        formData.append('department', accountDetails.em_address); // Example department email, adjust as needed
    //dd
    formData.append('enquiryType', selectedSupportType); // Append the selectedSupportType to the formData

        try {
            const response = await fetch('https://app.utauk.org/postMailContactMobile.php', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error('Failed to post data');
            }
    
            const responseData = await response.text(); // Adjusted to expect text/html response
            console.log(responseData);
            Alert.alert('Success', 'Email sent successfully');
            navigate("profile");
        } catch (error) {
            console.error("Error sending email:", response);
            console.error("Error sending email:", error);
            setError('Failed to send email');
        }
    };

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
                            <Picker.Item label="Missing Charity" value="missingCharity" />
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
    value={formState.inputValues.currentEmail} // Set the input's value to currentEmail from formState
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
                    onPress={postDataToPHP} // Use postDataToPHP here
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