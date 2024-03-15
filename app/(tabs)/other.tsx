import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import React, { useState, useContext,useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, icons } from '../../constants';
import { FlatList } from 'react-native';
import { userCards } from '../../data';
import Card from '../../components/Card';
import { Image } from 'expo-image';
import { LineChart } from 'react-native-chart-kit';
import otherContextProvider from '../../data/otherContextProvider';
import OtherContext from '../../data/otherContext';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

// Statistic data
const data = {
  labels: ['Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
    },
  ],
};



const StatisticScreen = () => {
  const navigation = useNavigation(); // Use the useNavigation hook to get access to navigation

  const [code, setCode] = useState('');

  const { accountDetails } = useContext(OtherContext);

const mobileNumber = accountDetails.mobile; // Based on the JSON object you provided

useEffect(() => {
  sendSMS(); // This will now be called after every render of the component
}, []); // Removed dependencies array
  const renderAllDebitCard = () => {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <FlatList
          horizontal
          data={userCards}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card
              number={item.number}
              balance={item.balance}
              date={item.date}
              onPress={() => console.log("Card Pressed")}
            />
          )}
        />
      </View>
    );
  };

  const renderTwoFactorInput = () => {
    return (
      <View style={styles.twoFactorContainer}>
        <Text style={styles.twoFactorText}>Enter 2FA Code:</Text>
        <TextInput
          style={styles.twoFactorInput}
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={7}
          placeholder="123456"
        />
        <TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
          <Text style={styles.verifyButtonText}>Verify Code</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const verifyCode = async () => {
    try {
      const response = await fetch('https://app.utauk.org/verifyCodeMobile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code, // The code entered by the user
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Code verified successfully.");
        navigation.navigate('yourcard'); // Navigate to the YourCard screen

      } else {
        Alert.alert("Error", "Code verification failed.");
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert("Error", "An error occurred while verifying the code.");
    }
  };

  const sendSMS = async () => {
    try {
      const response = await fetch('https://app.utauk.org/sendMobileSMS.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber,
          // Include any sdfdsotdsfdsher data expected by your PHP script
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "SMS sent successfully.");
      } else {
        Alert.alert("Error", "Failed to send SMS.");
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert("Error", "An error occurred while sending SMS.");
    }
  };

  return (
    <SafeAreaView style={styles.area}>
      <>
        <Text style={styles.title}>2FA</Text>
        <View style={styles.container}>
          {renderTwoFactorInput()}
          <View style={styles.timeSelectionContainer}>
            <Text style={styles.twoFactorText}>
              For security reasons, a  6 or 7-digit code has been sent to your registered mobile number ending in {mobileNumber ? mobileNumber.slice(-4) : '****'}
            </Text>
          </View>
        </View>
      </>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'flex-start', // Align children to start
    paddingTop: '35%', // Push content down to half of the screen height
  },
  title: {
    fontSize: 24,
    fontFamily: "medium",
    color: COLORS.primary,
    marginVertical: 16,
    textAlign: "center",
  },
  balanceText: {
    fontSize: 14,
    fontFamily: "regular",
    color: "gray",
  },
  amount: {
    fontSize: 20,
    fontFamily: "medium",
    color: "black",
    marginTop: 6,
  },
  timeSelection: {
    width: 78,
    height: 38,
    flexDirection: "row",
    borderWidth: 0.3,
    borderColor: "gray",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  timeSelectionText: {
    fontSize: 12,
    fontFamily: "medium",
    color: "gray",
  },
  downIcon: {
    height: 8,
    width: 8,
    tintColor: "gray",
    marginLeft: 4,
  },
  timeSelectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  twoFactorContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  twoFactorText: {
    fontSize: 16,
    fontFamily: "regular",
    color: "black",
    marginBottom: 8,
  },
  twoFactorInput: {
    fontSize: 18,
    fontFamily: "medium",
    color: "black",
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
  },
  verifyButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: "medium",
  },
});

export default StatisticScreen;