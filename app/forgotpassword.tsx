import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import PageContainer from '../components/PageContainer'
import { COLORS, SIZES, illustrations } from '../constants'
import { Image } from 'expo-image'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import InputLabel from '../components/InputLabel'
import Input from '../components/Input'
import { useNavigation } from 'expo-router'
import Button from '../components/Button'

type Nav = {
  navigate: (value: string) => void
}

interface InputValues {
  email: string
}

interface InputValidities {
  email: boolean | undefined
}

interface FormState {
  inputValues: InputValues
  inputValidities: InputValidities
  formIsValid: boolean
}

const initialState: FormState = {
  inputValues: {
    email: '',
  },
  inputValidities: {
    email: false,
  },
  formIsValid: false,
}


const ForgotPassword = () => {
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
      <PageContainer>
        <ScrollView>
          <Text style={styles.formTitle}>Forgot Password</Text>
          <View style={{ alignItems: "center" }}>
          <View style={{ margin: '20%' }} />

          
          </View>
          <Text style={styles.formSubtitle}>Enter your registered email below to receive</Text>
          <Text style={styles.formSubtitle}>password reset instruction</Text>
          <View style={{ margin: '10%' }} />
          <View style={{ marginVertical: 32 }}>
            <InputLabel title="Email Address" />
            <Input
              id="email"
              onInputChanged={inputChangedHandler}
              errorText={formState.inputValidities['email']}
              placeholder="example@example.com"
              placeholderTextColor={COLORS.black}
            />
          </View>
          <Button
            title="Send Verification Code"
            filled
            onPress={() => navigate('resetpassword')}
            style={styles.btn}
          />
        </ScrollView>
      </PageContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
  },
  formSubtitle: {
    fontSize: 16,
    fontFamily: "regular",
    color: "black",
    textAlign: "center",
    paddingHorizontal: 16,
    marginVertical: 2
  },
  illustration: {
    height: 179,
    width: 179,
    marginVertical: 32,
  },

  btn: {
    width: SIZES.width - 32,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    marginVertical: 16
  },
})

export default ForgotPassword