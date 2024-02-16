import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'
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
import { getFormatedDate } from "react-native-modern-datepicker";
import DatePickerModal from '../components/DatePickerModal'
import { Feather } from '@expo/vector-icons'

type Nav = {
    navigate: (value: string) => void
}

interface InputValues {
    name: string
    address: string
    description: string
}

interface InputValidities {
    name: boolean | undefined
    address: boolean | undefined
    description: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        name: '',
        address: '',
        description: '',
    },
    inputValidities: {
        name: false,
        address: false,
        description: false,
    },
    formIsValid: false,
}

const ChangePersonalProfile = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)

    const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
    const today = new Date();
    const startDate = getFormatedDate(
        new Date(today.setDate(today.getDate() + 1)),
        "YYYY/MM/DD"
    );
    const [startedDate, setStartedDate] = useState("12/12/2023");

    const handleOnPressStartDate = () => {
        setOpenStartDatePicker(!openStartDatePicker);
    };

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
                <Header title="Change Personal Profile" />
                <View style={{ margin: 16 }}>
                    <InputLabel title="Name" />
                    <Input
                        id="name"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['name']}
                        placeholder=""
                        placeholderTextColor={COLORS.black}
                    />
                    <InputLabel title="Birhday" />
                    <TouchableOpacity
                        style={styles.inputBtn}
                        onPress={handleOnPressStartDate}
                    >
                        <Text>{startedDate}</Text>
                        <Feather name="calendar" size={24} color={COLORS.black} />
                    </TouchableOpacity>
                    <InputLabel title="Address" />
                    <Input
                        id="address"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['address']}
                        placeholder=""
                        placeholderTextColor={COLORS.black}
                    />
                    <InputLabel title="Description" />
                    <Input
                        id="description"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['description']}
                        placeholder=""
                        placeholderTextColor={COLORS.black}
                        secureTextEntry={true}
                    />
                </View>
                <Button
                    title="Save Profile"
                    onPress={() => navigate("profile")}
                    filled
                    style={{
                        position: "absolute",
                        bottom: 32,
                        width: SIZES.width - 32,
                        marginHorizontal: 16
                    }}
                />
            </View>
            <DatePickerModal
                open={openStartDatePicker}
                startDate={startDate}
                selectedDate={startedDate}
                onClose={() => setOpenStartDatePicker(false)}
                onChangeStartDate={(date: any) => setStartedDate(date)}
            />
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
    inputBtn: {
        borderWidth: .6,
        borderRadius: 4,
        borderColor: "gray",
        height: 50,
        paddingLeft: 8,
        fontSize: 18,
        justifyContent: "space-between",
        marginTop: 14,
        backgroundColor: COLORS.white,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingRight: 8
    },
})

export default ChangePersonalProfile