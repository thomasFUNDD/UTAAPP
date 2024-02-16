import { View, StyleSheet, Alert, Modal, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import Header from '../components/Header'
import InputLabel from '../components/InputLabel'
import { validateInput } from '../utils/actions/formActions'
import { reducer as importedFormReducer } from '../utils/reducers/formReducers' // Imported here
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL, TOKEN } from '@env' // Import environment variables
import axios from 'axios';
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












const ChangePasswordScreen = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [pinError, setPinError] = useState<string | undefined>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pin, setPin] = useState<string | null>(null);

    const [countdown, setCountdown] = useState(20); // Initialize countdown state

    
    const fetchPin = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
      
          axios({
            method: 'get',
            url: `${API_URL}/qpay/cards/pin`,
            headers: headers,
          })
          .then(response => {
            setPin(String(response.data)); // Set the PIN
            setCountdown(20); // Reset countdown to 20 seconds
            const interval = setInterval(() => {
              setCountdown((currentCountdown) => {
                if (currentCountdown <= 1) {
                  clearInterval(interval); // Clear interval when countdown reaches 0
                  setPin(null); // Hide the PIN
                  return 0;
                }
                return currentCountdown - 1; // Decrease countdown
              });
            }, 1000); // Decrease every second
          })
          .catch(error => {
            if (error.response && error.response.status === 417) {
              setPin("No Card Found"); // Set pin to "No Card Found" if status code is 417
            } else {
              console.error('Axios error:', error);
            }
          });
        } else {
          Alert.alert('No userToken', 'userToken is not set');
        }
      };
    
    // Use useEffect to update the PIN error and modal visibility based on the latest state
    return (
        <SafeAreaView style={styles.area}>
          <View style={styles.container}>
            <Header title="Reveal Pin" />
            {!pin && (
              <>
                <Text style={styles.disclaimerTitle}>Disclaimer:</Text>
                <Text style={styles.disclaimerText}>
                  {'\n'}• Your PIN is confidential and key to your financial and informational security.
                  {'\n'}• Sharing your PIN can lead to unauthorized access and potential losses.
                  {'\n'}• Ensure privacy and security before revealing your PIN.
                  {'\n'}• Your PIN will be visible for 20 seconds upon pressing "Reveal my pin".
                  {'\n'}• Avoid writing down or storing your PIN where others can access it.
                  {'\n'}• You are responsible for any consequences of disclosing your PIN.
                </Text>
              </>
            )}
            {pin && (
              <View style={styles.pinContainer}>
                <Text style={styles.pinText}>Your PIN: {pin}</Text>
                <Text style={styles.pinText}>Time remaining: {countdown}s</Text>
              </View>
            )}
            <Button
              title="Reveal Pin"
              color="#a98e63"
              onPress={fetchPin}
            />
          </View>
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
        paddingBottom:30,
        paddingHorizontal: 20,
        justifyContent: 'space-between', // Add this
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
      pinText: {
        fontSize: 24, // Adjust this to change the size of the text
        textAlign: 'center', // Center the text
      },
      disclaimerTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 0,
        marginBottom: 10,
        textAlign: 'center',
      },
      disclaimerText: {
        marginHorizontal: 10,
        fontSize: 14,
        lineHeight: 28,
      },
})

export default ChangePasswordScreen