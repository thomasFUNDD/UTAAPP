import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native'
import React, { useState, useReducer, useEffect, useCallback } from 'react'
import { FONTS } from '../constants'
import Checkbox from 'expo-checkbox'
import * as Animatable from "react-native-animatable"
import Input from '../components/Input'
import Button from '../components/Button'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import { commonStyles } from '../styles/CommonStyles'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from 'expo-router'
import { API_URL, TOKEN } from '@env' // Import environment variables
import AsyncStorage from '@react-native-async-storage/async-storage';



type Nav = {
    navigate: (value: string) => void
}

interface InputValues {
    email: string
    password: string
}

interface InputValidities {
    email: boolean | undefined
    password: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        email: '',
        password: '',
    },
    inputValidities: {
        email: false,
        password: false,
    },
    formIsValid: false,
}

const Login = () => {
    const { navigate } = useNavigation<Nav>()
    const [isLoading, setIsLoading] = useState(false)
    const [isChecked, setChecked] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)
    const [acceptTerms, setAcceptTerms] = useState(false)

    const handleTermsToggle = () => {
        setAcceptTerms(!acceptTerms)
    }

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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start' }}>
            <LinearGradient
                colors={['#a98e63', '#a98e63']}
                style={{ flex: 1, backgroundColor: '#a98e63' }}>
                <StatusBar hidden />
                <View style={commonStyles.header}>
                    <Text style={commonStyles.headerTitle}>Log In</Text>
                    <Text
                        style={commonStyles.subHeaderTitle}>Please sign in to your UTA Account</Text>
                </View>
                <Animatable.View
                    animation="fadeInUpBig"
                    style={commonStyles.footer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={{ alignSelf: 'center', width: 100, height: 100, resizeMode: 'contain' }}
                    />
                    <Text style={commonStyles.formTitle}>Welcome Back!</Text>
                    <Text style={commonStyles.inputHeader}>Email</Text>
                    <Input
                        id="email"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['email']}
                        placeholder="example@gmail.com"
                        placeholderTextColor="#000"
                    />
                    <Text style={commonStyles.inputHeader}>Password</Text>
                    <Input
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['password']}
                        id="password"
                        placeholder="*************"
                        placeholderTextColor="#000"
                        secureTextEntry={true}
                    />
    
                    <View style={commonStyles.checkBoxContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Checkbox
                                style={commonStyles.checkbox}
                                value={isChecked}
                                color={isChecked ? '#a98e63' : '#000'}
                                onValueChange={setChecked}
                            />
                            <Text style={{ ...FONTS.body4 }}>Remember me</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigate("forgotpassword")}
                        >
                            <Text style={{ ...FONTS.body4, color: '#a98e63' }}>Forgot Password ?</Text>
                        </TouchableOpacity>
                    </View>
                    <Button
  title="LOG IN"
  isLoading={isLoading}
  filled
  onPress={() => {
    setIsLoading(true); // Set loading to true when the request starts
    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jwtusername: formState.inputValues.email,
        jwtpassword: formState.inputValues.password,
      }),
    })
    .then(response => {
      const statusCode = response.status;
      if (!response.ok) {
        throw new Error(`Login Attempt Failed:\nIncorrect username and/or password.\n\n\nPlease try again.`);
      }
      return response.json();
    })
    .then(data => {
        setIsLoading(false);
        if (data.token) {
          AsyncStorage.setItem('userToken', data.token); // Save the token
          const logoutTime = Date.now() + 840000; // Current time + 14 minutes in milliseconds
          AsyncStorage.setItem('logoutTimestamp', logoutTime.toString());
          navigate('(tabs)'); // Navigate to the main app
    
          // Update time left every second
          const intervalId = setInterval(() => {
            const currentTime = Date.now();
            const timeLeft = logoutTime - currentTime;
            if (timeLeft <= 0) {
              clearInterval(intervalId);
              AsyncStorage.removeItem('userToken'); // Clear the token
              AsyncStorage.removeItem('timeLeft'); // Clear the time left
              navigate('login'); // Navigate to the login screen or any screen you use for logging out
            } else {
              // Save the time left in a human-readable format, e.g., "13:59"
              const minutes = Math.floor(timeLeft / 60000);
              const seconds = Math.floor((timeLeft % 60000) / 1000);
              const formattedTimeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              AsyncStorage.setItem('timeLeft', formattedTimeLeft);
            }
          }, 1000);
    
          // Remember to clear this interval when it's no longer needed to prevent memory leaks
          // For example, you might clear it on component unmount or after logout
        } else {
          Alert.alert('Login Failed', 'Invalid username or password');
        }
      })
      .catch(error => {
        setIsLoading(false);
        Alert.alert('Error', error.message);
      });
  }}
  style={{...commonStyles.btn, backgroundColor: '#000'}}
/>
                    <View style={commonStyles.center}>
                        <Text style={{ ...FONTS.body4, color: '#000' }}>Don't have an account?{" "}</Text>
                        <TouchableOpacity
                            onPress={() => navigate("signup")}
                        >
                            <Text style={{ ...FONTS.body4, color: '#a98e63' }}>SIGN UP</Text>
                        </TouchableOpacity>
                    </View>
                </Animatable.View>
            </LinearGradient>
        </ScrollView>
    )
}

export default Login