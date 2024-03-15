import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput, FlatList,StyleSheet,ScrollView ,ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL, TOKEN } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';

import { Image } from 'expo-image';
import Button from '../components/Button';
import OtherContext from '../data/otherContext';
import { Animated } from 'react-native';
import { COLORS, SIZES,  images,icons } from '../constants';
import { Calendar } from 'react-native-calendars';
const HistoryScreen = () => {
  const { standingOrders, charities, accountDetails } = useContext(OtherContext);
  const [filter, setFilter] = useState('active');
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [filteredBankAccounts, setFilteredBankAccounts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [comments, setComments] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [frequency, setFrequency] = useState('W');
  const [numPayments, setNumPayments] = useState('');
  const [modalVisible, setDonationModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigation = useNavigation();
  const [hasSelected, setHasSelected] = useState(false); // New state to track selection

  const formatDateForCalendar = useCallback((date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);


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
  

  const handleSelectDate = (newDate) => {
    console.log(newDate);
    setStartDate(newDate); // Assuming setStartDate updates the startDate state
  };

  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, []);



  const addStandingOrder = useCallback(async () => {
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
      email: "user@example.com",
      payments: parseInt(amount, 10), // Convert amount to a number
      charityno: "756", // Use the numeric charity number
      payon: formatDateForCalendar(selectedDate).replace(/-/g, ''), // Convert date to expected format
      vaccountno: accountDetails.vaccountno, // Use vaccountno instead of donorid
      bnksortcode: selectedBankAccount.bnk_sort_code,
      bnkaccountno: selectedBankAccount.bnk_account_no,
      mode: "ntimes",
      ntimes: parseInt(numPayments, 10), // Convert ntimes to a number
      frequency: frequency,
      numPayments: parseInt(numPayments, 10), // Convert numPayments to a number
      comments: comments
    };


    console.log(requestBody);
    console.log(requestBody);
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
      const responseText = await response.text();
      console.log("Server response:", responseText);
      if (response.ok) {
        setDonationModalVisible(true);
      } else {
        console.error("Standing order addition failed with status:", response.status);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorDetails = await response.json();
          console.error("Error details:", errorDetails);
        } else {
          const errorText = await response.text();
          console.error("Error text:", errorText);
        }
      }
    } catch (error) {
      console.error("Standing order addition failed:", error);
    }
  }, [amount, comments, formatDateForCalendar, frequency, numPayments, selectedBankAccount, selectedCharity, selectedDate]);

  const isActiveOrder = useCallback((order) => order.processed !== 'P', []);

  const filteredOrders = useMemo(() => standingOrders.filter(order =>
    (filter === 'active' ? isActiveOrder(order) : filter === 'inactive' ? !isActiveOrder(order) : true) &&
    order.accountno == accountDetails.vaccountno
  ), [standingOrders, filter, accountDetails.vaccountno, isActiveOrder]);

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
    console.log(accountDetails);
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

  const resetValues = () => {
    setSelectedCharity(null);
    setSelectedBankAccount(null);
    setAmount('');
    setSelectedDate(new Date());
    setFrequency('Weekly');
    setNumPayments('');
    setComments('');
    setDonationModalVisible(false);
  };
 

  const renderDonationSuccessModal = useCallback(() => {
    return (
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setDonationModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Donation Successful</Text>
              <Text style={styles.modalText}>The donation will be sent once approved</Text>
              <Button
              title="Continue"
              filled
              onPress={() => resetValues()}
              style={styles.modalButton}
            />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }, [modalVisible]);


  const CustomDatePicker = ({ onSelectDate, startDate }) => {
    // Use startDate if provided, otherwise default to today's date
    const initialDate = startDate ? formatDateForCalendar(new Date(startDate)) : formatDateForCalendar(new Date());
    const [selectedDay, setSelectedDay] = useState(initialDate);
    const [isVisible, setIsVisible] = useState(false);
  
    const handleDayPress = (day) => {
      setSelectedDay(day.dateString);
      onSelectDate(new Date(day.dateString)); // This updates the startDate in the parent component
      setIsVisible(false); // Close the modal after selecting a date
    };
  
    const openDatePicker = () => {
      setIsVisible(true);
    };
  
    const closeDatePicker = () => {
      setIsVisible(false);
    };
  
    // Format the selectedDay for display
    const displayDate = selectedDay.split('-').reverse().join('/');
  
    return (
      <>
        <TouchableOpacity onPress={openDatePicker}>
          <Text>{displayDate}</Text>
        </TouchableOpacity>
        <Modal visible={isVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <Calendar
                current={selectedDay}
                onDayPress={handleDayPress}
                theme={{
                  // Calendar theme styles
                }}
                enableSwipeMonths={true}
                style={{ marginBottom: 40 }}
              />
              <TouchableOpacity
                onPress={closeDatePicker}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const resetStates = () => {
    setSelectedCharity(null);
    setSelectedBankAccount(null);
    setFilteredBankAccounts([]);
    setModalVisible(false);
    setAmount('');
    setComments('');
    setStartDate(new Date());
    setShowCustomDatePicker(false);
    setFrequency('W');
    setNumPayments('');
    setDonationModalVisible(false);
    // Reset other states as needed
  };
  
  const renderCharityPickerModal = useCallback(() => {
    const filteredCharities = useMemo(
      () => [
        ...new Set(
          charities.filter((charity) => charity.regchar !== 'Private').map((charity) => charity.charity)
        ),
      ],
      [charities]
    );
  
    const [isCharityModalVisible, setCharityModalVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(0));
  
    const startSlideAnimation = () => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  
    useEffect(() => {
      if (selectedCharity) {
        startSlideAnimation();
      }
    }, [selectedCharity]);
  
    const handleCharityPress = (charityName) => {
      setSelectedCharity(charityName);
      setCharityModalVisible(false);
    };
  
    const renderCharityItem = ({ item }) => (
      <TouchableOpacity
        style={styles.charityItem}
        onPress={() => handleCharityPress(item)}
      >
        <Text style={styles.charityName}>{item}</Text>
      </TouchableOpacity>
    );
  
    const handleOpenDatePicker = () => {
      setShowCustomDatePicker(true);
    };
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlayStyle}>
          <View style={styles.modalView}>
            <ScrollView
              contentContainerStyle={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToOffsets={[0, 100, 200, 300, 400, 500]}
              snapToEnd={false}
              snapToStart={true}
            >
              {/* Charity picker */}
              <Text style={styles.inputLabel}>Donate To:</Text>
            <TouchableOpacity
              style={[styles.charityButton, styles.inputContainer]}
              onPress={() => setCharityModalVisible(true)}
            >
              <Text style={[styles.charityButtonText, { fontSize: 18, textAlign: 'center' }]}>
                {selectedCharity || 'Select a charity'}
              </Text>
            </TouchableOpacity>
              <Modal visible={isCharityModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                  <FlatList
                    data={filteredCharities}
                    renderItem={renderCharityItem}
                    keyExtractor={(item) => item}
                    contentContainerStyle={styles.charityList}
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      height: '100%',
                    }}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setCharityModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
  
              {/* Other inputs */}
              {selectedCharity &&
              filteredBankAccounts.filter(
                (account) => account.bnk_sort_code && account.bnk_account_no
              ).length > 0 ? (
                <Animated.View style={[styles.formContainer, {
                  opacity: slideAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                }]}>
                  {/* Bank account picker */}
                  <Text style={styles.inputLabel}>Bank Account</Text>
                  <View style={styles.inputContainer}>
                    <Picker
                      selectedValue={selectedBankAccount}
                      onValueChange={(itemValue) => setSelectedBankAccount(itemValue)}
                      style={styles.picker}
                    >
                      {filteredBankAccounts
                        .filter(
                          (account) =>
                            account.bnk_sort_code && account.bnk_account_no
                        )
                        .map((account, index) => (
                          <Picker.Item
                            key={index}
                            label={`${account.bnk_sort_code} - ${account.bnk_account_no}`}
                            value={account}
                          />
                        ))}
                    </Picker>
                  </View>
  
                  {/* Amount input and other fields */}
                  {selectedBankAccount && (
                    <>
                      <Text style={styles.inputLabel}>Amount</Text>
                      <View style={styles.inputContainerWithIcon}>
                        <Text style={styles.currencyIcon}>£</Text>
                        <TextInput
                          placeholder="Amount"
                          keyboardType="numeric"
                          value={amount}
                          onChangeText={setAmount}
                          style={styles.amountInput}
                        />
                      </View>
  
                      {/* Start date picker */}
                      <Text style={styles.inputLabel}>Start Date</Text>
                      <View style={styles.inputContainer}>
                        <CustomDatePicker
                          onSelectDate={handleSelectDate}
                          startDate={startDate}
                        />
                      </View>
  
                      {/* Frequency picker */}
                      <Text style={styles.inputLabel}>Frequency</Text>
                      <View style={styles.inputContainer}>
                        <Picker
                          selectedValue={frequency}
                          onValueChange={(itemValue) => setFrequency(itemValue)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Weekly" value="Weekly" />
                          <Picker.Item label="Monthly" value="Monthly" />
                          <Picker.Item label="Annually" value="Annually" />
                          {/* ... other frequency options */}
                        </Picker>
                      </View>
  
                      {/* Number of payments input */}
                      <Text style={styles.inputLabel}>Number of Payments</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          placeholder="Enter number of payments"
                          keyboardType="numeric"
                          value={numPayments}
                          onChangeText={setNumPayments}
                          style={styles.input}
                        />
                      </View>
  
                      {/* Payment reference input */}
                      <Text style={styles.inputLabel}>Payment Reference</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          placeholder="Enter payment reference"
                          value={comments}
                          onChangeText={setComments}
                          style={styles.input}
                        />
                      </View>
  
                      {/* Add standing order button */}
                      <TouchableOpacity
                        style={styles.addOrderButton}
                        onPress={addStandingOrder}
                        activeOpacity={0.6}
                      >
                        <Text style={styles.addOrderButtonText}>
                          Add Standing Order
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </Animated.View>
              ) : (
                <TouchableOpacity
                  style={styles.addOrderButton}
                  onPress={() => {
                    resetStates();
                    navigation.navigate('changeemail', {});
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={styles.addOrderButtonText}>
                    Contact Support
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            <TouchableOpacity
          style={styles.closeModalButton}
          onPress={() => {
            setModalVisible(false);
            resetStates();
          }}
        >
          <Text style={styles.closeModalButtonText}>Close</Text>
        </TouchableOpacity>
          </View>
        </View>
        {showCustomDatePicker && selectedBankAccount && (
          <CustomDatePicker
            isVisible={showCustomDatePicker}
            onClose={() => setShowCustomDatePicker(false)}
            onSelectDate={handleSelectDate}
          />
        )}
      </Modal>
    );
  }, [
    isModalVisible,
    selectedCharity,
    filteredBankAccounts,
    selectedBankAccount,
    amount,
    formatDate,
    selectedDate,
    frequency,
    numPayments,
    comments,
    addStandingOrder,
    handleSelectDate,
  ]);
  //
  const sendCancellationEmail = useCallback(async (itemId) => {
    const item = standingOrders.find(order => order.id === itemId);
    if (!item) {
      console.error("Order not found");
      return;
    }

    const payload = {
      accountNo: item.accountno,
      charityNo: item.charityno,
      sortCode: item.bnk_sortcode,
      bankAccountNo: item.bnk_accountno,
      frequency: item.frequency,
      processedStatus: item.processed,
      mode: item.mode,
      created: new Date(item.last_modified).toISOString(),
    };

    try {
      const response = await fetch('https://app.utauk.org/dashboardSorting/cancelOrderMobile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Cancellation successful", responseData);
        alert("Cancellation request sent successfully.");
      } else {
        console.error("Failed to cancel order with status:", response.status);
        alert("Failed to send cancellation request.");
      }
    } catch (error) {
      console.error("Error sending cancellation request:", error);
      alert("Error sending cancellation request.");
    }
  }, [standingOrders]);

  const renderStandingOrder = useCallback(({ item }) => {
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
  }, [expandedId, sendCancellationEmail]);

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: COLORS.primary }}>
        {renderHeader()}
      </SafeAreaView>
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
          extraData={expandedId}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
        {renderDonationSuccessModal()}
      </SafeAreaView>
    </>
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
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
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
    backgroundColor: '#f8f9fa',
  },
  button: {
    backgroundColor: '#e7e7e7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  activeButton: {
    backgroundColor: '#a98e63',
    borderColor: '#8c7a50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  addButton: {
    backgroundColor: '#a98e63',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8c7a50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    height: '50%',
    width: '80%',
    alignSelf: 'center',
  },
  addOrderButton: {
    height: 48,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    borderRadius: 5,
    alignSelf: 'center',
  },
  addOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  slideInView: {
    marginTop: 20,
    opacity: 0,
    transform: [{ translateY: 50 }],
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    width: '80%',
    marginLeft: '10%',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    height: 50,
    justifyContent: 'center',
  },
  inputContainerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    height: 50,
  },
  amountInput: {
    flex: 1,
    height: '100%',
    marginLeft: 10,
  },
  picker: {
    height: '100%',
    width: '100%',
  },
  input: {
    height: '100%',
    paddingHorizontal: 10,
  },
  currencyIcon: {
    marginRight: 10,
    color: '#333',
  },

  overlayStyle: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
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
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  expandedText: {
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.primary,
    height: 78,
  },
  backIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.white,
  },
  title: {
    fontSize: 16,
    fontFamily: 'medium',
    color: COLORS.white,
  },
  moreIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.white,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  charityList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  charityItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  charityName: {
    fontSize: 18,
    color: '#333333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    width: '80%',
  },
  charityButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charityButtonText: {
    color: '#333',

  },
  closeModalButton: {
    backgroundColor: '#a98e63',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // ... other styles ...
});

export default HistoryScreen;

