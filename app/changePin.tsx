import { View, StyleSheet, Alert, Modal, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import Header from '../components/Header'
import InputLabel from '../components/InputLabel'
import { validateInput } from '../utils/actions/formActions'
import { reducer as importedFormReducer } from '../utils/reducers/formReducers' // Imported here

// ...


import Input from '../components/Input'
import { useNavigation } from 'expo-router'
import Button from '../components/Button'

type Nav = {
    navigate: (value: string) => void
}

interface InputValues {
    newPin: string
    confirmNewPin: string
}

interface InputValidities {
    newPin: boolean | undefined
    confirmNewPin: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        newPin: '',
        confirmNewPin: ''
    },
    inputValidities: {
        newPin: false,
        confirmNewPin: false
    },
    formIsValid: false,
};










const reducer = (state, action) => {
    switch (action.type) {
        case 'FORM_INPUT_UPDATE':
            const updatedInputValues = {
                ...state.inputValues,
                [action.input]: action.value,
            };
            const updatedInputValidities = {
                ...state.inputValidities,
                [action.input]: action.isValid,
            };
            const updatedFormIsValid = Object.values(updatedInputValidities).every(isValid => isValid);
            return {
                ...state,
                inputValues: updatedInputValues,
                inputValidities: updatedInputValidities,
                formIsValid: updatedFormIsValid,
            };
        // ... other cases ...
        default:
            return state;
    }
};

const formReducer = (state, action) => {
    console.log('Reducer called with state:', state, 'and action:', action);
    switch (action.type) {
        case 'FORM_INPUT_UPDATE':
            const updatedInputValues = {
                ...state.inputValues,
                [action.input]: action.value,
            };
            const updatedInputValidities = {
                ...state.inputValidities,
                [action.input]: action.isValid,
            };
            const updatedFormIsValid = Object.values(updatedInputValidities).every(isValid => isValid);
            return {
                ...state,
                inputValues: updatedInputValues,
                inputValidities: updatedInputValidities,
                formIsValid: updatedFormIsValid,
            };
        // ... other cases ...
        default:
            return state;
    }
};

const ChangePasswordScreen = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [pinError, setPinError] = useState<string | undefined>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formState, dispatchFormState] = useReducer(formReducer, initialState);
        const inputChangedHandler = useCallback(
        (inputId, inputValue) => {
            console.log(`inputChangedHandler called: inputId=${inputId}, inputValue=${inputValue}`);
            const result = validateInput(inputId, inputValue);
            const isValid = result ? result.isValid : false;
    
            dispatchFormState({
                type: 'FORM_INPUT_UPDATE',
                value: inputValue,
                isValid: isValid,
                input: inputId,
            });
        },
        [dispatchFormState]
    );



    
    // Use useEffect to update the PIN error and modal visibility based on the latest state
    useEffect(() => {
        console.log('Effect triggered: newPin and confirmNewPin have changed.');

        const newPin = formState.inputValues.newPin;
        const confirmNewPin = formState.inputValues.confirmNewPin;

        console.log(`New PIN: ${newPin}, Confirm New PIN: ${confirmNewPin}`);

        if (newPin && confirmNewPin) {
            if (newPin === confirmNewPin) {
                console.log('The PINs match. Setting modal visibility to true.');
                setPinError(undefined);
                setIsModalVisible(true);
            } else {
                console.log('The PINs do not match. Setting modal visibility to false.');
                setPinError('The PINs do not match');
                setIsModalVisible(false);
            }
        } else {
            console.log('One or both PINs are empty. Setting modal visibility to false.');
            setPinError(undefined);
            setIsModalVisible(false);
        }
    }, [formState.inputValues.newPin, formState.inputValues.confirmNewPin]);
    return (
        <SafeAreaView style={styles.area}>
            <View style={styles.container}>
                <Header title="Change Pin" />
                <View style={{ margin: 16 }}>
                    <InputLabel title="Enter New Pin" />
                    <Input
                        id="newPin"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['newPin'] || pinError}
                        placeholder="****"
                        placeholderTextColor={COLORS.black}
                        keyboardType="numeric"
                    />
                    <InputLabel title="Confirm New Pin" />
                    <Input
                        id="confirmNewPin"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['confirmNewPin'] || pinError}
                        placeholder=""
                        placeholderTextColor={COLORS.black}
                        keyboardType="numeric"
                    />
                </View>
                <Button
                    title="Update pin"
                      color="#a98e63"

                    onPress={() => {
                        // This will trigger the useEffect above if the PINs match
                        dispatchFormState({
                        type: 'FORM_INPUT_UPDATE',
                        value: formState.inputValues.newPin,
                        isValid: true, // Assuming the PIN is valid for this example
                        input: 'newPin',
                        });
                        dispatchFormState({
                        type: 'FORM_INPUT_UPDATE',
                        value: formState.inputValues.confirmNewPin,
                        isValid: true, // Assuming the PIN is valid for this example
                        input: 'confirmNewPin',
                        });
                    }}
                    style={formState.inputValues.newPin !== formState.inputValues.confirmNewPin ? styles.hidden : null}
                />
               <Modal
  animationType="slide"
  transparent={true}
  visible={isModalVisible}
  onRequestClose={() => {
    setIsModalVisible(!isModalVisible);
  }}
>
  <View style={styles.centeredView}>
    <View style={styles.modalView}>
      <Text style={styles.modalText}>
        Hi there!{"\n"}{"\n"}
        We wanted to let you know that when you change your card PIN online, an extra step is needed to update it on your actual card:{"\n"}{"\n"}
        After changing your PIN online, please make a chip & PIN purchase using your OLD PIN. This will push the new PIN to your card.{"\n"}{"\n"}
        It's important to remember that you'll need your old PIN for the next transaction to complete the update process. If you need to reveal your old PIN, please use the button below.
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.buttonClose]}
        onPress={() => setIsModalVisible(!isModalVisible)}
      >
        <Text style={styles.textStyle}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: "#a98e63",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    hidden: {
        display: 'none',
      },
})

export default ChangePasswordScreen