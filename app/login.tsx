import { View, Text, TouchableOpacity, Alert, Image, ScrollView,TextInput} from 'react-native'
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
import { Ionicons } from 'react-native-vector-icons';
import { StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

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
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleTermsToggle = () => {
        setAcceptTerms(!acceptTerms)
    }

    const inputChangedHandler = useCallback(
      (inputId: string, inputValue: string) => {
        const result = validateInput(inputId, inputValue);
        dispatchFormState({
          inputId,
          validationResult: result,
          inputValue,
        });
    
        // Call loadStoredCredentials if the inputId is "isChecked"
        if (inputId === "isChecked") {
          loadStoredCredentials(inputValue === "true");
        }
      },
      [dispatchFormState]
    );

    const loadStoredCredentials = async (rememberMe: boolean) => {
      try {
        if (rememberMe) {
          const storedEmail = await SecureStore.getItemAsync('userEmail');
          const storedPassword = await SecureStore.getItemAsync('userPassword');
    
          if (storedEmail && storedPassword) {
            // Update state to reflect stored values
            setChecked(true); // Update "Remember Me" checkbox state
            // Dispatch actions to update form state for email and password
            dispatchFormState({
              type: 'FORM_INPUT_UPDATE',
              input: 'email',
              value: storedEmail,
              isValid: true, // Assuming validation passes for stored email
            });
            dispatchFormState({
              type: 'FORM_INPUT_UPDATE ',
              input: 'password',
              value: storedPassword,
              isValid: true, // Assuming validation passes for stored password
            });
          }
        } else {
          // Clear the stored credentials if "Remember Me" is unchecked
          await SecureStore.deleteItemAsync('userEmail');
          await SecureStore.deleteItemAsync('userPassword');
          setChecked(false);
        }
      } catch (error) {
        console.error("Failed to load stored credentials securely:", error);
        // Optionally handle error, such as showing a notification
      }
    };
      
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
                        placeholder="example@gmail.com"
                        placeholderTextColor="#000"
                    />
<Text style={commonStyles.inputHeader}>Password</Text>
<View style={styles.inputContainer}>
            <TextInput
                style={styles.textInput}
                onChangeText={(text) => inputChangedHandler('password', text)}
                value={formState.inputValues.password}
                secureTextEntry={!passwordVisible}
                placeholder="Password"
                // Apply any additional TextInput props you need
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.icon}>
                <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={24} color="grey" />
            </TouchableOpacity>
        </View>
    
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
  onPress={async () => {
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
    .then(async (data) => { // Mark this function as async
      setIsLoading(false);
      if (data.token) {
        // Clear previous token and timeLeft
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('timeLeft');
        const storedTimeLeft =  AsyncStorage.getItem('timeLeft');



        // Save the new token
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('dataFetched', 'false');

        // Set logoutTime to 14 minutes from now
        const logoutTime = Date.now() + 840000; // 14 minutes in milliseconds
        await AsyncStorage.setItem('logoutTimestamp', logoutTime.toString());
        const storedTimeLeft2 =  AsyncStorage.getItem('timeLeft');

        // Navigate to the main app
        navigate('(tabs)');

        // Setup or reset the logout timer
        setupLogoutTimer(logoutTime);
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

    

// Define the setupLogoutTimer function outside of the onPress handler
function setupLogoutTimer(logoutTime) {
  // Clear any existing interval to avoid multiple timers running
  if (window.intervalId) clearInterval(window.intervalId);

  window.intervalId = setInterval(async () => {
    const currentTime = Date.now();
    const timeLeft = logoutTime - currentTime;

    if (timeLeft <= 0) {
      clearInterval(window.intervalId);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('timeLeft');
      navigate('login'); // Navigate to the login screen or any screen you use for logging out
    } else {
      // Save the time left in a human-readable format, e.g., "13:59"
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      const formattedTimeLeft = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      await AsyncStorage.setItem('timeLeft', formattedTimeLeft);
    }
  }, 5000); // Changed interval to run every 5 seconds
}

}
const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF', // Adjust the background color as needed
      borderWidth: 1,
      borderColor: 'grey', // Adjust the border color as needed
      borderRadius: 5, // Adjust for rounded corners if desired
      paddingRight: 10, // Room for the icon inside the container
    },
    textInput: {
      flex: 1,
      height: 50, // Adjust the height as needed
      paddingLeft: 10, // Spacing for the text inside the input
    },
    icon: {
      // No specific styles required for the icon itself, adjustments can be made if needed
    },
  });


export default Login