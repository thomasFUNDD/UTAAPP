import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native'
import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router'
import PageContainer from '../components/PageContainer'
import InputLabel from '../components/InputLabel'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import Input from '../components/Input'
import { COLORS, SIZES } from '../constants'
import CheckboxItem from '../components/CheckboxItem'
import Button from '../components/Button'
import { Picker } from '@react-native-picker/picker'
import DropdownPicker from 'react-native-dropdown-picker';
import ModalDropdown from 'react-native-modal-dropdown';
import axios from 'axios';
import { API_URL, TOKEN } from '@env'
import { HmacSHA256 } from 'crypto-js'; // Import environment variables
import { Image,Modal } from 'react-native';
import CryptoJS from 'crypto-js';
import DateTimePicker from '@react-native-community/datetimepicker';







type Nav = {
    navigate: (value: string) => void
}

interface InputValues {
    fullName: string
    email: string
    password: string
}

interface InputValidities {
    fullName: boolean | undefined
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
        fullName: '',
        email: '',
        password: '',
    },
    inputValidities: {
        fullName: false,
        email: false,
        password: false,
    },
    formIsValid: false,
}

const signup = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [selectedTitle, setSelectedTitle] = useState('Mr.') // Set the initial value here
    const [registrationType, setRegistrationType] = useState('individual'); // 'individual' or 'company'


    const handleTermsToggle = () => {
        setAcceptTerms(!acceptTerms)
    }

   
    const handleCreateAccount = async () => {
        const { firstName, lastName, dateOfBirth, address1, address2, city, postcode, mobile, email, web_username, web_password, secondName, companyName } = formState.inputValues;
    
        // Test values for missing fields
        const testValues = {
            homephone: '0123456789',
            nin: 'AB123456C',
        
            // Add other test values as needed
        };
    
        // Merge form input values with test values, prioritizing form input values
        const mergedValues = {
            ...testValues,
            firstName,
            lastName,
            dateOfBirth,
            address1,
            address2,
            city,
            postcode,
            mobile,
            email,
            web_username: web_username,
            web_password: web_password,
            secondName,
            companyName: companyName || 'Test Company Ltd', // Use test value if undefined
        };
    
        console.log("Input Values:", mergedValues);
    
        // Correctly parse the dateOfBirth from dd/mm/yyyy format
        const dateParts = mergedValues.dateOfBirth.split('/');
        let formattedDate = '';
        if (dateParts.length === 3) {
            const [day, month, year] = dateParts.map(part => parseInt(part, 10));
            const dob = new Date(year, month - 1, day);
    
            if (!isNaN(dob.getTime())) {
                formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
            } else {
                console.error("Invalid Date of Birth:", mergedValues.dateOfBirth);
                Alert.alert("Error", "Invalid Date of Birth");
                return;
            }
        } else {
            console.error("Date of Birth is not in the correct format:", mergedValues.dateOfBirth);
            Alert.alert("Error", "Date of Birth is not in the correct format");
            return;
        }
    
        console.log("Formatted Date of Birth:", formattedDate);
    
        const plainText = `?firstname=${mergedValues.firstName}&lastname=${mergedValues.lastName}&address1=${mergedValues.address1}&city=${mergedValues.city}&postcode=${mergedValues.postcode}&mobile=${mergedValues.mobile}&email=${mergedValues.email}&dateofbirth=${formattedDate}&web_username=${mergedValues.web_username}&web_password=${mergedValues.web_password}`;
    
        console.log("Plain Text for Hashing:", plainText);
    
        const hashed = CryptoJS.HmacSHA256(plainText, "C77052D0-31F3-4E21-A82D-E8AC969AE4E5").toString(CryptoJS.enc.Hex);
    
        console.log("Hashed Text:", hashed);
    
        const data = {
            firstname: mergedValues.firstName,
            secondname: mergedValues.secondName,
            lastname: mergedValues.lastName,
            dateofbirth: formattedDate,
            address1: mergedValues.address1,
            address2: mergedValues.address2,
            city: mergedValues.city,
            company: mergedValues.companyName,
            postcode: mergedValues.postcode,
            mobile: mergedValues.mobile,
            email: mergedValues.email,
            web_username: mergedValues.web_username,
            web_password: mergedValues.web_password,
            hashed: hashed,
            workphone: "12345678", // Test work phone number
            fax: "12345678", // Test fax number
            defaultdonationtype: "CH",
            // Add other fields from testValues as needed
        };
    
        console.log("Data Object for API Call:", data);
    
        try {
            const response = await axios.post(`${API_URL}/public/register/client`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
            });
    
            console.log("API Response Data:", response.data);
            Alert.alert('API Response', `Response Code: ${response.status}`);
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("API Call Error Response Data:", error.response.data);
                console.error("API Call Error Status:", error.response.status);
                console.error("API Call Error Headers:", error.response.headers);
                Alert.alert("API Call Error", `Error Data: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("API Call No Response:", error.request);
                Alert.alert("API Call Error", "No response was received from the server.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("API Call Error Message:", error.message);
                Alert.alert("API Call Error", error.message);
            }
        }
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
            <PageContainer>
                <ScrollView>

                <Image
                        source={require('../assets/images/logo.png')}
                        style={{ alignSelf: 'center', width: 100, height: 100, resizeMode: 'contain' }}
                    />
                    <Text style={styles.formTitle}>Welcome!</Text>

                    <View style={styles.radioButtonContainer}>
  <TouchableOpacity
    style={styles.radioButton}
    onPress={() => setRegistrationType('individual')}
  >
    <View style={[styles.outerCircle, registrationType === 'individual' && styles.selectedOuterCircle]}>
      {registrationType === 'individual' && <View style={styles.innerCircle} />}
    </View>
    <Text style={styles.radioText}>Individual</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.radioButton}
    onPress={() => setRegistrationType('company')}
  >
    <View style={[styles.outerCircle, registrationType === 'company' && styles.selectedOuterCircle]}>
      {registrationType === 'company' && <View style={styles.innerCircle} />}
    </View>
    <Text style={styles.radioText}>Company</Text>
  </TouchableOpacity>
</View>


                    <View style={{ width: '100%', alignItems: 'center' }}>
                    <InputLabel title="Title" />
                    <ModalDropdown 
                        options={['Mr.', 'Mrs.', 'Ms.']} 
                        defaultValue={selectedTitle} 
                        onSelect={(index: number, value: string) => setSelectedTitle(value)}
                        textStyle={{
                            color: 'black',
                            padding: 10,
                            borderWidth: 1,
                            borderColor: '#000',
                            borderRadius: 5,
                            fontSize: 16,
                            height: 50,
                            width: '100%', // Adjusted width
                        }}
                        dropdownTextStyle={{
                            color: 'black',
                            fontSize: 16,
                        }}
                        dropdownStyle={{
                            marginTop: 10,
                            width: '80%', // Adjusted width to match textStyle
                            borderWidth: 1,
                            borderColor: '#000',
                            borderRadius: 5,
                        }}
                    />

                    

                    <InputLabel title="First Name" />
                    <Input
                        id="firstName"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['firstName']}
                        placeholder="First Name"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Last Name */}
                    <InputLabel title="Last Name" />
                    <Input
                        id="lastName"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['lastName']}
                        placeholder="Last Name"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Second Name */}
                    <InputLabel title="Second Name" />
                    <Input
                        id="secondName"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['secondName']}
                        placeholder="Second Name"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Date of Birth */}
                    <InputLabel title="Date of Birth" />
                    <Input
                        id="dateOfBirth"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['dateOfBirth']}
                        placeholder="dd/mm/yyyy"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Address 1 */}
                    <InputLabel title="Address 1" />
                    <Input
                        id="address1"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['address1']}
                        placeholder="Address Line 1"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Address 2 */}
                    <InputLabel title="Address 2" />
                    <Input
                        id="address2"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['address2']}
                        placeholder="Address Line 2"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* City */}
                    <InputLabel title="City" />
                    <Input
                        id="city"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['city']}
                        placeholder="City"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Postcode */}
                    <InputLabel title="Postcode" />
                    <Input
                        id="postcode"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['postcode']}
                        placeholder="Postcode"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {registrationType === 'individual' && (
  <View style={styles.centeredLabelContainer}>
    <InputLabel title="NIS Number" />
    <Input
      id="nisNumber"
      onInputChanged={inputChangedHandler}
      errorText={formState.inputValidities['nisNumber']}
      placeholder="NIS Number"
      placeholderTextColor={COLORS.black}
    />
  </View>
)}

{registrationType === 'company' && (
  <View style={styles.centeredLabelContainer}>
    <InputLabel title="Company Name" />
    <Input
      id="companyName"
      onInputChanged={inputChangedHandler}
      errorText={formState.inputValidities['companyName']}
      placeholder="Company Name"
      placeholderTextColor={COLORS.black}
    />
  </View>
)}
                    
                    {/* Mobile Number */}
                    <InputLabel title="Mobile" />
                    <Input
                        id="mobile"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['mobile']}
                        placeholder="Mobile Number"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Email Address */}
                    <InputLabel title="Email Address" />
                    <Input
                        id="email"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['email']}
                        placeholder="example@example.com"
                        placeholderTextColor={COLORS.black}
                    />
                    
                    {/* Password */}


                    <InputLabel title="Username" />
                    <Input
                        id="web_username"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['web_username']}
                        placeholder="Username"
                        placeholderTextColor={COLORS.black}
                        secureTextEntry={false} // Username should not be obscured
                    />

                    <InputLabel title="Password" />
                    <Input
                        id="web_password"
                        onInputChanged={inputChangedHandler}
                        errorText={formState.inputValidities['web_password']}
                        placeholder="**********"
                        placeholderTextColor={COLORS.black}
                        secureTextEntry={true}
                    />
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '100%',
                            }}
                        >
                            <CheckboxItem
                                label=""
                                selected={acceptTerms}
                                onSelect={handleTermsToggle}
                            />

                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={styles.body6}>I accept the </Text>
                                <Text style={styles.h6}>
                                    Terms & Conditions{' '}
                                </Text>
                                <Text style={styles.body6}>And </Text>
                                <Text style={styles.h6}>Privacy Policy </Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: '100%', marginVertical: 12 }}>
                        <Button
                            title="Create Account"
                            filled
                            onPress={handleCreateAccount}
                            style={styles.filledBtn}
                        />
                        <Button
                            title="Login Now"
                            onPress={() => navigate('login')}
                            textColor={COLORS.primary}
                            style={styles.outlinedBtn}
                        />

                        <View style={styles.footerContainer}>
                            <Text style={styles.body6}>
                                Already have an account?
                            </Text>
                            <TouchableOpacity onPress={() => navigate('login')}>
                                <Text style={styles.h6}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    h6: {
        fontSize: 11,
        fontFamily: 'medium',
        color: COLORS.primary,
        textDecorationColor: COLORS.primary,
        textDecorationLine: 'underline',
    },
    body6: {
        fontSize: 11,
        fontFamily: 'regular',
        color: COLORS.black,
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filledBtn: {
        width: SIZES.width - 32,
        marginBottom: SIZES.padding,
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    outlinedBtn: {
        width: SIZES.width - 32,
        marginBottom: SIZES.padding,
        backgroundColor: 'transparent',
        borderColor: COLORS.primary,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20, // Add space between radio buttons
    },
    outerCircle: {
        height: 30, // Increased size
        width: 30, // Increased size
        borderRadius: 15, // Half of the new height/width to keep it circular
        borderWidth: 2, // Make border thicker if you like
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10, // Space between the circle and the label
    },
    selectedOuterCircle: {
        borderColor: COLORS.primary, // Use your primary color here
    },
    innerCircle: {
        height: 18, // Increased size
        width: 18, // Increased size
        borderRadius: 9, // Half of the new height/width
        backgroundColor: COLORS.primary, // Use your primary color here
    },
    radioText: {
        fontSize: 18, // Increased font size
        color: COLORS.black, // Use your text color here
    },
    centeredLabelContainer: {
        alignItems: 'center', // This will center the label horizontally
        width: '100%', // Ensure the container takes full width
        // Add any other styling that you need for the container
      },
})

export default signup
