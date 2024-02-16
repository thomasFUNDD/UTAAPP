import { View, Text, TouchableOpacity,SafeAreaView,ScrollView, StyleSheet, Modal, TouchableWithoutFeedback, SectionList, FlatList, } from 'react-native'
import React, { useState, useEffect, useContext, useRef } from 'react';
import PDFLib, { PDFDocument, PDFPage } from 'react-native-pdf-lib';

import { TextInput } from 'react-native';
import { Image } from 'expo-image'
import { COLORS, SIZES, icons, images } from '../constants'
import Slider from '@react-native-community/slider'; // Ensure this is the only Slider import
import { useNavigation } from 'expo-router'
import Button from '../components/Button'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker';
import BalanceContext from '../data/balancesContext'; // Adjust the path as necessary
import OtherContext from '../data/otherContext'; // Adjust the import path as necessary
import { Ionicons } from 'react-native-vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import * as Permissions from 'expo-permissions';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import FileViewer from 'react-native-file-viewer';


import * as Linking from 'expo-linking';

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
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all'); // 'in', 'out', or 'receipt'
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    let runningBalance = currentBalance; // Start with the initial balance
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);
    const { transactions } = useContext(OtherContext); // Fetch transactions from context

    const [stickyHeader, setStickyHeader] = useState('');
    const flatListRef = useRef(null);
    const { statements } = useContext(OtherContext); // Access statements from context

    const [searchTerm, setSearchTerm] = useState('');

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [isTodaySelected, setIsTodaySelected] = useState(false);
    const [isDepositsInSelected, setIsDepositsInSelected] = useState(false);
    const [isTransactionsOutSelected, setIsTransactionsOutSelected] = useState(false);


    

        const handleFilter = (filterType) => {
        setActiveFilter(filterType);
    };


    const handleSearch = (text) => {
        setSearchTerm(text);
        if (text === '') {
          setFilteredTransactions(transactions); // Show all transactions if search is cleared
        } else {
          const filtered = transactions.filter(transaction =>
            transaction['payment reference'].toLowerCase().includes(text.toLowerCase())
          );
          setFilteredTransactions(filtered); // Update the state with the filtered transactions
        }
      };




      const handleGeneratePDF = async (transactionsData) => {
        console.log('handleGeneratePDF called');
        try {
          // Filter transactions based on selected filters
          const filteredTransactions = transactionsData.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const today = new Date();
            const isToday = transactionDate.toDateString() === today.toDateString();
            const isDeposit = transaction.type === 'Deposit'; // Assuming 'type' field exists and 'Deposit' indicates a deposit
            const isTransactionOut = transaction.type === 'Withdrawal'; // Assuming 'type' field exists and 'Withdrawal' indicates a transaction out
      
            if (isTodaySelected && !isToday) {
              return false;
            }
            if (isDepositsInSelected && !isDeposit) {
              return false;
            }
            if (isTransactionsOutSelected && !isTransactionOut) {
              return false;
            }
            return true;
          });
      
          console.log('Sending POST request to server with filtered transactions...');
          const response = await fetch('https://app.utauk.org/dashboardSorting/createPDFMobile.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filteredTransactions),
          });
      
          console.log('POST request sent. Response status:', response.status);
          if (!response.ok) {
            console.error('Server response error:', response.status, response.statusText);
            return;
          }
      
          console.log('Attempting to download PDF data...');
          const blob = await response.blob();
          const pdfPath = FileSystem.cacheDirectory + 'receipts.pdf';
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              // Check if the result includes the base64 header
              const base64data = reader.result.indexOf('base64,') >= 0 ?
                reader.result.split('base64,')[1] :
                reader.result;
      
              await FileSystem.writeAsStringAsync(pdfPath, base64data, {
                encoding: FileSystem.EncodingType.Base64,
              });
              console.log('PDF downloaded to:', pdfPath);
      
              // Check if sharing is available
              if (!(await Sharing.isAvailableAsync())) {
                console.error('Sharing is not available on this platform');
                return;
              }
      
              // Share the file
              await Sharing.shareAsync(pdfPath);
            } catch (error) {
              console.error('Error saving or sharing the file:', error);
            }
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error in handleGeneratePDF:', error);
        }
      };
      // Call this function when the button is pressed

      // Call this function when the button is pressed
      const requestStoragePermissionAndGeneratePDF = async () => {
        handleGeneratePDF(transactions); // Replace 'transactions' with your actual transactions data
      };
    
    
      const handlePrintPDF = () => {
        // Logic to print PDF
      };





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
                <Text style={styles.title}>Create Reciepfs</Text>
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


      const formatNumber = (num) => {
        let [base, exponent] = num.toExponential(2).split('e');
        let [lead, decimal] = base.split('.');
        lead = lead.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${lead}.${decimal}e${exponent}`;
      };



  const handleSelectTransaction = (index) => {
    if (selectedTransaction === index) {
      setSelectedTransaction(null); // Deselect if the same card is clicked again
    } else {
      setSelectedTransaction(index);
    }
  };
  const toggleFilter = (filter) => {
    setSelectedFilter(filter);
    // Additional logic based on filter selection
  };
    
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
        {renderHeader()}
        <View style={styles.container}>
        <View style={styles.datePickerContainer}>
  <Text style={styles.dateLabel}>Start Date:</Text>
  <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateInput}>
    <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
  </TouchableOpacity>
</View>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

<View style={styles.datePickerContainer}>
  <Text style={styles.dateLabel}>End Date:</Text>
  <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateInput}>
    <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
  </TouchableOpacity>
</View>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}
  
  <View style={styles.switchContainer}>
  <TouchableOpacity
    style={[styles.switchButton, isTodaySelected && styles.activeSwitchButton]}
    onPress={() => setIsTodaySelected(!isTodaySelected)}>
    <Text style={isTodaySelected ? styles.activeSwitchText : styles.switchText}>Today</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.switchButton, isDepositsInSelected && styles.activeSwitchButton]}
    onPress={() => setIsDepositsInSelected(!isDepositsInSelected)}>
    <Text style={isDepositsInSelected ? styles.activeSwitchText : styles.switchText}>Deposits In</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.switchButton, isTransactionsOutSelected && styles.activeSwitchButton]}
    onPress={() => setIsTransactionsOutSelected(!isTransactionsOutSelected)}>
    <Text style={isTransactionsOutSelected ? styles.activeSwitchText : styles.switchText}>Transactions Out</Text>
  </TouchableOpacity>
</View>
        <Text style={styles.instructionText}>
        Please select a date range to generate a PDF document of receipts.
      </Text>
      <TouchableOpacity style={styles.fullWidthButton} onPress={requestStoragePermissionAndGeneratePDF}>
  <Text style={styles.buttonText}>Generate PDF</Text>
</TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    cardInfoContainer: {
        height: 94,
        width: SIZES.width - 32,
        borderRadius: 10,
        backgroundColor: COLORS.white,
        padding: 16,
        marginHorizontal: 16,
        top: -32,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
 
    transactionText: {
        fontSize: 16,
        color: COLORS.black,
        // Add other styling as needed
    },
    filterButton: {
        padding: 10,
        margin: 5,
        backgroundColor: COLORS.secondary, // Replace with your secondary color
        borderRadius: 5,
    },
    filterButtonText: {
        color: COLORS.white, // Replace with your color for text
        fontSize: 16,
    },


    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#FFA07A', // Adjust the color to match your theme
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        fontSize: 16,
        color: '#fff', // Adjust text color to contrast with the button color
        textAlign: 'center',
    },
    listItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd', // Use a light color for the separator
        backgroundColor: '#fff', // Use a neutral color for the list item background
    },
    listItemText: {
        fontSize: 16,
        color: '#333', // Dark color for text for better readability
    },


    transactionType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    transactionRef: {
        fontSize: 16,
        color: '#333',
    },
    transactionDetailContainer: {
        backgroundColor: '#f7f7f7',
        padding: 10,
        borderRadius: 5,
    },
    filterContainer: {
       
        borderRadius: 10,
        margin: 8,
        padding: 8,
        // Other styles...
      },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        padding: 10,
    },
    filterButton: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
    },
    createReceiptButton: {
        alignSelf: 'center',
        marginTop: 10,
    },
    filterButtonText: {
        color: COLORS.white,
        fontSize: 16,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        paddingTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
      },
    transactionDescription: {
        flexDirection: 'column',
        justifyContent: 'center',
        width: '54%', // Adjust as needed
    },
   
    balanceContainer: {
        width: '46%', // Adjust as needed
        alignItems: 'flex-end', // Align text to the right
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 40,
        marginBottom: 16,
        backgroundColor: COLORS.primary,
        height: 78
    },
    transactionItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 4,
        marginHorizontal: 8,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Shadow styles if needed...
      },
      definedText: {
        fontWeight: '600', // Make the text bolder
        color: '#FFFFFF', // White text for better contrast on the primary color
        textShadowColor: 'rgba(0, 0, 0, 0.3)', // Text shadow for depth
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
      },
      createReceiptContainer: {
        justifyContent: 'center', // Center children along the main axis
        alignItems: 'center', // Center children along the cross axis
        // ... other styles that were previously defined
      },
      searchBarContainer: {
        backgroundColor: COLORS.lightGray, // Choose a light color that fits the theme
        borderRadius: 10,
        margin: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
      },
      
      searchBarInput: {
        flex: 1,
        marginLeft: 10,
        color: COLORS.darkGray, // Choose a dark color for contrast
      },
      transactionIndex: {
        fontSize: 14, // Set your desired size
        fontWeight: 'bold', // Make the text bold
        // Add other styling as needed
      },
      transactionCard: {
        // Ensure that the card has padding and is not extending off the screen
        paddingHorizontal: 16, // Add horizontal padding
        paddingVertical: 8, // Add vertical padding
        marginHorizontal: 8, // Add horizontal margin
        paddingTop: 32,
        // ... other styles ...
    },
    transactionDateContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: 'white', // Ensure the background color matches the list background
      zIndex: 1, // Make sure the header is above the list items
    },
    transactionDateHeader: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    transactionContainer: {
        // Style for the transaction container
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8, // Add vertical padding
        // ... other styles ...
    },
    transactionDateContainer: {
      // Container for the date header to ensure it's on its own line
      paddingHorizontal: 16, // Horizontal padding
      paddingVertical: 8, // Vertical padding
      // Add any additional styles you want for this container
  },
  stickyHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    // Add other styles for your sticky header
  },
  stickySectionHeader: {
    backgroundColor: 'white', // Match the list background color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Add a bottom border for visual separation
    borderBottomColor: '#E0E0E0', // Use a light color for the border
    zIndex: 1, // Ensure the header is above the list items
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0', // Light grey background for the button row
    borderRadius: 20, // Rounded corners for the button row
    margin: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1, // This will make sure both buttons take up equal space
    backgroundColor: 'white', // Default background color for buttons
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 15, // Rounded corners for buttons
    marginHorizontal: 4, // Space between buttons
    elevation: 2, // Shadow for the buttons
    justifyContent: 'center', // Center text vertically
    alignItems: 'center', // Center text horizontally
  },
  activeButton: {
    backgroundColor: '#D0D0D0', // A slightly darker background for the active button
  },
  filterButtonText: {
    color: 'black', // Text color
    fontWeight: '600',
  },
  activeText: {
    color: 'white', // Text color for active button
  },
searchBarContainer: {
  backgroundColor: COLORS.lightGray, // Choose a light color that fits the theme
  borderRadius: 10,
  margin: 16,
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 8,
},

datePickerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: 10,
  // Add other styling as needed
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  padding: 10,
  // Add other styling as needed
},
datePickerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  // Add other styling as needed
},
dateInput: {
  borderWidth: 1,
  borderColor: '#D0D0D0',
  padding: 10,
  borderRadius: 5,
  width: '100%', // Make the input full width
  // Add other styling as needed
},
filterContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingVertical: 10,
  // Add other styling as needed
},
filterButton: {
  borderWidth: 1,
  borderColor: '#D0D0D0',
  borderRadius: 20,
  paddingVertical: 10,
  paddingHorizontal: 20,
  // Add other styling as needed
},
safeArea: {
  flex: 1,
  backgroundColor: '#FFF8E1', // Adjust the color to match your theme
},
container: {
  flex: 1,
  padding: 20,
  justifyContent: 'center', // Center the content vertically
},
datePickerContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 20, // Add space below the date pickers
},
filterContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 20, // Add space below the filter buttons
},
instructionText: {
  textAlign: 'center',
  marginBottom: 20, // Add space below the instruction text
},
generateButton: {
  backgroundColor: '#FFD54F', // Adjust the color to match your theme
  borderRadius: 25,
  paddingVertical: 15,
  paddingHorizontal: 35,
  alignSelf: 'center', // Center the button horizontally
  elevation: 2, // Add shadow for Android (optional)
  // For iOS shadow (optional)
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
},
generateButtonText: {
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: 18,
},

container: {
  flex: 1,
  padding: 20,
},
fullWidthButton: {
  backgroundColor: COLORS.primary,
  padding: 15,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
  width: '100%',
},
buttonText: {
  fontSize: 18,
  color: COLORS.white,
},
activeFilterButton: {
  backgroundColor: COLORS.activeFilter,
},
instructionText: {
  fontSize: 16,
  color: COLORS.primaryText,
  textAlign: 'center',
  marginBottom: 20,
},
switchContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 20,
},
switchButton: {
  borderWidth: 1,
  borderColor: '#D0D0D0',
  borderRadius: 20,
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: '#FFF',
},
activeSwitchButton: {
  backgroundColor: COLORS.active, // Color when the switch is active
},
switchText: {
  color: '#000', // Color when the switch is inactive
  textAlign: 'center',
},
activeSwitchText: {
  color: '#FFF', // Color when the switch is active
  textAlign: 'center',
},
switchContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingVertical: 10,
},
switchButton: {
  flex: 1, // Equal width for each switch
  borderWidth: 1,
  borderColor: '#D0D0D0',
  borderRadius: 20,
  paddingVertical: 10,
  marginHorizontal: 5, // Add some space between switches
  backgroundColor: '#FFF',
  justifyContent: 'center', // Center text vertically
  alignItems: 'center', // Center text horizontally
},
activeSwitchButton: {
  backgroundColor: '#a98e63', // Background color when the switch is active
},
switchText: {
  color: '#000', // Color when the switch is inactive
  textAlign: 'center',
},
activeSwitchText: {
  color: 'white',
  textAlign: 'center', // Text color when the switch is active
},
container: {
  flex: 1,
  padding: 20,
  justifyContent: 'space-between', // This will push your bottom content to the bottom
},
bottomContainer: {
  padding: 20,
  backgroundColor: COLORS.white, // Adjust the color to match your theme
},
instructionText: {
  fontSize: 16,
  color: COLORS.primaryText,
  textAlign: 'center',
  marginBottom: 20,
},
fullWidthButton: {
  backgroundColor: COLORS.primary,
  padding: 15,
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
},
buttonText: {
  fontSize: 18,
  color: COLORS.white,
},
datePickerContainer: {
  alignItems: 'center', // Center align the label and date input
  marginBottom: 10, // Add some space below the container
},
dateLabel: {
  fontWeight: 'bold', // Make the label text bold
  fontSize: 16, // Adjust the font size as needed
  marginBottom: 5, // Space between label and input
  alignSelf: 'center', // Center align the label text
},
})

export default SendScreen