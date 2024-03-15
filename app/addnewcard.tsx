import { View, Text, Alert, StyleSheet } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { ScrollView } from "react-native-virtualized-view"
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
    creditCardNumber: string
    creditCardExpiryDate: string
    cvv: string
    creditCardHolderName: string
    addressLine1: string
    addressLine2: string
}

interface InputValidities {
    creditCardNumber: boolean | undefined
    creditCardExpiryDate: boolean | undefined
    cvv: boolean | undefined
    creditCardHolderName: boolean | undefined
    addressLine1: boolean | undefined
    addressLine2: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        creditCardNumber: '',
        creditCardExpiryDate: '',
        cvv: '',
        creditCardHolderName: '',
        addressLine1: '',
        addressLine2: '',
    },
    inputValidities: {
        creditCardNumber: false,
        creditCardExpiryDate: false,
        cvv: false,
        creditCardHolderName: false,
        addressLine1: false,
        addressLine2: false,
    },
    formIsValid: false,
}

const AddNewCardScreen = () => {
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
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                <Header title="Block Card" />
                <ScrollView style={{ marginHorizontal: 16, marginTop: 200 }}>
                    <Text style={{ marginVertical: 20, fontSize: 16, textAlign: 'center', color: COLORS.black }}>
                        Pressing this button will put a temporary block on your card. You can unblock it anytime from your dashboard.
                    </Text>
                    <Button
                        title="Block Card"
                        filled
                        onPress={() => {/* Block card logic here */}}
                        style={{
                            marginVertical: 12,
                            alignSelf: 'center'
                        }}
                    />
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    rowRightContainer: {
        width: (SIZES.width - 32) / 2 - 8,
        marginLeft: 8
    },
    rowLeftContainer: {
        width: (SIZES.width - 32) / 2 - 8,
        marginRight: 8
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "medium",
        color: "black",
        marginVertical: 12
    }
})

export default AddNewCardScreen