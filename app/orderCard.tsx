import React, { useCallback, useContext, useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import InputLabel from '../components/InputLabel';
import Input from '../components/Input';
import Button from '../components/Button';
import { COLORS } from '../constants';
import OtherContext from '../data/otherContext';
import { validateInput } from '../utils/actions/formActions'; // Ensure this is the correct path
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env'; // Import environment variables
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';

const ChangePasswordScreen = () => {
    const { navigate } = useNavigation();
    const { accountDetails } = useContext(OtherContext);
  
    const [formValues, setFormValues] = useState({
      title: accountDetails.title || '',
      firstName: accountDetails.firstname || '',
      lastName: accountDetails.lastname || '',
      email: accountDetails.em_address || accountDetails.email || '',
      language: 'en-GB', // Assuming default value
      nationality: 'United Kingdom',
      shippingAddress1: accountDetails.adr1 || '',
      shippingAddress2: accountDetails.adr2 || '',
      shippingAddress3: accountDetails.adr3 || '',
      country: accountDetails.city || '', // Adjust as necessary
      callingCode: '+44', // Assuming default value
      shippingCity: accountDetails.city || '',
      postcode: accountDetails.postcode || '',
      accountNumber: accountDetails.vaccountno || '',
      gender: '',
      dob: accountDetails.dateofbirth || '',
    });

    const inputChangedHandler = useCallback((inputId, inputValue) => {
      // Update the form values state
      setFormValues(prevValues => ({
        ...prevValues,
        [inputId]: inputValue,
      }));
    }, []);

    const formatDateOfBirth = (dob) => {
      const date = new Date(dob);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`; // Adjusted to DD/MM/YYYY format
    };
    const orderCard = async () => {
        try {
            console.log('Attempting to retrieve user token from AsyncStorage');
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                console.error('No user token found, user needs to login');
                Alert.alert("Error", "You need to be logged in to order a card.");
                return;
            }
    
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
    
            const formattedDob = formatDateOfBirth(formValues.dob);
            const cardholderRequestBody = {
                address1: formValues.shippingAddress1,
                address2: formValues.shippingAddress2 || '',
                address3: formValues.shippingAddress3 || '',
                city: formValues.shippingCity,
                postcode: formValues.postcode,
                country: 'GBR',
                title: formValues.title,
                firstname: formValues.firstName,
                lastname: formValues.lastName,
                email: formValues.email,
                nationality: formValues.nationality,
                dateofbirth: formattedDob,
                mobilenocuntrycode: '44',
                gender: formValues.gender.toLowerCase() === 'female' ? 'female' : 'male',
                mobile: accountDetails.mobile.replace(/\s/g, ''),
                accountno: formValues.accountNumber,
                language: formValues.language,
            };
    
            console.log('Cardholder request body:', JSON.stringify(cardholderRequestBody, null, 2));
    
            const cardholderResponse = await axios.post(`${API_URL}/qpay/cards/cardholder`, cardholderRequestBody, { headers });
            console.log('Cardholder Response:', JSON.stringify(cardholderResponse.data, null, 2));
    
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate waiting for cardholder registration
    
            const orderRequestBody = {
                firstname: formValues.firstName,
                lastname: formValues.lastName,
                shipping_address1: formValues.shippingAddress1,
                shipping_address2: formValues.shippingAddress2,
                shipping_address3: formValues.shippingAddress3,
                shipping_city: formValues.shippingCity,
                shipping_postcode: formValues.postcode,
                dateofbirth: formattedDob,
                accountno: formValues.accountNumber,
                title: formValues.title,
            };
    
            console.log('Order request body:', JSON.stringify(orderRequestBody, null, 2));
    
            const orderResponse = await axios.post(`${API_URL}/qpay/cards/order`, orderRequestBody, { headers, timeout: 5000 });
            console.log('Order Card Response:', JSON.stringify(orderResponse.data, null, 2));
    
            Alert.alert("Success: ",JSON.stringify(orderResponse.data, null, 2));

        } catch (error) {
            console.error('Order Card Error:', error);
            let errorMessage = "An error occurred while ordering the card.";
            if (error.response) {
                console.error('Error Response Body:', JSON.stringify(error.response.data, null, 2));
                errorMessage += ` Status: ${error.response.status}`;
            } else if (error.request) {
                console.error('Order Card Error Request:', error.request);
            } else {
                console.error('Order Card Error Message:', error.message);
            }
            Alert.alert("Error", errorMessage);
        }
    };
      
    return (
        <SafeAreaView style={styles.area}>
          <View style={styles.container}>
            <Header title="Apply for a UTA donor card" />
            <ScrollView style={{ margin: 16 }}>
              <InputLabel title="Title" />
              <Input
                id="title"
                onInputChanged={inputChangedHandler}
                placeholder="Select Title"
                value={formValues.title}
              />
      
              <InputLabel title="First Name" />
              <Input
                id="firstName"
                onInputChanged={inputChangedHandler}
                placeholder="First Name"
                value={formValues.firstName}
              />
      
              <InputLabel title="Last Name" />
              <Input
                id="lastName"
                onInputChanged={inputChangedHandler}
                placeholder="Last Name"
                value={formValues.lastName}
              />
      
              <InputLabel title="Email" />
              <Input
                id="email"
                onInputChanged={inputChangedHandler}
                placeholder="Email"
                value={formValues.email}
              />
      
              <InputLabel title="Language" />
              <Input
                id="language"
                value={formValues.language}
                editable={false} // Make the input uneditable
              />
      
              <InputLabel title="Nationality" />
              <Input
                id="nationality"
                value={formValues.nationality}
                editable={false} // Make the input uneditable
              />
      
              <InputLabel title="Shipping Address 1" />
              <Input
                id="shippingAddress1"
                onInputChanged={inputChangedHandler}
                placeholder="Shipping Address 1"
                value={formValues.shippingAddress1}
              />
      
              <InputLabel title="Shipping Address 2" />
              <Input
                id="shippingAddress2"
                onInputChanged={inputChangedHandler}
                placeholder="Shipping Address 2"
                value={formValues.shippingAddress2}
              />
      
              <InputLabel title="Shipping Address 3" />
              <Input
                id="shippingAddress3"
                onInputChanged={inputChangedHandler}
                placeholder="Shipping Address 3"
                value={formValues.shippingAddress3}
              />
      
              <InputLabel title="Country" />
              <Input
                id="country"
                value={formValues.country}
                editable={false} // Assuming country is derived from account details
              />
      
              <InputLabel title="Shipping City" />
              <Input
                id="shippingCity"
                onInputChanged={inputChangedHandler}
                placeholder="City"
                value={formValues.shippingCity}
              />
      
              <InputLabel title="Postcode" />
              <Input
                id="postcode"
                onInputChanged={inputChangedHandler}
                placeholder="Postcode"
                value={formValues.postcode}
              />
      
              <InputLabel title="Date of Birth" />
              <Input
                id="dob"
                onInputChanged={inputChangedHandler}
                placeholder="DD/MM/YYYY"
                value={formValues.dob}
              />
      
              <InputLabel title="Gender" />
              <RNPickerSelect
                onValueChange={(value) => inputChangedHandler('gender', value)}
                items={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                ]}
                value={formValues.gender}
                placeholder={{
                  label: 'Select gender...',
                  value: null,
                }}
              />
      
              <Button title="Order Card" onPress={orderCard} />
            </ScrollView>
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
        backgroundColor: COLORS.white
    },
    // Other styles...
});

export default ChangePasswordScreen;
