
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Switch, FlatList, ActivityIndicator,ScrollView } from 'react-native';
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { COLORS, SIZES, icons, images } from '../../constants';
import { useNavigation } from 'expo-router';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Feather';
import BalanceContext from '../../data/balancesContext';
import OtherContext from '../../data/otherContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';


const CustomDatePicker = React.memo(({ isVisible, onClose, onSelectDate }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectDate = useCallback((day) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
    onSelectDate(newDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })); // Format the date as month text
    onClose(); // Close the modal after selection
  }, [onClose, onSelectDate]);

  const calendarTheme = useMemo(() => ({
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    textSectionTitleDisabledColor: '#d9e1e8',
    selectedDayBackgroundColor: COLORS.primary, // Use COLORS.primary for selected day background
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#a98e63',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#00adf5',
    selectedDotColor: '#ffffff',
    arrowColor: '#a98e63',
    disabledArrowColor: '#d9e1e8',
    monthTextColor: COLORS.primary, // Set month text color to primary

    textDayFontFamily: 'monospace',
    textMonthFontFamily: 'monospace',
    textDayHeaderFontFamily: 'monospace',
    textDayFontWeight: '300',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16,
  }), []);

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.pickerContainer}>
          <Calendar
            theme={calendarTheme}
            current={selectedDate || new Date()}
            onDayPress={handleSelectDate}
            enableSwipeMonths={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});






const SendScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const { currentBalance } = useContext(BalanceContext);
  const { charities } = useContext(OtherContext);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedCharityNo, setSelectedCharityNo] = useState(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);
  const [showDonationReference, setShowDonationReference] = useState(false);
  const [donationReference, setDonationReference] = useState('');
  const { accountDetails } = useContext(OtherContext);
  const vaccountno = accountDetails.vaccountno;
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetailsModalVisible, setBankDetailsModalVisible] = useState(false);
  const [donationEditVisible, setDonationEditVisible] = useState(false);
  const [charityModalVisible, setCharityModalVisible] = useState(false);
  const [isPickerVisible, setPickerVisible] = useState(false);

  const CharitySelectionModal = React.memo(({
    visible,
    onClose,
    setSelectedCharity,
    setSelectedCharityNo,
    charities,
  }) => {
    const [inputValue, setInputValue] = useState("");
    const { uniqueCharities } = useContext(OtherContext);
  
    const filteredCharities = useMemo(() => {
      if (inputValue.trim() === "") {
        return uniqueCharities;
      } else {
        return uniqueCharities.filter(charity =>
          charity.charity.toLowerCase().includes(inputValue.toLowerCase()) ||
          (charity.regchar && charity.regchar.toLowerCase().includes(inputValue.toLowerCase()))
        );
      }
    }, [inputValue, uniqueCharities]);
  
    const handleSearchChange = useCallback((value) => {
      setInputValue(value);
    }, []);
  
    const renderItem = useCallback(({ item }) => (
      <TouchableOpacity
        style={styles.charityItem}
        onPress={() => {
          setSelectedCharity(item.charity);
          setSelectedCharityNo(item.charityno);
          onClose();
        }}
      >
        <Text style={styles.charityItemText}>{item.charity}</Text>
      </TouchableOpacity>
    ), [setSelectedCharity, setSelectedCharityNo, onClose]);
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.searchBarContainer}>
            <TextInput
              placeholder="Search for a charity or Reg Charity No"
              value={inputValue}
              onChangeText={handleSearchChange}
              style={styles.searchBar}
              autoCorrect={false}
            />
          </View>
          <FlatList
            data={filteredCharities}
            keyExtractor={(item, index) => `charity-${index}`}
            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            style={styles.charityList}
          />
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  });

  const { uniqueCharities } = useContext(OtherContext);
  useFocusEffect(
    useCallback(() => {
      resetStates();
    }, [])
  );
  const resetStates = () => {
    setSelectedCharity(null);
    setSelectedCharityNo(null);
    setSelectedBankAccount(null);
    setFilteredBankAccounts([]);
    setShowDonationReference(false);
    setDonationReference('');
    setShowSpecialInstructions(false);
    setSpecialInstructions('');
    setInputValue('');
    setSelectedDate(new Date());
    setErrorMessage('');
    setIsLoading(false);
    setBankDetailsModalVisible(false);
    setDonationEditVisible(false);
    setCharityModalVisible(false);
    setPickerVisible(false);
  };
  useEffect(() => {

    
    if (selectedCharity) {
      const accounts = charities.filter(
        (charity) => charity.charity === selectedCharity
      );
      setFilteredBankAccounts(accounts);
  
      // Reset the selected bank account only if there are no matching accounts for the selected charity
      if (accounts.length === 0 || !accounts.some(account => account.bnk_account_no === selectedBankAccount)) {
        setSelectedBankAccount(null);
      }
    } else {
      setFilteredBankAccounts([]);
      setSelectedBankAccount(null);
    }
  }, [selectedCharity, charities, selectedBankAccount]);

  const toggleSwitch = useCallback(() => setShowSpecialInstructions(previousState => !previousState), []);

  const renderHeader = useCallback(() => {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={icons.back} contentFit='contain' style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Donate</Text>
        <TouchableOpacity>
          <Image source={icons.more} contentFit='contain' style={styles.moreIcon} />
        </TouchableOpacity>
      </View>
    );
  }, [navigation]);

  const contactSupport = useCallback(() => {
    navigation.navigate('changeemail', {
      selectedCharity,
      selectedCharityNo,
      selectedBankAccount,
    });
  }, [navigation, selectedCharity, selectedCharityNo, selectedBankAccount]);

  const renderBankDetailsModal = useCallback(() => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={bankDetailsModalVisible}
      onRequestClose={() => setBankDetailsModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {filteredBankAccounts.length > 0 && filteredBankAccounts.some(account => account.bnk_sort_code && account.bnk_account_no) ? (
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
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              windowSize={10}
            />
          ) : (
            <View style={styles.noBankAccountsContainer}>
              <Text style={styles.noBankAccountsText}>
                No bank accounts available. Please contact support for assistance.
              </Text>
              <TouchableOpacity
                onPress={contactSupport}
                style={styles.contactSupportButton}
              >
                <Text style={styles.contactSupportButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          )}
          <Button title="Close" onPress={() => setBankDetailsModalVisible(false)} />
        </View>
      </View>
    </Modal>
  ), [bankDetailsModalVisible, filteredBankAccounts, setBankDetailsModalVisible, contactSupport]);

  const renderCardInfo = useCallback(() => {
    return (
      <View style={styles.cardInfoContainer}>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>Account Balance</Text>
        </View>
        <View style={styles.balanceValueContainer}>
          <Text style={styles.balanceValueText}>
            £{typeof currentBalance === 'number' ? currentBalance.toFixed(2) : '0.00'}
          </Text>
        </View>
      </View>
    );
  }, [currentBalance]);

  const sendDonation = useCallback(async () => {
    const donationAmount = parseFloat(inputValue);
    if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      return false;
    }

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.error("No token found");
      setErrorMessage("Authentication failed. Please log in again.");
      return false;
    }

    const selectedBankAccountDetails = selectedBankAccount ? filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount) : null;
    if (!selectedBankAccountDetails) {
      console.error("No bank account selected");
      setErrorMessage("Please select a bank account for the donation.");
      return false;
    }

    const requestBody = {
      recipientcomment: specialInstructions,
      donorcomment: "Your donor comment here",
      email: "bizzybitzgb@gmail.com",
      amount: donationAmount.toFixed(2).toString(),
      anonymous: false,
      charityno: selectedCharityNo ? selectedCharityNo.toString() : "",
      payon: new Date().toISOString().split('T')[0],
      donorid: vaccountno,
      banksortcode: selectedBankAccountDetails.bnk_sort_code,
      bankaccountno: selectedBankAccountDetails.bnk_account_no
    };

    console.log(requestBody);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/client/distributions/pay`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error(`Donation failed with status code: ${response.status}`);
        setErrorMessage(`Donation failed with status code: ${response.status}. Please try again.`);
        setIsLoading(false);
        return false;
      }

      const contentLength = response.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength) > 0) {
        const responseData = await response.json();
        console.log("Donation successful:", responseData);
      } else {
        console.log("Donation successful, no content returned.");
      }

      setModalVisible(true);
      setSelectedCharityNo(null);
      setSelectedCharity(null);
      setSelectedBankAccount(null);
      setDonationReference('');
      setSpecialInstructions('');
      setInputValue('');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Donation failed:", error);
      setErrorMessage("Donation failed due to an unexpected error. Please try again.");
      setIsLoading(false);
      return false;
    }
  }, [inputValue, selectedBankAccount, specialInstructions, selectedCharityNo, vaccountno]);


const handleTextChange = useCallback((text) => {
  setInputValue(text);
}, []);

const renderModal = useCallback(() => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        resetStates();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalWindow}>
          <Text style={styles.modalTitle}>Donation Successful</Text>
          <Text style={styles.modalText}>The donation will be sent once approved</Text>
          <View style={styles.modalButtonContainer}>
            <Button
              title="Home"
              filled
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('index');
              }}
              style={styles.modalButton}
            />
            <Button
              title="New Donation"
              onPress={() => {
                setModalVisible(false);
                resetStates();
              }}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}, [modalVisible, navigation, resetStates]);

const renderContent = useMemo(() => {
  return (
    <>
      <ScrollView>
        <View style={styles.detailsContainer}>
          {(selectedCharity && selectedBankAccount) && !donationEditVisible && (
            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}>
                <View style={styles.detailsTextContainer}>
                  <Text style={styles.detailsText}>Charity: {selectedCharity}</Text>
                  <Text style={styles.detailsText}>
                    Sort Code: {
                      filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code || "No Sort Code Selected"
                    }
                  </Text>
                  <Text style={styles.detailsText}>Account Number: {selectedBankAccount}</Text>
                </View>
                <TouchableOpacity onPress={() => setDonationEditVisible(true)} style={styles.editButton}>
                  <Icon name="edit" size={24} color={COLORS.primary} />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {donationEditVisible && (
            <>
              <Text style={styles.sectionTitle}>Charity</Text>
              <TouchableOpacity onPress={() => setCharityModalVisible(true)} style={styles.charityButton}>
                <Text style={styles.charityButtonText} numberOfLines={1} ellipsizeMode="tail">
                  {selectedCharity ? selectedCharity : "Select Charity"}
                </Text>
              </TouchableOpacity>
              <CharitySelectionModal
                visible={charityModalVisible}
                onClose={() => setCharityModalVisible(false)}
                setSelectedCharity={setSelectedCharity}
                setSelectedCharityNo={setSelectedCharityNo}
                charities={charities}
              />
              <Text style={styles.sectionTitle}>Bank Account</Text>
              <TouchableOpacity onPress={() => setBankDetailsModalVisible(true)} style={styles.bankDetailsButton}>
                {selectedBankAccount ? (
                  <>
                    <Text style={styles.bankDetailsText} numberOfLines={1} ellipsizeMode="tail">
                      Sort Code: {filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code}
                    </Text>
                    <Text style={styles.bankDetailsText} numberOfLines={1} ellipsizeMode="tail">
                      Account No: {selectedBankAccount}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.bankDetailsText}>Choose Bank Account</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDonationEditVisible(false)} style={{ backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 8, marginVertical: 8 }}>
                <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
          {(!selectedCharity || !selectedBankAccount) && !donationEditVisible && (
            <>
              <Text style={styles.sectionTitle}>Charity</Text>
              <TouchableOpacity onPress={() => setCharityModalVisible(true)} style={styles.charityButton}>
                <Text style={styles.charityButtonText} numberOfLines={1} ellipsizeMode="tail">
                  {selectedCharity ? selectedCharity : "Select Charity"}
                </Text>
              </TouchableOpacity>
              <CharitySelectionModal
                visible={charityModalVisible}
                onClose={() => setCharityModalVisible(false)}
                setSelectedCharity={setSelectedCharity}
                setSelectedCharityNo={setSelectedCharityNo}
                charities={charities}
              />
              <Text style={styles.sectionTitle}>Bank Account</Text>
              <TouchableOpacity onPress={() => setBankDetailsModalVisible(true)} style={styles.bankDetailsButton}>
                {selectedBankAccount ? (
                  <>
                    <Text style={styles.bankDetailsText} numberOfLines={1} ellipsizeMode="tail">
                      Sort Code: {filteredBankAccounts.find(account => account.bnk_account_no === selectedBankAccount)?.bnk_sort_code}
                    </Text>
                    <Text style={styles.bankDetailsText} numberOfLines={1} ellipsizeMode="tail">
                      Account No: {selectedBankAccount}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.bankDetailsText}>Choose Bank Account</Text>
                )}
              </TouchableOpacity>
            </>
          )}
          {renderBankDetailsModal()}
          <Text style={styles.sectionTitle}>Donation Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputPrefix}>£</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={handleTextChange}
              value={inputValue}
              placeholder="Enter amount"
            />
          </View>
          <Text style={styles.sectionTitle}>Donation Date</Text>
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerButtonText}>
              {selectedDate ? selectedDate.toLocaleDateString() : new Date().toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <CustomDatePicker
            isVisible={isPickerVisible}
            onClose={() => setPickerVisible(false)}
            onSelectDate={setSelectedDate}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Add Donation Reference</Text>
            <Switch
              onValueChange={() => setShowDonationReference(!showDonationReference)}
              value={showDonationReference}
              trackColor={{ false: "#767577", true: COLORS.primary }}
              thumbColor={showDonationReference ? COLORS.primary : "#f4f3f4"}
            />
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Add Special Instructions</Text>
            <Switch
              onValueChange={toggleSwitch}
              value={showSpecialInstructions}
              trackColor={{ false: "#767577", true: COLORS.primary }}
              thumbColor={showSpecialInstructions ? COLORS.primary : "#f4f3f4"}
            />
          </View>
          {showDonationReference && (
            <>
              <Text style={styles.sectionTitle}>Enter Donation Reference</Text>
              <TextInput
                style={styles.textArea}
                multiline={true}
                numberOfLines={2}
                onChangeText={setDonationReference}
                value={donationReference}
                placeholder="Reference..."
              />
            </>
          )}
          {showSpecialInstructions && (
            <>
              <Text style={styles.sectionTitle}>Enter Special Instructions</Text>
              <TextInput
                style={styles.textArea}
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
            onPress={sendDonation}
            filled
            style={styles.donateButton}
          />
        </View>
      </ScrollView>
    </>
  );
}, [
  selectedCharity,
  selectedBankAccount,
  filteredBankAccounts,
  donationEditVisible,
  setDonationEditVisible,
  charityModalVisible,
  setCharityModalVisible,
  setSelectedCharity,
  setSelectedCharityNo,
  bankDetailsModalVisible,
  setBankDetailsModalVisible,
  renderBankDetailsModal,
  inputValue,
  handleTextChange,
  selectedDate,
  isPickerVisible,
  setPickerVisible,
  setSelectedDate,
  showDonationReference,
  setShowDonationReference,
  showSpecialInstructions,
  toggleSwitch,
  donationReference,
  setDonationReference,
  specialInstructions,
  setSpecialInstructions,
  sendDonation,
  charities,
]);

return (
  <>
    <SafeAreaView style={{ flex: 0, backgroundColor: COLORS.primary }}>
      {renderHeader()}
    </SafeAreaView>
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView style={styles.contentContainer}>
        {renderCardInfo()}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
        ) : (
          renderContent
        )}
      </KeyboardAwareScrollView>
      {renderModal()}
    </SafeAreaView>
  </>
);

};
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 20,
      marginBottom: 24, // Add margin to the bottom
    },
    // ...
    donateButton: {
      marginTop: 24,
      marginBottom: 48, // Increase the bottom margin
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center", // Add this line to center the content vertically
      paddingHorizontal: 16,
      paddingTop: 30,
      marginBottom: 16,
      backgroundColor: COLORS.primary,
      height: 58,
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: COLORS.white,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.white,
    },
    moreIcon: {
      width: 24,
      height: 24,
      tintColor: COLORS.white,
    },
    cardInfoContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
      shadowColor: COLORS.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    balanceContainer: {
      flex: 1,
    },
    balanceText: {
      fontSize: 16,
      color: COLORS.black,
      fontWeight: "bold",
    },
    balanceValueContainer: {
      alignItems: "flex-end",
    },
    balanceValueText: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.primary,
    },
    detailsContainer: {
      marginTop: 24,
    },
    detailsBox: {
      backgroundColor: COLORS.lightGray,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    detailsTextContainer: {
      flex: 1,
    },
    detailsText: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: 8,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    editButtonText: {
      fontSize: 16,
      color: COLORS.primary,
      marginLeft: 8,
    },
    editButtonContainer: {
      alignItems: "flex-end",
      marginTop: 8,
    },
    charitySelectionContainer: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.darkGray,
      marginBottom: 8,
    },
    charityButton: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      height: 48,
    },
    charityButtonText: {
      fontSize: 14, // Ensure text is not too large to fit
      color: COLORS.darkGray,
      textAlign: 'center', // Center text horizontally
    },
   
    buttonText: {
      fontSize: 14, // Ensure text is not too large to fit
      color: COLORS.white,
      textAlign: 'center', // Center text horizontally
    },
    bankDetailsButton: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      height: 48,
    },
    bankDetailsText: {
      fontSize: 14, // Ensure text is not too large to fit
      color: COLORS.black,
      textAlign: 'center', // Center text horizontally
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
      height: 48, // Added height property
    },
    inputPrefix: {
      fontSize: 18,
      color: COLORS.darkGray,
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 18,
      color: COLORS.darkGray,
    },
    datePickerButtonText: {
      fontSize: 18, // Increase from 16 to 18
      color: COLORS.darkGray,
    },
    datePickerButton: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 10,
      marginBottom: 16,
      justifyContent: 'center',
      alignItems: 'center',
      height: 48,
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    switchText: {
      fontSize: 16,
      color: COLORS.darkGray,
    },
    textArea: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      textAlignVertical: "top",
    },
  
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center', // Added to center content vertically
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.darkGray,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: 24,
      textAlign: 'center',
    },
    modalButtonContainer: {
      flexDirection: 'column', // Change from 'row' to 'column'
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    modalButton: {
      width: '80%', // Increase the width for columnar layout
      marginVertical: 8, // Add some vertical spacing between buttons
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 24,
      alignItems: "center",
      width: "80%",
      maxHeight: "80%",
    },
    noBankAccountsContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    noBankAccountsText: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: 16,
      textAlign: "center",
    },
    contactSupportButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    contactSupportButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: COLORS.white,
    },
    bankAccountItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.lightGray,
    },
    bankAccountText: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: 4,
    },
    loadingIndicator: {
      marginTop: 24,
    },
  
    modalContainer: {
      flex: 1,
      backgroundColor: 'white',
    },
    searchBarContainer: {
      paddingHorizontal: 24,
      paddingVertical: 24, // increase vertical padding
      backgroundColor: COLORS.primary,
      },
      searchBar: {
      backgroundColor: 'white',
      borderRadius: 8, // increase border radius for rounded corners
      paddingHorizontal: 16, // add more horizontal padding
      paddingVertical: 12, // increase vertical padding
      fontSize: 16, // slightly larger font size
      height: 60, // increase height, e.g. 48 pixels
      },
    charityList: {
      flex: 1,
    },
    charityItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    charityItemText: {
      fontSize: 16,
    },
    closeButtonContainer: {
      backgroundColor: 'white',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: '#E5E5E5',
    },
    closeButton: {
      backgroundColor: '#F5F5F5',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      alignSelf: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: COLORS.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalWindow: {
      backgroundColor: COLORS.white,
      borderRadius: 8,
      padding: 24,
      alignItems: 'center',
      width: '80%',
      maxHeight: '50%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.darkGray,
      marginBottom: 16,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 16,
      color: COLORS.darkGray,
      marginBottom: 24,
      textAlign: 'center',
    },
  
  });

export default SendScreen;