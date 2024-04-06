import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet,View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, TextInput, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { API_URL, TOKEN } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import { Image } from 'expo-image';
import OtherContext from '../data/otherContext';
import { Animated } from 'react-native';
import { COLORS, SIZES, images, icons } from '../constants';

const Button = React.lazy(() => import('../components/Button'));
const Calendar = React.lazy(() => import('react-native-calendars').then(module => ({ default: module.Calendar })));

const HistoryScreen = () => {
  const { standingOrders, charities, setCharities, uniqueCharities, setUniqueCharities, accountDetails } = useContext(OtherContext);
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
  const [searchQuery, setSearchQuery] = useState('');

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
        <Text style={styles.title}>Standing Orders</Text>
        <TouchableOpacity>
          <Image source={icons.more} contentFit='contain' style={styles.moreIcon} />
        </TouchableOpacity>
      </View>
    );
  }, [navigation]);

  const handleSelectDate = useCallback((newDate) => {
    setStartDate(newDate);
  }, []);

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
      payments: parseInt(amount, 10),
      charityno: "756",
      payon: formatDateForCalendar(selectedDate).replace(/-/g, ''),
      vaccountno: accountDetails.vaccountno,
      bnksortcode: selectedBankAccount.bnk_sort_code,
      bnkaccountno: selectedBankAccount.bnk_account_no,
      mode: "ntimes",
      ntimes: parseInt(numPayments, 10),
      frequency: frequency,
      numPayments: parseInt(numPayments, 10),
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

  const filteredOrders = useMemo(() =>
    standingOrders?.filter(order =>
      (filter === 'active' ? isActiveOrder(order) : filter === 'inactive' ? !isActiveOrder(order) : true) &&
      order.accountno == accountDetails.vaccountno
    ), [standingOrders, filter, accountDetails.vaccountno, isActiveOrder]
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
    console.log(accountDetails);
    if (selectedCharity && charities) {
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

  const resetValues = useCallback(() => {
    setSelectedCharity(null);
    setSelectedBankAccount(null);
    setAmount('');
    setSelectedDate(new Date());
    setFrequency('Weekly');
    setNumPayments('');
    setComments('');
    setDonationModalVisible(false);
  }, []);

  const filterCharities = useCallback((query) => {
    return uniqueCharities.filter(charity =>
      charity.charity.toLowerCase().includes(query.toLowerCase()) ||
      (charity.regchar && charity.regchar.toString().toLowerCase().includes(query.toLowerCase()))
    );
  }, [uniqueCharities]);

  const filteredCharitiesBySearch = useMemo(() => {
    return filterCharities(searchQuery);
  }, [filterCharities, searchQuery]);

  const renderDonationSuccessModal = useCallback(() => {
    return (
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <TouchableWithoutFeedback onPress={() => setDonationModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Donation Successful</Text>
              <Text style={styles.modalText}>The donation will be sent once approved</Text>
              <React.Suspense fallback={<ActivityIndicator />}>
                <Button
                  title="Continue"
                  filled
                  onPress={resetValues}
                  style={styles.modalButton}
                />
              </React.Suspense>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }, [modalVisible, resetValues]);

  const CustomDatePicker = useCallback(({ onSelectDate, startDate }) => {
    const initialDate = startDate ? formatDateForCalendar(new Date(startDate)) : formatDateForCalendar(new Date());
    const [selectedDay, setSelectedDay] = useState(initialDate);
    const [isVisible, setIsVisible] = useState(false);

    const handleDayPress = (day) => {
      setSelectedDay(day.dateString);
      onSelectDate(new Date(day.dateString));
      setIsVisible(false);
    };

    const openDatePicker = () => {
      setIsVisible(true);
    };

    const closeDatePicker = () => {
      setIsVisible(false);
    };

    const displayDate = selectedDay.split('-').reverse().join('/');

    return (
      <>
        <TouchableOpacity onPress={openDatePicker}>
          <Text>{displayDate}</Text>
        </TouchableOpacity>
        <Modal visible={isVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <React.Suspense fallback={<ActivityIndicator />}>
                <Calendar
                  current={selectedDay}
                  onDayPress={handleDayPress}
                  theme={{}}
                  enableSwipeMonths={true}
                  style={{ marginBottom: 40 }}
                />
              </React.Suspense>
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
  }, [formatDateForCalendar]);

  const resetStates = useCallback(() => {
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
  }, []);

  const renderCharityPickerModal = useCallback(() => {
    const [isCharityModalVisible, setCharityModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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
        onPress={() => handleCharityPress(item.charity)}
      >
        <Text style={styles.charityName}>{item.charity}</Text>
      </TouchableOpacity>
    );
  
    const filteredCharitiesBySearch = useMemo(() => {
      return filterCharities(searchQuery);
    }, [filterCharities, searchQuery]);
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlayStyle}>
          <View style={[
            styles.modalView,
            selectedCharity ? { flex: 1, height: '90%' } : { height: '75%' }
          ]}>
            <Text style={styles.modalTitle}>Add Standing Order</Text>
            <ScrollView
              contentContainerStyle={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              decelerationRate="fast"
              snapToAlignment="start"
              snapToOffsets={[0, 100, 200, 300, 400, 500]}
              snapToEnd={false}
              snapToStart={true}
            >
              {!selectedCharity && (
  <Text style={styles.standingOrderDescription}>
    A standing order is an arrangement for regular charity donations, ensuring consistent support without manual intervention.
  </Text>
)}
                  
              <Text style={styles.inputLabel}>Donate To:</Text>
              <TouchableOpacity
                style={[styles.charityButton, styles.inputContainer]}
                onPress={() => setCharityModalVisible(true)}
              >
                <Text style={[styles.charityButtonText, { fontSize: 16, textAlign: 'center' }]}>
                  {selectedCharity || 'Select a charity'}
                </Text>
              </TouchableOpacity>
              <Modal visible={isCharityModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search by charity name or regchar"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <FlatList
                    data={filteredCharitiesBySearch}
                    renderItem={renderCharityItem}
                    keyExtractor={(item) => item.charityno.toString()}
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
  
                      <Text style={styles.inputLabel}>Start Date</Text>
                      <View style={styles.inputContainer}>
                        <CustomDatePicker
                          onSelectDate={handleSelectDate}
                          startDate={startDate}
                        />
                      </View>
  
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
                        </Picker>
                      </View>
  
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
  
                      <Text style={styles.inputLabel}>Payment Reference</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          placeholder="Enter payment reference"
                          value={comments}
                          onChangeText={setComments}
                          style={styles.input}
                        />
                      </View>
  
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
          getItemLayout={(data, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
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
    
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.9,
    height: '60%',
    width: '80%',
    alignSelf: 'center',
  },
  addOrderButton: {
    height: 48,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
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
    justifyContent: 'center', // This will center the modal vertically
    alignItems: 'center', // This will center the modal horizontally
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Add this line to center the content vertically
    paddingHorizontal: 16,
    paddingTop: 30,
    marginBottom: 16,
    backgroundColor: COLORS.primary,
    height: 68,
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
  standingOrderDescription: {
    fontSize: 16, // Example size
    color: '#333', // Dark grey color for the text
    textAlign: 'center', // Center the text
    marginHorizontal: 20, // Add horizontal margin
    marginVertical: 10, // Add vertical margin
    paddingBottom: 20,
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Adjusted styles for your first component's search bar
searchBarContainer: {
  paddingHorizontal: 24,
  paddingVertical: 24, // increased vertical padding
  backgroundColor: COLORS.primary, // Assuming COLORS.primary is defined elsewhere
},
searchBar: {
  backgroundColor: 'white',
  borderRadius: 8, // increased border radius for rounded corners
  paddingHorizontal: 16, // more horizontal padding
  paddingVertical: 12, // increased vertical padding
  fontSize: 16, // slightly larger font size
  height: 60, // increased height
},

});

export default HistoryScreen;
