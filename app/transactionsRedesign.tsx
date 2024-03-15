import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet, Modal, TouchableWithoutFeedback, FlatList, } from 'react-native'
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { throttle } from 'lodash';
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

import { SvgXml } from 'react-native-svg';

interface ContainerProps {
    item: string | number;
    isSelected: boolean;
    onSelect: () => void;
}

type Nav = {
    navigate: (value: string) => void
}



// Define icons outside the component
const Icons = {
  Voucher: <Ionicons name="pricetag" size={24} color="#a98e63" />,
  Blank: <Image source={images.transferMoney} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />,
  CardSystem: <Ionicons name="card" size={24} color="#a98e63" />,
  Q: <Ionicons name="card" size={24} color="#a98e63" />,
  NV: <Ionicons name="swap-vertical" size={24} color="#a98e63" />,
  TaxRefund: <Ionicons name="swap-vertical" size={24} color="#a98e63" />,
  NonVoucherTransfer: <Image source={images.transferMoney} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />,
  NVTS: <Image source={images.taxGold} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />,
  Default: <Image source={images.transferMoneyGold} style={{ width: 24, height: 24 }} resizeMode="contain" />,
  CO: <Ionicons name="cash-outline" size={24} color="#a98e63" />,
  VO: <Ionicons name="pricetag" size={24} color="#a98e63" />,
  Gi: <Ionicons name="gift" size={24} color="#a98e63" />,
  Ta: <Image source={images.taxGold} style={{ width: 24, height: 24 }} resizeMode="contain" />,
};

const data = [1, 2, 5, 20,25, 50, 100, 500, 1000, 2500];


