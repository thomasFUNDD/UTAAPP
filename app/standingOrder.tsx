import { View, Text, useWindowDimensions, StyleSheet, FlatList, TouchableOpacity,TouchableWithoutFeedback } from 'react-native'
import React, { useContext,useState, useEffect }  from 'react'
import { Modal } from 'react-native';
import { COLORS } from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Header from '../../components/Header';
import { allHistoryData, requestHistoryData, sendHistoryData } from '../../data';
import HistoryCard from '../../components/HistoryCard';
import OtherContextProvider from '../data/otherContextProvider'; // Adjust the path as necessary
import OtherContext from '../data/otherContext'; // Adjust the import path as necessary
import { Picker } from '@react-native-picker/picker';
import BalanceContext from '../data/balancesContext'; // Adjust the path as necessary
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native';





const HistoryScreen = () => {
  const { standingOrders, charities } = useContext(OtherContext);
  const [filter, setFilter] = useState('all');
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
           
            {/* Label for charity picker */}
            <Text style={styles.inputLabel}>Charity</Text>
            <View style={{ width: '100%', marginBottom: 10 }}>
              <Picker
                selectedValue={selectedCharity}
                onValueChange={(itemValue) => setSelectedCharity(itemValue)}
                style={{ height: 48, width: '100%' }}
              >
                {[...new Set(charities.map((charity) => charity.charity))].map(
                  (charityName, index) => (
                    <Picker.Item key={index} label={charityName} value={charityName} />
                  )
                )}
              </Picker>
            </View>
    
            {selectedCharity && (
              <View style={{ width: '100%' }}>
                {/* Label for bank account picker */}
                <Text style={styles.inputLabel}>Bank Account</Text>
                <Picker
                  selectedValue={selectedBankAccount}
                  onValueChange={(itemValue) => setSelectedBankAccount(itemValue)}
                  style={{ height: 48, width: '100%' }}
                >
                  {filteredBankAccounts.map((account, index) => {
                    // Guard clause to check if account is undefined
                    if (!account) {
                      console.warn(`Account at index ${index} is undefined.`);
                      return null; // Skip rendering this Picker.Item
                    }
                    // Use optional chaining for safety
                    return (
                      <Picker.Item
                        key={index}
                        label={`${account?.bnk_sort_code} - ${account?.bnk_account_no}`}
                        value={account}
                      />
                    );
                  })}
                </Picker>
              </View>
            )}
    
            {/* Label for amount input */}
            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={{ height: 48, width: '100%', marginBottom: 10 }}
            />
    
            {/* Label for start date picker */}
            <Text style={styles.inputLabel}>Start Date</Text>
            <TouchableOpacity
              style={{ height: 48, width: '100%', marginBottom: 10 }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || startDate;
                  setStartDate(currentDate);
                  setShowDatePicker(Platform.OS === 'ios'); // Keep the picker open on iOS, close it on Android
                }}
              />
            )}
    
            {/* Label for frequency picker */}
            <Text style={styles.inputLabel}>Frequency</Text>
            <Picker
              selectedValue={frequency}
              onValueChange={(itemValue) => setFrequency(itemValue)}
              style={{ height: 48, width: '100%', marginBottom: 10 }}
            >
              <Picker.Item label="Weekly" value="Weekly" />
              <Picker.Item label="Monthly" value="Monthly" />
              {/* ... other frequency options */}
            </Picker>
    
            <TouchableOpacity
              style={styles.addOrderButton}
              onPress={() => {
                // Add your logic for adding a standing order here
                console.log('Add Standing Order button pressed');
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.addOrderButtonText}>Add Standing Order</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>

        </View>
      </TouchableWithoutFeedback>
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
            <Text>Account No: {item.accountno}</Text>
            <Text>Charity No: {item.charityno}</Text>
            <Text>Sort Code: {item.bnk_sortcode}</Text>
            <Text>Bank Account No: {item.bnk_accountno}</Text>
            <Text>Frequency: {item.frequency}</Text>
            <Text>Mode: {item.mode}</Text>
            <Text>Processed: {item.processed}</Text>
            <Text>Last Modified: {new Date(item.last_modified).toLocaleDateString()} {new Date(item.last_modified).toLocaleTimeString()}</Text>
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
      />
     
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
    width: '80%', // Adjusted width for better spacing
    marginBottom: 20, // Increased bottom margin for better spacing
    alignSelf: 'center', // Center the container
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

  
  // ... other styles ...
});

export default HistoryScreen