import { View, Text,TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback,Switch,FlatList} from 'react-native'
import React, { useState, useEffect, useContext,useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { COLORS, SIZES, icons, images } from '../../constants'
import Slider from '@react-native-community/slider'; // Ensure this is the only Slider import
import { useNavigation } from 'expo-router'
import Button from '../../components/Button'
import Icon from 'react-native-vector-icons/Feather';
import { ScrollView } from 'react-native-virtualized-view'
import { Picker } from '@react-native-picker/picker';
import BalanceContext from '../../data/balancesContext'; // Adjust the path as necessary
import OtherContext from '../../data/otherContext'; // Adjust the import path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env'; // Assuming TOKEN is not needed here since it's fetched dynamically
import { Calendar } from 'react-native-calendars';
import { debounce } from 'lodash'; // Assuming lodash is installed
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import DateTimePicker from "react-native-modal-datetime-picker";

interface ContainerProps {
    item: string | number;
    isSelected: boolean;
    onSelect: () => void;
}

type Nav = {
    navigate: (value: string) => void
}

const data = [1, 2, 5, 20,25, 50, 100, 500, 1000, 2500];



const Container: React.FC<ContainerProps> = ({ item, isSelected, onSelect }) => (
    <TouchableOpacity
        style={[styles.amountContainer, isSelected && styles.selectedContainer]}
        onPress={onSelect}
    >
        <Text style={{
            fontSize: 14,
            fontFamily: 'medium',
            color: isSelected ? COLORS.white : "gray"
        }}>£{item}</Text>
    </TouchableOpacity>
);


const SendScreen = () => {
    const navigation = useNavigation<Nav>();
    const [modalVisible, setModalVisible] = useState(false);
    const { currentBalance } = useContext(BalanceContext);
    const { charities } = useContext(OtherContext);
    const [selectedCharity, setSelectedCharity] = useState(null);
    const [donationEditVisible, setDonationEditVisible] = useState(false); // Add this line

    const [selectedCharityNo, setSelectedCharityNo] = useState(null);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);

    const { accountDetails } = useContext(OtherContext);
    const [sliderValue, setSliderValue] = useState(0);
    const vaccountno = accountDetails.vaccountno;
    const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
    const [showPaymentReference, setShowPaymentReference] = useState(false); // Add this line

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCharities, setFilteredCharities] = useState(charities);
    const [charityModalVisible, setCharityModalVisible] = useState(false); // New state for the charity selection modal
    const [bankDetailsModalVisible, setBankDetailsModalVisible] = useState(false);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const [someState, setSomeState] = useState();
    const [debouncedValue, setDebouncedValue] = useState('');

    const CustomDatePicker = ({ isVisible, onClose, onSelectDate }) => {
      return (
        <Modal visible={isVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <Calendar
                // Theme customization
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
                // Initially visible month. Default = now
                current={new Date()}
                // Callback that gets called on day press
                onDayPress={(day) => {
                  onSelectDate(new Date(day.dateString));
                  onClose(); // Close the modal after selecting a date
                }}
                // Enable the option to swipe between months
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
    const handleSearch = (text) => {
        setSearchQuery(text);
        if (!text.trim()) {
          setFilteredCharities(charities);
        } else {
          const filtered = charities.filter((charity) =>
            charity.charity.toLowerCase().includes(text.toLowerCase())
          );
          setFilteredCharities(filtered);
        }
      };

    /**
     * Render Header
     */

    const [selectedDate, setSelectedDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);

const onDateChange = (event, newDate) => {
  const currentDate = newDate || selectedDate;
  setShowDatePicker(Platform.OS == 'ios'); // If iOS, keep the picker open.
  setSelectedDate(currentDate);
};

const showDatepicker = () => {
  setShowDatePicker(true);
};


    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(inputValue);
      }, 300); // Adjust the delay as needed
        if (selectedCharity) {
          const accounts = charities.filter(
            (charity) => charity.charity === selectedCharity
          );
          setFilteredBankAccounts(accounts);
        }
      }, [selectedCharity, charities]);



// This function should be called where you fetch and set the charities data
const updateCharities = (charitiesData) => {
  setCharities(charitiesData);
};