const Container: React.FC<ContainerProps> = ({ item, isSelected, onSelect }) => (
  <TouchableOpacity
  key={index}
  style={[
    styles.transactionContainer,
    index === selectedTransaction ? styles.selectedStyle : null,
  ]}
  onPress={() => handleSelectTransaction(index)}
>
  {/* Transaction item content */}
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
    const [activeFilter, setActiveFilter] = useState('all'); // Default to showing all transactions
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    let runningBalance = currentBalance; // Start with the initial balance
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransactionDetails, setSelectedTransactionDetails] = useState(null);

    const [stickyHeader, setStickyHeader] = useState('');
    const flatListRef = useRef(null);
    const { statements } = useContext(OtherContext); // Access statements from context
    const [sections, setSections] = useState([]); // Initialize sections state
    const [isLoading, setIsLoading] = useState(false);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true); // Assume more transactions are available initially
    const [processedTransactions, setProcessedTransactions] = useState([]); // Holds all loaded transactions
    const [searchTerm, setSearchTerm] = useState('');

    const throttledOnScroll = throttle((event) => {
      // This function will be called at most once every 100 milliseconds
      // You can implement any logic here that needs to respond to scroll events
      // For example, logging the scroll position:
      // console.log(event.nativeEvent.contentOffset.y);
    }, 10);

      const transformedData = sections.reduce((acc, section) => {
    // Add section header
    acc.push({ type: 'header', title: section.title, id: `header-${section.title}` });

    // Add items for the section
    section.data.forEach((item, index) => {
      acc.push({ type: 'item', ...item, id: item.id || `item-${section.title}-${index}` });
    });

    return acc;
  }, []);

    const formatTransactionDetail = (key, value) => {
      let formattedKey = key.replace(/_/g, ' '); // Replace underscores with spaces
      formattedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1); // Capitalize the first letter
    
      // Handle specific value formatting here if necessary
      let formattedValue = value;
      if (key === 'date') {
        formattedValue = new Date(value).toLocaleDateString('en-GB');
      } else if ((key === 'credit' || key === 'debit') && value > 0) {
        formattedValue = `£${value.toFixed(2)}`;
      } else if (key === 'credit' || key === 'debit') {
        return null; // Do not display credit/debit if value is not greater than 0
      } else if (key === 'tt_id') {
        switch (value) {
          case 'CO':
            formattedValue = 'Commission';
            break;
          case 'Gi':
            formattedValue = 'Gift Aid';
            break;
          case 'VO':
            formattedValue = 'Voucher';
            break;
          case 'NV':
            formattedValue = 'NVTS';
            break;
          default:
            formattedValue = value; // Default case if none of the above matches
        }
      }
      return {formattedKey, formattedValue};
    };
 
    const handleFilter = (filterType) => {
      setActiveFilter(filterType);
      let filtered;
      switch (filterType) {
          case 'in':
              filtered = transactions.filter(t => t.credit > 0);
              break;
          case 'out':
              filtered = transactions.filter(t => t.debit > 0);
              break;
          case 'all':
              filtered = transactions;
              break;
          // Add case for 'receipt' or any other filters if necessary
          default:
              filtered = transactions;
              break;
      }
      const groupedByDate = groupTransactionByDate(filtered);
      setSections(groupedByDate); // Update sections state with grouped transactions
  };


  const TransactionDetailsModal = React.memo(({ isVisible, onClose, transaction }) => {
    const formatDate = useCallback((dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }, []); // No dependencies, so this callback never changes

    if (!transaction) return null;
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Transaction Details</Text>
          
          {/* Displaying various transaction details */}
          <Text style={styles.modalText}>Date: {formatDate(transaction.date)}</Text>
          <Text style={styles.modalText}>Category: {transaction.txncategory || 'N/A'}</Text>
          <Text style={styles.modalText}>Description: {transaction.dc_description || 'N/A'}</Text>
          <Text style={styles.modalText}>Payment Reference: {transaction['payment reference'] || 'N/A'}</Text>
          <Text style={styles.modalText}>Amount: £{transaction.debit > 0 ? transaction.debit.toFixed(2) : transaction.credit.toFixed(2)}</Text>
          <Text style={styles.modalText}>Transaction Type: {transaction.tt_id || 'N/A'}</Text>
          <Text style={styles.modalText}>DN ID: {transaction.dn_id || 'N/A'}</Text>
          <Text style={styles.modalText}>RegCharNo: {transaction.regcharno || 'N/A'}</Text>
   
  
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
  <Text style={styles.closeButtonText}>Close</Text>
</TouchableOpacity>
        </View>
      </Modal>
    );
  });
    
  const handleSearch = useCallback((text) => {
    setSearchTerm(text);
    if (text === '') {
        setFilteredTransactions(transactions); // Show all transactions if search is cleared
    } else {
        const filtered = transactions.filter(transaction =>
            transaction['payment reference'] && transaction['payment reference'].toLowerCase().includes(text.toLowerCase())
        );
        setFilteredTransactions(filtered); // Update the state with the filtered transactions
    }
}, [transactions]);




      const handleScroll = (event) => {
        // Determine the current sticky header based on scroll position
        // This is a simplified example; you'll need to calculate based on your data and item height
        const currentOffset = event.nativeEvent.contentOffset.y;
        const currentItemIndex = Math.floor(currentOffset / ITEM_HEIGHT); // Replace ITEM_HEIGHT with your item height
        const currentHeader = processedTransactions[currentItemIndex].date;
        setStickyHeader(currentHeader);
      };

      const renderStickyHeader = () => (
        <View style={styles.stickyHeaderContainer}>
          <Text style={styles.stickyHeaderText}>{stickyHeader}</Text>
        </View>
      );
      const RenderTransaction = React.memo(({ item, index }) => {
        const onPressHandler = () => {
          setSelectedTransactionDetails(item); // Set the selected transaction details
          setIsModalVisible(true); // Show the modal
        };
      
        return (
          <TouchableOpacity
            key={index}
            style={styles.transactionContainer}
            onPress={onPressHandler}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionDescription}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.transactionReferenceContainer}>
                    {getCategoryIcon(item.txncategory, item.tt_id)}
                  </View>
                  <Text style={styles.transactionReferenceText}>
                    {item['payment reference'] ? item['payment reference'] : item.dc_description}
                  </Text>
                </View>
              </View>
              <View style={styles.balanceContainer}>
                <Text style={{ color: '#a98e63', fontSize:24 }}>
                  {item.debit > 0 ? "-" : "+"}
                </Text>
                <Text style={{ color: 'black' }}>
                  £{item.debit > 0 ? item.debit.toFixed(2) : item.credit.toFixed(2)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      });
    const getFilteredTransactions = () => {
     
        switch (activeFilter) {
            case 'Out':
                return transactions.filter(t => t.debit > 0);
            case 'In':
                return transactions.filter(t => t.credit > 0);
                case 'All':
            return transactions; // return all transactions when filter is 'all'
            case 'receipt':
                // Implement receipt creation logic
                break;
            default:
                return transactions;
        }
    };


    const handleNavigateToCreateReceipt = () => {
      navigation.navigate('CreateReceipt');
  };


  const groupTransactionByDate = (transactions) => {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = transaction.date; // Assuming 'date' is a property of your transactions
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});

    // Convert to array format expected by SectionList
    return Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date],
    }));
  };
         
  useEffect(() => {



    // Function to group transactions by date
    const groupTransactionsByDate = (transactions) => {
      const grouped = transactions.reduce((acc, transaction) => {
        const date = transaction.date; // Assuming 'date' is a property of your transactions
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(transaction);
        return acc;
      }, {});
  
      // Convert to array format expected by SectionList
      return Object.keys(grouped).map(date => ({
        title: date,
        data: grouped[date],
      }));
    };
  
    console.log("filteredTransactions state updated:", filteredTransactions);
    const updatedSections = groupTransactionsByDate(filteredTransactions);
    console.log("Grouped transactions:", updatedSections);
    setSections(updatedSections);
  }, [filteredTransactions]);


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
                <Text style={styles.title}>Transactions</Text>
                <TouchableOpacity onPress={handleNavigateToCreateReceipt}>
            <Image
                source={icons.more}
                contentFit='contain'
                style={styles.moreIcon}
            />
        </TouchableOpacity>
            </View>
        )
    }

    const getCategoryIcon = (category, tt_id) => {
      if (category) {
        return Icons[category] || Icons.Default;
      } else {
        return Icons[tt_id] || Icons.Default;
      }
    };

      const formatNumber = (num) => {
        let [base, exponent] = num.toExponential(2).split('e');
        let [lead, decimal] = base.split('.');
        lead = lead.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${lead}.${decimal}e${exponent}`;
      };


      const handleSelectTransaction = (selectedIndex) => {
        // Assuming 'setSelectedTransaction' is a state setter function that updates the state
        // to keep track of the currently selected transaction's index
        setSelectedTransaction(selectedIndex);
      
        // Optionally, if you want to log the selected transaction
        const selectedTransaction = transactions[selectedIndex];
        console.log(`Selected transaction at index ${selectedIndex}:`, selectedTransaction);
      };
    
    

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      {renderHeader()}

 
      <View style={styles.whiteBackgroundContainer}>
      <View style={styles.filterRow}>
      <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'all' ? styles.activeButton : null]}
    onPress={() => handleFilter('all')}
  >
    <Text style={[styles.filterButtonText, activeFilter === 'all' ? styles.activeText : null]}>All</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'in' ? styles.activeButton : null]}
    onPress={() => handleFilter('in')}
  >
    <Text style={[styles.filterButtonText, activeFilter === 'in' ? styles.activeText : null]}>In</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.filterButton, activeFilter === 'out' ? styles.activeButton : null]}
    onPress={() => handleFilter('out')}
  >
    <Text style={[styles.filterButtonText, activeFilter === 'out' ? styles.activeText : null]}>Out</Text>
  </TouchableOpacity>
</View>

</View>

<View style={{ flex: 1 }}>
      {/* Your SectionList or other components here */}
      <TransactionDetailsModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        transaction={selectedTransactionDetails}
      />
    </View>
<View style={styles.searchBarContainer}>
      <Feather name="search" size={20} color={COLORS.darkGray} />
      <TextInput
        style={styles.searchBarInput}
        placeholder="Search transactions"
        placeholderTextColor={COLORS.darkGray}
        value={searchTerm}
        onChangeText={handleSearch}
      />
    </View>
    <FlatList
  data={transformedData}
  keyExtractor={(item, index) => item.id.toString()}
  renderItem={({ item, index }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.stickySectionHeader}>
          <Text style={styles.sectionHeaderText}>
            {item.title.split('-').reverse().join('-')}
          </Text>
        </View>
      );
    } else {
      return (
        <RenderTransaction
          item={item}
          index={index}
        />
      );
    }
  }}
  initialNumToRender={50}
  onEndReachedThreshold={1}
  onScroll={throttledOnScroll}
/>
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
        fontSize: 13,
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
        width: '82%', // Adjust as needed
    },
   
    balanceContainer: {
        width: '18%', // Adjust as needed
        alignItems: 'flex-start', // Align text to the right
         flexDirection: 'row', // Align children in a row
    alignItems: 'center'
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 40,
        marginBottom: 16,
        backgroundColor: COLORS.primary,
        height: 78,
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
    backgroundColor: COLORS.primary, // Match the list background color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Add a bottom border for visual separation
    borderBottomColor: '#E0E0E0', // Use a light color for the border
    zIndex: 1, // Ensure the header is above the list items
    justifyContent: 'center', // Centers content vertically within the container
    alignItems: 'center', // Centers content horizontally within the container
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
    textAlign: 'center', // Ensures text is centered within the text component itself
  },
  headerText: {
    // ... other header text styles, like font size, font weight, etc.
    color: 'white', // This sets the text color to white
    textAlign: 'center', // Center the text
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
    fontSize: 15
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
transactionCategory: {
  flexDirection: 'row', // Ensures inline behavior
  flexWrap: 'wrap', // Allows items to wrap to the next line
},
transactionReferenceContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'white', // Assuming COLORS.primary is defined in your constants
  padding: 8,
  borderRadius: 5,
  borderWidth: 1, // Added a thin border
  borderColor: '#a98e63 ', // Border color set to grey
},
transactionReferenceText: {
  color: 'black', // Set text color to white
  marginLeft: 10, // Add some space between the icon and the text
  fontWeight: '600', // Thicker than normal but thinner than bold
},
transactionDetailsHeading: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#333', // Example color
  marginTop: 20,
  marginBottom: 10,
  marginLeft: 10, // Adjust as needed for your layout
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
  width: '80%', // Adjust width as needed
  alignSelf: 'center',
},
modalTitle: {
  marginBottom: 15,
  textAlign: "center",
  fontSize: 20,
  fontWeight: "bold",
},
modalText: {
  textAlign: "center",
  fontSize: 16,
  marginBottom: 10,
},
closeButton: {
  marginTop: 20,
  backgroundColor: COLORS.primary, // Example color
  borderRadius: 20,
  padding: 10,
  elevation: 2,
  color: COLORS.white,
  width: '80%', // Adjust width as needed
},
closeButtonText: {
  color: "white",
  fontWeight: "bold",
  textAlign: "center",
}
});

export default SendScreen
