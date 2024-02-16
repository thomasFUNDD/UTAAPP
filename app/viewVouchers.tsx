import { View, Text, TouchableOpacity,SafeAreaView,ScrollView, StyleSheet, Modal, TouchableWithoutFeedback, SectionList, FlatList, } from 'react-native'
import React, { useState, useEffect, useContext, useRef } from 'react';

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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, TOKEN } from '@env'

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
    const { transactions } = useContext(OtherContext); // Access transactions from context
    const [activeFilter, setActiveFilter] = useState('owned'); // 'in', 'out', or 'receipt'
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    let runningBalance = currentBalance; // Start with the initial balance
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);
    const { accountDetails } = useContext(OtherContext);

    const [stickyHeader, setStickyHeader] = useState('');
    const flatListRef = useRef(null);

    const [bookCategories, setBookCategories] = useState([]);

    const [processedFilter, setProcessedFilter] = useState('all'); // 'all', 'processed', or 'notProcessed'

    const [bookOrders, setBookOrders] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    
  const bookCodeToTitle = {
    'P00': '100 £0.50 Vouchers',
    'P03': '50 £1 Vouchers',
    's02': '50 £2 Vouchers',
    's03': '50 £3 Vouchers',
    's05': '50 £5 Vouchers',
    's10': '50 £10 Vouchers',
    's15': '50 £15 Vouchers',
    's18': '50 £18 Vouchers',
    's20': '50 £20 Vouchers',
    's25': '50 £25 Vouchers',
    's36': '50 £36 Vouchers',
    's50': '50 £50 Vouchers',
    's72': '50 £72 Vouchers',
    's99': '50 £100 Vouchers',
    'N00': '50 £0 Vouchers',
  };
    const handleFilter = (filter) => {
      setActiveFilter(filter);
    };

    const handleProcessedFilter = (filter) => {
      setProcessedFilter(filter);
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
              <Text style={styles.title}>View Books</Text>
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
  const fetchUnusedVouchers = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
  
        // Fetch unused vouchers
        const vouchersResponse = await axios({
          url: `${API_URL}/client/vouchers/unused`,
          method: 'GET',
          headers: headers
        });
        setBookCategories(vouchersResponse.data.book_categories);
  
        // Fetch books on order
        const booksOnOrderResponse = await axios({
          url: `${API_URL}/client/books/onorder`,
          method: 'GET',
          headers: headers
        });
        setBookOrders(booksOnOrderResponse.data['books-ordered']); // Set bookOrders to the 'books-ordered' array
  
      } else {
        setError('No token found');
      }
    } catch (error) {
      setError('Axios error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch data on component mount
  useEffect(() => {
    setActiveFilter('owned');
    const timer = setTimeout(() => {
      handleFilter('own');
    }, 0);
    fetchUnusedVouchers();
  }, []);
    
    

  
  function convertBookCodeToTitle(bookCode) {
    console.log('bookCode:', bookCode);
    return bookCodeToTitle[bookCode] || 'Unknown Title';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderHeader()}
  
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'own' ? styles.activeButton : null]}
            onPress={() => handleFilter('own')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'own' ? styles.activeText : null]}>Unused Vouchers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'order' ? styles.activeButton : null]}
            onPress={() => handleFilter('order')}
          >
            <Text style={[styles.filterButtonText, activeFilter === 'order' ? styles.activeText : null]}>Orders</Text>
          </TouchableOpacity>
        </View>
  
        {activeFilter === 'own' && (
          <ScrollView style={styles.scrollViewStyle}>
            {bookCategories.length > 0 ? (
              bookCategories.map((item, index) => (
                <View key={index.toString()} style={styles.card}>
                  <Text style={styles.cardText}>Description: {item.bt_description}</Text>
                  <Text style={styles.cardText}>ID: {item.bt_id.toString()}</Text>
                  <Text style={styles.cardText}>Value: {item.bt_value.toString()}</Text>
                  <Text style={styles.cardText}>Count: {item.count.toString()}</Text>
                  <Text style={styles.cardText}>Subtotal: £{item.subtotal ? parseFloat(item.subtotal).toFixed(2).toString() : '0.00'}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No data available</Text>
            )}
          </ScrollView>
        )}
  
        {activeFilter === 'order' && (
          <ScrollView style={styles.scrollViewStyle}>

<View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, processedFilter === 'all' ? styles.activeButton : null]}
          onPress={() => handleProcessedFilter('all')}
        >
          <Text style={[styles.filterButtonText2, processedFilter === 'all' ? styles.activeText : null]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, processedFilter === 'processed' ? styles.activeButton : null]}
          onPress={() => handleProcessedFilter('processed')}
        >
          <Text style={[styles.filterButtonText2, processedFilter === 'processed' ? styles.activeText : null]}>Processed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, processedFilter === 'notProcessed' ? styles.activeButton : null]}
          onPress={() => handleProcessedFilter('notProcessed')}
        >
          <Text style={[styles.filterButtonText2, processedFilter === 'notProcessed' ? styles.activeText : null]}>Unprocessed</Text>
        </TouchableOpacity>
      </View>
          
      {bookOrders.length > 0 ? (
  bookOrders
    .filter(item => item.accountno == accountDetails.vaccountno)
    .filter(item => {
      if (processedFilter === 'all') return true;
      if (processedFilter === 'processed') return item.processed !== 'P';
      if (processedFilter === 'notProcessed') return item.processed === 'P';
    })
    .filter(item => bookCodeToTitle.hasOwnProperty(item.bk_code)) // Exclude items where bk_code doesn't match
    .map((item, index) => (
      <View key={index.toString()} style={styles.card}>
        <Text style={styles.cardText}>ID: {item.id.toString()}</Text>
        <Text style={styles.cardText}>Action: {item.action}</Text>
        <Text style={styles.cardText}>Book Category: {convertBookCodeToTitle(item.bk_code)}</Text>
        <Text style={styles.cardText}>Quantity: {item.quantity.toString()}</Text>
        <Text style={styles.cardText}>Cost: £{item.cost ? parseFloat(item.cost * (item.bk_code === 'P00' ? 100 : 50)).toFixed(2).toString() : '0.00'}</Text>
        <Text style={styles.cardTextProcess}>{item.processed == 'P' ? 'Not Processed' : 'Processed'}</Text>
      </View>
    ))
) : (
  <Text style={styles.noDataText}>No data available</Text>
)}
          </ScrollView>
        )}
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
        fontSize: 10,
    },

    filterButtonText2: {
      color: COLORS.black, // Replace with your color for text
      fontSize: 12,
      alignItems: 'center', // Center children vertically
      justifyContent: 'center', // Center children horizontally
      fontSize: 10,
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
    backgroundColor: COLORS.primary, // A slightly darker background for the active button
  },
  filterButtonText: {
    color: 'black', // Text color
    fontWeight: '600',
  },
  activeText: {
    color: 'white', // Text color for active button
  },
  
  subHeading: {
    fontSize: 24, // Example size, adjust as needed
    fontWeight: 'bold', // Bold font weight for headings
    color: '#a98e63', // Dark color for text for better readability
    textAlign: 'center', // Center align text
    marginBottom: 10, // Space below the heading
    // Add other styling properties as needed
  },

  minorHeadings: {
    fontSize: 18, // Example size, adjust as needed
    fontWeight: 'bold', // Bold font weight for headings
    color: COLORS.black, // Dark color for text for better readability
    textAlign: 'center', // Center align text
    marginBottom: 10, // Space below the heading
    // Add other styling properties as needed
  },
  picker: {
    // Your existing picker styles
    width: '50%', // Set a specific width for the picker
    alignSelf: 'center', // Center the picker within its parent
    textAlign: 'center',
  },
  pickerContainer: {
    // Style for the container that holds the picker
    flexDirection: 'row', // Align children in a row
    justifyContent: 'center', // Center children horizontally
    alignItems: 'center', // Center children vertically (if the container has a height)
    // ... other styles you might need for the container
  },
  input: {
    color: 'black', // Set text color to black
    textAlign: 'center', // Center text horizontally
    alignSelf: 'center',
    fontSize: 20 // Center the TextInput container horizontally within its parent
    // ... other existing styles for input
  },
  textArea                               : {
    color: 'black', // Set text color to black
    textAlign: 'center', // Center text horizontally
    alignSelf: 'center',
    fontSize: 20 // Center the TextInput container horizontally within its parent
    // ... other existing styles for input
  },
  container: {
    marginBottom: 100,
    flex: 1,
    backgroundColor: '#fff', // Ensure this is set to white or any other color you want
    paddingBottom: 300
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // This will ensure the background color fills the entire safe area
  },

  scrollViewStyle: {
    flex: 1, // This will ensure the ScrollView expands to fill the container
    // Add any additional styles for the ScrollView here
    paddingBottom: 1000
  },
  card: {
    backgroundColor: '#fff', // Use a light background for the card
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000', // These shadow properties add a subtle shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3, // Elevation adds a shadow on Android
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4, // Add some space between the text lines
  },

  cardTextProcess: {
    fontSize: 16,
    marginBottom: 4, // Add some space between the text lines
    textAlign: 'center',
    color: COLORS.primary,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
  },

  safeArea: {
    flex: 1, // Ensure SafeAreaView takes up the full screen
    backgroundColor: '#fff', // This will ensure the background color fills the entire safe area

  },
  container: {
    flex: 1, // Ensure the container takes up the full space within SafeAreaView
  },
  scrollViewStyle: {
    flex: 1, // Allow ScrollView to expand
  },
  filterRowProcess: {
    flexDirection: 'row', // Align children in a row
    justifyContent: 'center', // Center children horizontally
    alignItems: 'center', // Center children vertically
    // Add any additional styling such as padding, margin, etc.
  },
  

})

export default SendScreen