const toggleSwitch = () => setShowSpecialInstructions(previousState => !previousState);
const togglePaymentReference = () => setShowPaymentReference(previousState => !previousState);

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                    <Image
                        source={icons.back}
                        contentFit='contain'
                        style={styles.backIcon}
                    />
                </TouchableOpacity>
                <Text style={styles.title}>Send</Text>
                <TouchableOpacity>
                    <Image
                        source={icons.more}
                        contentFit='contain'
                        style={styles.moreIcon}
                    />
                </TouchableOpacity>
            </View>
        )
    }


    
const renderBankDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={bankDetailsModalVisible}
      onRequestClose={() => setBankDetailsModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <FlatList
            data={filteredBankAccounts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.bankAccountItem}
                onPress={() => {
                  setSelectedBankAccount(item.bnk_account_no);
                  setBankDetailsModalVisible(false);
                }}
              >
                <Text style={styles.bankAccountText}>Sort Code: {item.bnk_sort_code}</Text>
                <Text style={styles.bankAccountText}>Account No: {item.bnk_account_no}</Text>
              </TouchableOpacity>
            )}
          />
          <Button title="Close" onPress={() => setBankDetailsModalVisible(false)} />
        </View>
      </View>
    </Modal>
  );
    /**
     * Render Card Information
     */

    const renderCardInfo = () => {
        return (
            <View style={styles.cardInfoContainer}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                
                    <Text style={styles.debit}>Account Balance</Text>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <Text style={{
  fontFamily: "semiBold",
  color: COLORS.primary,
  fontSize: 16
}}>
  £{typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'}
</Text>{/* Use currentBalance here */}
               
                </View>
            </View>
        );
    };
    const sendDonation = async (sliderValue) => {
        const token = await AsyncStorage.getItem('userToken');
       console.log(accountDetails);

       console.log(charities)
        if (!token) {
            console.error("No token found");
            return;
        }
    
        const selectedCharityDetails = selectedBankAccount ? filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount) : null;
    
        if (!selectedCharityDetails) {
            console.error("No bank account selected");
            return;
        }
    
        const requestBody = {
            recipientcomment: "Your recipient comment here",
            donorcomment: "Your donor comment here",
            email: "bizzybitzgb@gmail.com",
            amount: sliderValue.toFixed(2).toString(),
            anonymous: false,
            charityno: selectedCharityNo ? selectedCharityNo.toString() : "",

            payon: new Date().toISOString().split('T')[0],
            donorid: vaccountno,
            banksortcode: selectedCharityDetails.bnk_sort_code,
            bankaccountno: selectedCharityDetails.bnk_account_no
        };
    
        console.log(requestBody);
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    
        console.log("Sending donation with payload:", requestBody);
    
        try {
            const response = await fetch(`${API_URL}/client/distributions/pay`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody)
            });
    
            if (!response.ok) {
                console.error(`Donation failed with status code: ${response.status}`);
                throw new Error(`Network response was not ok, status code: ${response.status}`);
            }
    
            // Check if the response has content based on Content-Length header
            const contentLength = response.headers.get('Content-Length');
            if (contentLength && parseInt(contentLength) > 0) {
                try {
                    const responseData = await response.json();
                    console.log("Donation successful:", responseData);
                } catch (jsonParseError) {
                    console.error("Error parsing response:", jsonParseError);
                    // Handle non-JSON response here, if necessary
                }
            } else {
                console.log("Donation successful, no content returned.");
            }
        } catch (error) {
            console.error("Donation failed:", error);
        }
    };

    const CustomButton = ({ onPress, title, buttonStyle, textStyle }) => (
      <TouchableOpacity onPress={onPress} style={[styles.customButton, buttonStyle]}>
          <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
  );

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      };
    // Render Send

    const renderSend = () => {
        const [sliderValue, setSliderValue] = useState(0);
        const [selectedContainer, setSelectedContainer] = useState(null);

        const handleSelectContainer = (item: any): void => {
            setSelectedContainer(item);
        };

        const handleSliderChange = (value) => {
            console.log("Slider value changed to:", value); // This line will log the slider's value to the console.
            setSliderValue(value);
        };

        const handleTextChange = (text) => {
  setInputValue(text);
};
          
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setPickerVisible(false); // Close the picker
  };

  



          return (
            <View style={{ marginHorizontal: 16, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            {!donationEditVisible && (
<View style={styles.detailsBox}>
  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
    <View>
      {/* Display "No Charity Selected" if selectedCharity is not available */}
      {selectedCharity ? (
        <Text style={styles.detailsText}>Charity: {selectedCharity}</Text>
      ) : (
        <Text style={styles.detailsText}>No Charity Selected</Text>
      )}

      {/* Display bank account details or "No Bank Account and No Sort Code Selected" */}
      {selectedBankAccount ? (
        <>
          <Text style={styles.detailsText}>
            Sort Code: {
              filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code || "No Sort Code Selected"
            }
          </Text>
          <Text style={styles.detailsText}>Account Number: {selectedBankAccount}</Text>
        </>
      ) : (
        <>
          <Text style={styles.detailsText}>No Sort Code Selected</Text>
          <Text style={styles.detailsText}>No Bank Account Selected</Text>
        </>
      )}
    </View>
    {selectedBankAccount && (
      <View style={styles.tickCircle}>
        <Icon name="check" size={20} color="#fff" />
      </View>
    )}
  </View>
</View>
)}

<TouchableOpacity onPress={() => setDonationEditVisible(!donationEditVisible)}>
{donationEditVisible ? (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: 5, paddingHorizontal: 20 }}>
  
    <TouchableOpacity onPress={() => setDonationEditVisible(!donationEditVisible)}>
  
      <Icon name="x" size={28} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
) : (
  <TouchableOpacity onPress={() => setDonationEditVisible(!donationEditVisible)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: 30 }}>
    <Icon name="edit" size={24} color={COLORS.primary} />
    <Text style={{ fontSize: 20, marginLeft: 10, color: COLORS.primary, fontWeight: 'bold' }}>Edit</Text>
  </TouchableOpacity>
)}
</TouchableOpacity>
            </View>
            {donationEditVisible && (
              <>
                <View style={{ paddingBottom: 10 }}>
                <TouchableOpacity onPress={() => setCharityModalVisible(true)} style={styles.bankDetailsButton}>
  <View style={styles.buttonContentContainer}>
    <Text style={{ fontSize: 18, color: COLORS.white, fontWeight: 'bold' }}>
      {selectedCharity ? "Edit Charity" : "Select Charity"}
    </Text>
    {selectedCharity && (
      <Text style={styles.bankDetailsText}>
        Selected Charity: {selectedCharity}
      </Text>
    )}
  </View>
</TouchableOpacity>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={charityModalVisible}
                    onRequestClose={() => {
                      setCharityModalVisible(!charityModalVisible);
                    }}
                  >
                    <View style={styles.modalView}>
                      <TextInput
                        placeholder="Search for a charity"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        style={styles.searchBar}
                      />
                      <FlatList
                        data={filteredCharities}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.charityItem}
                            onPress={() => {
                              setSelectedCharity(item.charity);
                              setSelectedCharityNo(item.charityno ? item.charityno : null);
                              setCharityModalVisible(!charityModalVisible);
                            }}
                          >
                            <Text>{`Charity: ${item.charity}`}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setCharityModalVisible(!charityModalVisible)}
                      >
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </Modal>
                </View>
                
                {/* Picker for selecting the bank account, shown only when a charity is selected */}
                {selectedCharity && (
                  <TouchableOpacity onPress={() => setBankDetailsModalVisible(true)} style={styles.bankDetailsButton}>
                    <View style={styles.buttonContentContainer}>
                      
                      {selectedBankAccount ? (
                          
                        <>
                         <Text style={{ fontSize: 18,color: COLORS.primary,fontWeight:'bold'}}>Edit Bank Details</Text>
                          <Text style={styles.bankDetailsTextHead}>Selected bank details</Text>
                          <Text style={styles.bankDetailsText}>
                            
                            Sort Code: {
                              filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code
                            }
                          </Text>
                          <Text style={styles.bankDetailsText}>
                            Account No: {selectedBankAccount}
                          </Text>
                        </>
                      ) : (
                          
                        <Text style={styles.bankDetailsText}>Choose Bank Account</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
{renderBankDetailsModal()}
          
          
              <View style={{ marginTop: 30, borderTopWidth: 10, borderTopColor: COLORS.primary }}>
              <Text style={{ fontSize: 18, color: "#000000",  marginTop: 20 }}>Donation Amount</Text>

              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, }}>
  <Text style={{ fontSize: 16, color: COLORS.black, paddingLeft: 10 }}>£</Text>
  <TextInput
  style={{
    flex: 1,
    fontSize: 16,
    color: 'black',
    padding: 10,
    paddingLeft: 0,
  }}
  keyboardType="numeric"
  onChangeText={handleTextChange} // This updates `inputValue` directly
  value={inputValue} // This reflects the current input state
  placeholder="Enter amount"
/>
</View>
          

          <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Donation Date</Text>
          <TouchableOpacity
  onPress={() => setPickerVisible(true)} // Directly setting the state to true when the button is pressed
  style={{ padding: 10, marginTop: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white' }}
>
  <Text>{selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}</Text>
</TouchableOpacity>
{isPickerVisible && ( // Using the correct state variable for conditional rendering
  <CustomDatePicker
    isVisible={isPickerVisible} // This prop might be redundant if you're controlling visibility through conditional rendering
    onClose={() => setPickerVisible(false)}
    onSelectDate={(date) => {
      setSelectedDate(date); // Assuming you have a state [selectedDate, setSelectedDate]
      setPickerVisible(false); // Close the picker after a date is selected
    }}
  />
)}
                <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Donation Date</Text>
                <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                  {/* Button to trigger date picker */}
                </TouchableOpacity>
                {/* Date picker component */}
          
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <Switch onValueChange={togglePaymentReference} value={showPaymentReference} />
                  <Text style={{ marginLeft: 10 }}>Donation Reference</Text>
                </View>
          
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <Switch onValueChange={toggleSwitch} value={showSpecialInstructions} />
                  <Text style={{ marginLeft: 10 }}>Add Special Instructions</Text>
                </View>

                
          
                {showSpecialInstructions && (
                  <>
                    <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Enter Special Instructions</Text>
                    <TextInput
                      style={{ fontSize: 16, color: COLORS.black, marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, width: '100%', }}
                      multiline={true}
                      numberOfLines={4}
                      onChangeText={setSpecialInstructions}
                      value={specialInstructions}
                      placeholder="Instructions..."
                    />
                  </>
                )}
          
          <Button
      title="Donate"
      onPress={async () => {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
              await sendDonation(sliderValue); // Pass the current sliderValue to your sendDonation function
              setModalVisible(true); // Set the modal visible after the donation is attempted
          } else {
              console.error("No token found");
              // Handle the case where no token is found, e.g., show an error message
          }
      }}
      filled
      style={{ marginTop: 22 }}
    />
              </View>
            </View>
          );

    }

    const renderModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
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
                                    setModalVisible(false)
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

    const renderCharitySelectionModal = () => {
        return (
          <Modal
            animationType="slide"
            transparent={true}
            visible={charityModalVisible}
            onRequestClose={() => {
              setCharityModalVisible(!charityModalVisible);
            }}
          >
            <View style={{ /* Modal styling */ }}>
              <TextInput
                placeholder="Search for a charity"
                // Implement search functionality here
              />
              <FlatList
                data={filteredCharities} // Use your state variable or array here
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      // Set selected charity and hide modal
                      setCharityModalVisible(false);
                    }}
                  >
                    <Text>{item.charity}</Text>
                  </TouchableOpacity>
                )}
              />
              <Button
                title="Close"
                onPress={() => setCharityModalVisible(false)}
              />
            </View>
          </Modal>
        );
      };

      const handleTextChange = useCallback((text) => {
        setInputValue(text);
      }, []);

      



    // Render Send



        const handleSliderChange = (value) => {
            console.log("Slider value changed to:", value); // This line will log the slider's value to the console.
            setSliderValue(value);
        };

          
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setPickerVisible(false); // Close the picker
  };
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
                {renderHeader()}
                <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                    {renderCardInfo()}
                    <KeyboardAwareScrollView >
                    <View style={{ marginHorizontal: 16, paddingBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

            {!donationEditVisible && (
<View style={styles.detailsBox}>
  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
    <View>
      {/* Display "No Charity Selected" if selectedCharity is not available */}
      {selectedCharity ? (
        <Text style={styles.detailsText}>Charity: {selectedCharity}</Text>
      ) : (
        <Text style={styles.detailsText}>No Charity Selected</Text>
      )}

      {/* Display bank account details or "No Bank Account and No Sort Code Selected" */}
      {selectedBankAccount ? (
        <>
          <Text style={styles.detailsText}>
            Sort Code: {
              filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code || "No Sort Code Selected"
            }
          </Text>
          <Text style={styles.detailsText}>Account Number: {selectedBankAccount}</Text>
        </>
      ) : (
        <>
          <Text style={styles.detailsText}>No Sort Code Selected</Text>
          <Text style={styles.detailsText}>No Bank Account Selected</Text>
        </>
      )}
    </View>
    {selectedBankAccount && (
      <View style={styles.tickCircle}>
        <Icon name="check" size={20} color="#fff" />
      </View>
    )}
  </View>
</View>
)}

<TouchableOpacity onPress={() => setDonationEditVisible(!donationEditVisible)}>
{donationEditVisible ? (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: 5, paddingHorizontal: 20 }}>
  
    <TouchableOpacity onPress={() => setDonationEditVisible(!donationEditVisible)}>
  
      <Icon name="x" size={28} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
) : (
  <TouchableOpacity onPress={() => setDonationEditVisible(!donationEditVisible)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: 30 }}>
    <Icon name="edit" size={24} color={COLORS.primary} />
    <Text style={{ fontSize: 20, marginLeft: 10, color: COLORS.primary, fontWeight: 'bold' }}>Edit</Text>
  </TouchableOpacity>
)}
</TouchableOpacity>
            </View>
            {donationEditVisible && (
              <>
                <View style={{ paddingBottom: 10 }}>
                <TouchableOpacity onPress={() => setCharityModalVisible(true)} style={styles.bankDetailsButton}>
  <View style={styles.buttonContentContainer}>
    <Text style={{ fontSize: 18, color: COLORS.white, fontWeight: 'bold' }}>
      {selectedCharity ? "Edit Charity" : "Select Charity"}
    </Text>
    {selectedCharity && (
      <Text style={styles.bankDetailsText}>
        Selected Charity: {selectedCharity}
      </Text>
    )}
  </View>
</TouchableOpacity>
                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={charityModalVisible}
                    onRequestClose={() => {
                      setCharityModalVisible(!charityModalVisible);
                    }}
                  >
                    <View style={styles.modalView}>
                      <TextInput
                        placeholder="Search for a charity"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        style={styles.searchBar}
                      />
                      <FlatList
                        data={filteredCharities}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.charityItem}
                            onPress={() => {
                              setSelectedCharity(item.charity);
                              setSelectedCharityNo(item.charityno ? item.charityno : null);
                              setCharityModalVisible(!charityModalVisible);
                            }}
                          >
                            <Text>{`Charity: ${item.charity}`}</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setCharityModalVisible(!charityModalVisible)}
                      >
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </Modal>
                </View>
                
                {/* Picker for selecting the bank account, shown only when a charity is selected */}
                {selectedCharity && (
                  <TouchableOpacity onPress={() => setBankDetailsModalVisible(true)} style={styles.bankDetailsButton}>
                    <View style={styles.buttonContentContainer}>
                      
                      {selectedBankAccount ? (
                          
                        <>
                         <Text style={{ fontSize: 18,color: COLORS.primary,fontWeight:'bold'}}>Edit Bank Details</Text>
                          <Text style={styles.bankDetailsTextHead}>Selected bank details</Text>
                          <Text style={styles.bankDetailsText}>
                            
                            Sort Code: {
                              filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code
                            }
                          </Text>
                          <Text style={styles.bankDetailsText}>
                            Account No: {selectedBankAccount}
                          </Text>
                        </>
                      ) : (
                          
                        <Text style={styles.bankDetailsText}>Choose Bank Account</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
{renderBankDetailsModal()}
          
          
              <View style={{ marginTop: 30, borderTopWidth: 10, borderTopColor: COLORS.primary }}>
              <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Donation Amount</Text>

              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, }}>
  <Text style={{ fontSize: 16, color: COLORS.black, paddingLeft: 10 }}>£</Text>
  <TextInput
  style={{
    flex: 1,
    fontSize: 16,
    color: 'black',
    padding: 10,
    paddingLeft: 0,
  }}
  keyboardType="numeric"
  onChangeText={handleTextChange} // This updates `inputValue` directly
  value={inputValue} // This reflects the current input state
  placeholder="Enter amount"
/>
</View>
          

          <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Donation Date</Text>
          <TouchableOpacity
  onPress={() => setPickerVisible(true)} // Directly setting the state to true when the button is pressed
  style={{ padding: 10, marginTop: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white' }}
>
  <Text>{selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}</Text>
</TouchableOpacity>
{isPickerVisible && ( // Using the correct state variable for conditional rendering
  <CustomDatePicker
    isVisible={isPickerVisible} // This prop might be redundant if you're controlling visibility through conditional rendering
    onClose={() => setPickerVisible(false)}
    onSelectDate={(date) => {
      setSelectedDate(date); // Assuming you have a state [selectedDate, setSelectedDate]
      setPickerVisible(false); // Close the picker after a date is selected
    }}
  />
)}
                <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Donation Date</Text>
                <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
                  {/* Button to trigger date picker */}
                </TouchableOpacity>
                {/* Date picker component */}
          
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <Switch onValueChange={togglePaymentReference} value={showPaymentReference} />
                  <Text style={{ marginLeft: 10 }}>Donation Reference</Text>
                </View>
          
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                  <Switch onValueChange={toggleSwitch} value={showSpecialInstructions} />
                  <Text style={{ marginLeft: 10 }}>Add Special Instructions</Text>
                </View>

                
          
                {showSpecialInstructions && (
                  <>
                    <Text style={{ fontSize: 18, color: COLORS.black, fontWeight: 'bold', marginTop: 20 }}>Enter Special Instructions</Text>
                    <TextInput
                      style={{ fontSize: 16, color: COLORS.black, marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, width: '100%', }}
                      multiline={true}
                      numberOfLines={4}
                      onChangeText={setSpecialInstructions}
                      value={specialInstructions}
                      placeholder="Instructions..."
                    />
                  </>
                )}
          
          <Button
      title="Donate"
      onPress={async () => {
          const token = await AsyncStorage.getItem('userToken');
          if (token) {
              await sendDonation(sliderValue); // Pass the current sliderValue to your sendDonation function
              setModalVisible(true); // Set the modal visible after the donation is attempted
          } else {
              console.error("No token found");
              // Handle the case where no token is found, e.g., show an error message
          }
      }}
      filled
      style={{ marginTop: 22,marginBottom: 65 }}
    />
              </View>
            </View>

                 
                    </KeyboardAwareScrollView>

                </View>
            </View>
            {renderModal()}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    cardInfoContainer: {
        height: 50,
        width: SIZES.width - 32,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        padding: 16,
        marginHorizontal: 16,
        top: -32,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 0,
    },
    typeCard: {
        fontSize: 4,
        fontFamily: "regular",
        color: "rgba(255,255,255,.8)"
    },
    typeCardContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    date: {
        fontSize: 4,
        fontFamily: "regular",
        color: "rgba(255,255,255,.8)"
    },
    debit: {
        fontSize: 12,
        fontFamily: "medium",
        color: COLORS.black
    },
    amount: {
        fontFamily: "semiBold",
        fontSize: 7,
        color: COLORS.white
    },
    cardNumber: {
        fontSize: 6,
        fontFamily: "medium",
        color: COLORS.white,
        marginVertical: 12
    },
    cardContainer: {
        width: 96,
        height: 62,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        marginRight: 12,
        padding: 6
    },
    bottomCardContainer: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 0
    },
    cardLogo: {
        width: 16,
        height: 9
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        marginBottom: 16,
        backgroundColor: COLORS.primary,
        height: 78
    },
    backIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.white
    },
    title: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.white,
    },
    moreIcon: {
        height: 24,
        width: 24,
        tintColor: COLORS.white
    },
    slider: {
        width: '100%',
        marginTop: 10,
        height: 40
    },
    amountContainer: {
        backgroundColor: COLORS.white,
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: 98,
        height: 48,
        borderRadius: 12,
        borderWidth: .4,
        borderColor: "gray",
        marginBottom: 10
    },
    selectedContainer: {
        backgroundColor: COLORS.primary,
    },
    subtitle: {
        fontFamily: "medium",
        fontSize: 16,
        color: COLORS.black,
        marginBottom: 12
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
        elevation: 5,
        width: '90%', // Adjust width as needed
        maxHeight: '80%', // Adjust max height as needed
      },
      searchBar: {
        width: '100%', // Ensure the search bar stretches to the modal width
        marginBottom: 20,
        paddingHorizontal: 10,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
      },
      charityItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea', // Light grey color for the separator
        width: '100%', // Ensure the item stretches to the modal width
      },
      closeButton: {
        marginTop: 20,
        backgroundColor: COLORS.primary, // Example blue color
        padding: 10,
        elevation: 2,
        borderRadius: 10,
        width: '100%', // Ensure the button stretches to the modal width
      },
      closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
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
        elevation: 5,
        width: '90%', // Adjust as needed
        maxHeight: '80%', // Adjust as needed
      },
      bankAccountItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      },
      bankAccountText: {
        fontSize: 16,
      },

      bankDetailsButton: {
        backgroundColor: COLORS.primary, // A blue background for better visibility
        padding: 10,
 marginTop: 0,
 marginBottom: 20,
        borderColor: '#0056b3', // Darker blue border for contrast
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonContentContainer: {
        alignItems: 'center', // Center the text or icon inside the button
      },
      detailsBox: {
        marginTop: 20, // Increased top margin for spacing
        padding: 16, // Increased padding for a larger touch area
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
        marginBottom: 20, // Added bottom margin for spacing below the box
    },
    detailsText: {
        fontSize: 14, // Adjusted font size for better readability
        color: '#333',
        marginBottom: 14, // Increased bottom margin for spacing between text lines
    },
    tickCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10, // Added left margin to separate from the text
    },
    bankDetailsTextHead: {
        color: '#ffffff',
        fontSize: 18, // Increased font size for better readability
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 15, // Increased bottom padding for spacing
    },
    bankDetailsText: {
        fontSize: 16, // Adjusted font size for better readability
        color: '#fff', // Ensured text color is white for visibility
        marginBottom: 5, // Added bottom margin for spacing between text lines
    },
    bankDetailsButton: {
        backgroundColor: COLORS.primary,
        padding: 12, // Increased padding for a larger touch area
        marginTop: 20, // Increased top margin for spacing above the button
        borderColor: '#0056b3',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5, // Added border radius for rounded corners
    },
    buttonContainer: {
      width: '50%', // Adjust the width as needed
      
      alignSelf: 'center', // Center the button horizontally
      // Add any other styling as needed, such as margin or padding
  },
  customButton: {
    backgroundColor: COLORS.primary, // Example background color
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
},
buttonText: {
    color: '#ffffff', // Example text color
    fontSize: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
  width: '80%',
  maxHeight: '60%',
},
dateItem: {
  padding: 10,
  borderBottomWidth: 1,
  borderBottomColor: '#ccc',
},
dateText: {
  fontSize: 16,
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
  backgroundColor: '#a98e63', // Custom color for close button background
  padding: 10,
  borderRadius: 5,
},
closeButtonText: {
  color: 'white', // Keeping close button text color white for contrast
  textAlign: 'center',
  },
})


export default SendScreen
