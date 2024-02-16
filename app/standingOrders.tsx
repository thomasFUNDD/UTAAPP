import { View, Text, useWindowDimensions, StyleSheet, FlatList, TouchableOpacity,TouchableWithoutFeedback } from 'react-native'
import React, { useContext,useState, useEffect }  from 'react'
import { Modal } from 'react-native';
import { COLORS, SIZES, icons, images } from '../constants';
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Header from '../components/Header';
import { allHistoryData, requestHistoryData, sendHistoryData } from '../data';
import HistoryCard from '../components/HistoryCard';
import OtherContextProvider from '../data/otherContextProvider'; // Adjust the path as necessary
import OtherContext from '../data/otherContext'; // Adjust the import path as necessary
import { Picker } from '@react-native-picker/picker';
import BalanceContext from '../data/balancesContext'; // Adjust the path as necessary
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { API_URL, TOKEN } from '@env' // Import environment variables
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Image } from 'expo-image'

import Button from '../components/Button'
const HistoryScreen = () => {
  const { standingOrders, charities } = useContext(OtherContext);
  const [filter, setFilter] = useState('inactive');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);
  const [showCharityPicker, setShowCharityPicker] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState('W');
  const [modalVisible, setDonationModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const formatDateForCalendar = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // JS months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // When you set the date for the Calendar component
  const dateString = formatDateForCalendar(selectedDate);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setShowCustomDatePicker(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  

  const renderDonationSucessModal = () => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
        >
            <TouchableWithoutFeedback
                onPress={() => setDonationModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.2)"

                    }}
                >
                    <View
                        style={{
                            height: 494,
                            width: SIZES.width * 0.9,
                            backgroundColor: COLORS.white,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 16
                        }}
                    >
                        <Image
                            source={images.success}
                            contentFit='contain'
                            style={{
                                height: 217,
                                width: 217,
                                marginVertical: 22
                            }}
                        />
                        <Text style={{
                            fontSize: 24,
                            fontFamily: "semiBold",
                            color: COLORS.black,
                            textAlign: "center",
                            marginVertical: 6
                        }}>Donation Successfull</Text>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: "regular",
                            color: COLORS.black,
                            textAlign: "center",
                            marginVertical: 22
                        }}>The donation will be sent once aproved</Text>
                        <Button
                            title="Continue"
                            filled
                            onPress={() => {
                              setDonationModalVisible(false)
                            }}
                            style={{
                                width: "100%",
                                marginTop: 12
                            }}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const addStandingOrder = async () => {
  // Retrieve the token from AsyncStorage
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    console.error("No token found");
    return;
  }

  if (!selectedBankAccount) {
    console.error("No bank account selected");
    return;
  }

  const requestBody = {
    email: "user@example.com", // Replace with actual email state or input
    payments: amount,
    charityno: selectedCharity, // Assuming selectedCharity holds the charity number
    payon: formatDateForCalendar(selectedDate), // Using the existing function to format date
    donorid: "donorIdHere", // Replace with actual donor ID state or input
    bnksortcode: selectedBankAccount.bnk_sort_code, // Directly using the selectedBankAccount object
    bnkaccountno: selectedBankAccount.bnk_account_no,
    mode: "ntimes", // Assuming this is static or replace with actual mode state or input
    ntimes: 3, // Replace with actual nTimes value state or input
    frequency: frequency, // Assuming frequency state holds the frequency value
  };

  console.log("Adding standing order with payload:", requestBody);

  try {
    const response = await fetch(`${API_URL}/client/standing-orders/client-to-charity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) { // Check if response status is in the range 200-299
      // Show success modal
      setDonationModalVisible(true);
    } else {
      // Handle non-successful responses
      console.error("Standing order addition failed with status:", response.status);
    }
  } catch (error) {
    console.error("Standing order addition failed:", error);
  }
};
  const isActiveOrder = (order) => order.processed !== 'P';

  const filteredOrders = standingOrders.filter((order) =>
    filter === 'active' ? isActiveOrder(order) : filter === 'inactive' ? !isActiveOrder(order) : true
  );


   useEffect(() => {
    console.log('Selected Charity:', selectedCharity);
  }, [selectedCharity]);

  useEffect(() => {
    console.log('Modal Visible:', isModalVisible);
  }, [isModalVisible]);

  useEffect(() => {
  console.log('Filtered Bank Accounts:', filteredBankAccounts);
}, [filteredBankAccounts]);


useEffect(() => {
  if (selectedCharity) {
    const accounts = charities.filter(
      (charity) => charity.charity === selectedCharity
    ).map(charity => ({
      bnk_account_no: charity.bnk_account_no,
      bnk_sort_code: charity.bnk_sort_code
    }));
    console.log('Filtered Bank Accounts:', accounts);
    setFilteredBankAccounts(accounts);
  } else {
    setFilteredBankAccounts([]);
  }
}, [selectedCharity, charities]);

  // Render the Picker with the debug handler


const CustomDatePicker = ({ isVisible, onClose, onSelectDate }) => {
    return (
      <Modal visible={isVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Calendar
              // ... Calendar props and theme
              current={dateString}
              onDayPress={(day) => {
                onSelectDate(new Date(day.dateString));
                onClose();
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                textSectionTitleDisabledColor: '#d9e1e8',
                selectedDayBackgroundColor: '#a98e63', // Custom color for selected day background
                selectedDayTextColor: '#ffffff', // Keeping selected day text color white for contrast
                todayTextColor: '#a98e63', // Custom color for today's date
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: '#00adf5',
                selectedDotColor: '#ffffff',
                arrowColor: '#a98e63', // Custom color for navigation arrows
                disabledArrowColor: '#d9e1e8',
                monthTextColor: '#a98e63', // Custom color for month and year header text
                indicatorColor: 'blue',
                textDayFontFamily: 'monospace',
                textMonthFontFamily: 'monospace',
                textDayHeaderFontFamily: 'monospace',
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 16
              }}
              enableSwipeMonths={true}
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderCharityPickerModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlayStyle}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                {/* Charity picker */}
                <Text style={styles.inputLabel}>Charity</Text>
                <View style={styles.inputContainer}>
                  <Picker
                    selectedValue={selectedCharity}
                    onValueChange={(itemValue) => setSelectedCharity(itemValue)}
                    style={{width: '100%'}}
                  >
                    {[...new Set(charities.map(charity => charity.charity))].map((charityName, index) => (
                      <Picker.Item key={index} label={charityName} value={charityName} />
                    ))}
                  </Picker>
                </View>
  
                {/* Bank account picker */}
                {selectedCharity && (
  <>
    <Text style={styles.inputLabel}>Bank Account</Text>
    <View style={styles.inputContainer}>
      <Picker
        selectedValue={selectedBankAccount}
        onValueChange={(itemValue) => setSelectedBankAccount(itemValue)}
        style={{width: '100%'}}
      >
        {filteredBankAccounts
          .filter(account => account.bnk_sort_code && account.bnk_account_no) // Filter out accounts with null sort code or account number
          .map((account, index) => (
            <Picker.Item
              key={index}
              label={`${account.bnk_sort_code} - ${account.bnk_account_no}`}
              value={account}
            />
          ))}
      </Picker>
    </View>
  </>
)}
  
                {/* Amount input */}
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    style={{width: '100%', height: 40}}
                  />
                </View>
  
                {/* Start date picker */}
                <Text style={styles.inputLabel}>Start Date</Text>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    onPress={() => setShowCustomDatePicker(true)}
                    style={{width: '100%', height: 40, justifyContent: 'center'}}
                  >
                    <Text>{formatDate(selectedDate)}</Text>
                  </TouchableOpacity>
                </View>
  
                {/* Frequency picker */}
                <Text style={styles.inputLabel}>Frequency</Text>
                <View style={styles.inputContainer}>
                  <Picker
                    selectedValue={frequency}
                    onValueChange={(itemValue) => setFrequency(itemValue)}
                    style={{width: '100%'}}
                  >
                    <Picker.Item label="Weekly" value="Weekly" />
                    <Picker.Item label="Monthly" value="Monthly" />
                    <Picker.Item label="Anually" value="Anually" />
              
                    {/* ... other frequency options */}
                  </Picker>
                </View>
  
                {/* Add standing order button */}
                <TouchableOpacity
                  style={styles.addOrderButton}
                  onPress={addStandingOrder}
                  activeOpacity={0.6}
                >
                  <Text style={styles.addOrderButtonText}>Add Standing Order</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        {showCustomDatePicker && (
          <CustomDatePicker
            isVisible={showCustomDatePicker}
            onClose={() => setShowCustomDatePicker(false)}
            onSelectDate={handleSelectDate}
          />
        )}
      </Modal>
    );
  };




  const renderStandingOrder = ({ item }) => {
    const isExpanded = item.id === expandedId;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.9}
      >
        <View>
          <Text style={styles.dateText}>{item.payon}</Text>
          <Text>Charity: {item.charityno === 756 ? 613 : item.charityno}</Text>
          <Text style={styles.amountText}>£{parseFloat(item.payments).toFixed(2)}</Text>
        </View>
        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.expandedText}>Account No: {item.accountno}</Text>
            <Text style={styles.expandedText}>Charity No: {item.charityno}</Text>
            <Text style={styles.expandedText}>Sort Code: {item.bnk_sortcode}</Text>
            <Text style={styles.expandedText}>Bank Account No: {item.bnk_accountno}</Text>
            <Text style={styles.expandedText}>Frequency: {item.frequency}</Text>
            <Text style={styles.expandedText}>Processed Status: {item.processed === 'P' ? 'Processing' : item.processed}</Text>
            <Text style={styles.expandedText}>Mode: {item.mode === 'ntimes' ? '∞' : item.mode}</Text>
            <Text style={styles.expandedText}>Created: {new Date(item.last_modified).toLocaleDateString()} {new Date(item.last_modified).toLocaleTimeString()}</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => sendCancellationEmail(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.area}>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, filter === 'active' && styles.activeButton]}
          onPress={() => setFilter('active')}
          activeOpacity={0.6}
        >
          <Text style={styles.buttonText}>Active Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, filter === 'inactive' && styles.activeButton]}
          onPress={() => setFilter('inactive')}
          activeOpacity={0.6}
        >
          {renderCharityPickerModal()}
          <Text style={styles.buttonText}>Inactive Orders</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.addButtonContainer}>
      <TouchableOpacity
  style={styles.addButton}
  onPress={() => setModalVisible(true)}
  activeOpacity={0.6}
>
  <Text style={styles.addButtonText}>Add New Standing Order</Text>
</TouchableOpacity>
      </View>
      <FlatList
  data={filteredOrders}
  renderItem={renderStandingOrder}
  keyExtractor={(item) => item.id.toString()}
  extraData={expandedId} // Ensure FlatList updates when expandedId changes
  contentContainerStyle={{ paddingBottom: 120 }} // Add padding at the bottom
/>
{renderDonationSucessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 
  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-end',
  },
  area: {
    flex: 1,
    backgroundColor: '#fff', // Set the background color to white
  },
  card: {
    backgroundColor: '#fff', // Ensure card background is also white if needed
    borderRadius: 10,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa', // Light grey background for the button container
  },
  button: {
    backgroundColor: '#e7e7e7', // Light grey background for buttons
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
    // Add transition effect for background color change
  },
  activeButton: {
    backgroundColor: '#a98e63', // Primary color for active button
    borderColor: '#8c7a50', // A darker shade for the border of the active button
  },
  buttonText: {
    color: '#fff', // White text for better contrast on the primary color
    fontWeight: '600',
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 16, // Match the horizontal padding of the cards
    paddingTop: 10, // Add some padding at the top
  },
  addButton: {
    backgroundColor: '#a98e63', // Use the primary color for the add button
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8c7a50', // A darker shade for the border
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
  },
  addButtonText: {
    color: '#fff', // White text for better contrast
    fontWeight: '600',
    fontSize: 16, // Slightly larger font size
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Increased width for better spacing
    alignSelf: 'center',
  },

  addOrderButton: {
    height: 48,
    backgroundColor: '#a98e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Increased top margin for better spacing
    width: '80%', // Match the width of the picker container
    borderRadius: 5,
    alignSelf: 'center', // Center the button
  },
  addOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10, // Increased bottom margin for better spacing
    fontWeight: 'bold',
    alignSelf: 'flex-start', // Align to the start of the flex container
    width: '80%', // Label width to match picker container
    marginLeft: '10%', // Adjusted to center the label above the picker
    
  },
  pickerContainer: {
    borderColor: '#a98e63', // Set the border color
    borderWidth: 1, // Set the border width
    borderRadius: 5, // Optional: if you want rounded corners
    marginBottom: 10,
    width: '100%', // Ensure the container fills its parent
    backgroundColor: 'black', // Set a background color if necessary
    // If you're on Android and the Picker still doesn't show the border, try adding overflow: 'hidden'
    overflow: 'hidden',
  },

  pickerStyle: {
    height: 48,
    width: '100%',
  },
  textInputStyle: {
    height: 48,
    width: '80%', // Match the width of the picker container
    marginBottom: 20, // Increased bottom margin for better spacing
    borderColor: '#ced4da', // Add border color
    borderWidth: 1, // Add border width
    paddingHorizontal: 10, // Inner horizontal padding
    alignSelf: 'center', // Center the text input
  },
  overlayStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  inputContainer: {
    borderColor: '#a98e63', // Your specified border color
    borderWidth: 1, // Set the border width
    borderRadius: 5, // Optional: if you want rounded corners
    marginBottom: 10, // Keep some space between inputs
    width: '100%', // Full width of the modal
  },
  inputStyle: {
    borderColor: '#a98e63', // Make sure this color is visible against the background
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    height: 48,
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: '#FFFFFF', // Set a background color to ensure the border is visible
  },
  
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#a98e63',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary, // Red color for cancellation
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#ffffff', // White text color
    textAlign: 'center',
  },
  expandedText: {
    marginBottom: 8, // Add some bottom margin for spacing
    // Other styling for expanded section text if needed
  },
  // ... other styles ...
});

export default HistoryScreen