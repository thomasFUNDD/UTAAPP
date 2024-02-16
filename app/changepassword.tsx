import { View, StyleSheet, Alert } from 'react-native'
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

const ChangePasswordScreen = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)

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
                </View>
                <Button
    title="Save Password"
    onPress={() => navigate("profile")}
    filled
    style={{
        position: "absolute",
        bottom: 32,
        width: SIZES.width - 32,
        marginHorizontal: 16,
        backgroundColor: '#a98e63', // Background color of the button
        borderColor: '#a98e63', // Border color
        borderWidth: 1, // Border width
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
    }
})

export default ChangePasswordScreen