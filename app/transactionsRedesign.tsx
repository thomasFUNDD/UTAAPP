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

import { SvgXml } from 'react-native-svg';

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
    const [activeFilter, setActiveFilter] = useState('all'); // 'in', 'out', or 'receipt'
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    let runningBalance = currentBalance; // Start with the initial balance
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransactionDetails, setSelectedTransactionDetails] = useState(null);

    const [stickyHeader, setStickyHeader] = useState('');
    const flatListRef = useRef(null);
    const { statements } = useContext(OtherContext); // Access statements from context

    const [searchTerm, setSearchTerm] = useState('');


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
              filtered = transactions.filter(t => t.debit > 0);
              break;
          case 'out':
              filtered = transactions.filter(t => t.credit > 0);
              break;
          case 'all':
              filtered = transactions;
              break;
          // Add case for 'receipt' or any other filters if necessary
          default:
              filtered = transactions;
              break;
      }
      setFilteredTransactions(filtered);
  };


  const TransactionDetailsModal = ({ isVisible, onClose, transaction }) => {
    if (!transaction) return null;
  
    // Example of formatting a date string, adjust according to your date format
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  
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


      const handleScroll = (event) => {
        // Determine the current sticky header based on scroll position
        // This is a simplified example; you'll need to calculate based on your data and item height
        const currentOffset = event.nativeEvent.contentOffset.y;
        const currentItemIndex = Math.floor(currentOffset / ITEM_HEIGHT); // Replace ITEM_HEIGHT with your item height
        const currentHeader = transactions[currentItemIndex].date;
        setStickyHeader(currentHeader);
      };

      const renderStickyHeader = () => (
        <View style={styles.stickyHeaderContainer}>
          <Text style={styles.stickyHeaderText}>{stickyHeader}</Text>
        </View>
      );
      const renderTransaction = ({ item, index }) => {


        // Log the transaction details
       
        console.log(`Rendering transaction at index ${item}. Selected: ${selectedTransaction === index}`);
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
                <Text>
                  {item.debit > 0 ? (
                    <Text style={{ color: '#a98e63', fontSize: 24 }}>+</Text>
                  ) : (
                    <Text style={{ color: '#a98e63', fontSize: 24 }}>-</Text>
                  )}
                  <Text style={{ color: 'black' }}>
                    £{item.debit > 0 ? item.debit.toFixed(2) : item.credit.toFixed(2)}
                  </Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>
      );
    };
    const getFilteredTransactions = () => {
        switch (activeFilter) {
            case 'in':
                return transactions.filter(t => t.debit > 0);
            case 'out':
                return transactions.filter(t => t.credit > 0);
                case 'all':
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
         
    const groupTransactionsByDate = (transactions) => {
      return transactions.reduce((acc, transaction) => {
          const date = transaction.date;
          if (!acc[date]) {
              acc[date] = [];
          }
          acc[date].push(transaction);
          return acc;
      }, {});
  };
  const groupedTransactions = groupTransactionsByDate(getFilteredTransactions());


  const renderSectionHeader = ({ section: { title } }) => {
    // Parse the title as a date
    const sectionDate = new Date(title);
    const now = new Date();
    
    // Helper function to format the date as "Month day, year"
    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    };
  
    // Check if the section date is today or yesterday
    const isToday = sectionDate.toDateString() === now.toDateString();
    const isYesterday = sectionDate.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString();
  
    // Determine the header text
    let headerText;
    if (isToday) {
      headerText = 'Today';
    } else if (isYesterday) {
      headerText = 'Yesterday';
    } else {
      headerText = formatDate(sectionDate);
    }
  
    return (
      <View style={styles.stickySectionHeader}>
        <Text style={styles.sectionHeaderText}>{headerText}</Text>
      </View>
    );
  };

    const sections = Object.keys(groupedTransactions).map(date => ({
    title: date,
    data: groupedTransactions[date],
  }));
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
      
      // Check if category is not null and not empty
      const svgXml = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><rect width="448" height="256" x="32" y="80" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32" rx="16" ry="16" transform="rotate(180 256 208)"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M64 384h384M96 432h320"/><circle cx="256" cy="208" r="80" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M480 160a80 80 0 0 1-80-80M32 160a80 80 0 0 0 80-80m368 176a80 80 0 0 0-80 80M32 256a80 80 0 0 1 80 80"/></svg>`;

      if (category) {
        switch (category) {
          case 'Voucher':
            return <Ionicons name="pricetag" size={24} color="#a98e63" />;
          case 'Blank':
            return <Image source={images.transferMoney} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />;
            case 'Card System':
            return <Ionicons name="card" size={24} color="#a98e63" />;

            case 'Q':
              return <Ionicons name="card" size={24} color="#a98e63" />;
          case 'NV':
            return <Ionicons name="swap-vertical" size={24} color="#a98e63" />;
          case 'Tax Refund':
            return <Ionicons name="swap-vertical" size={24} color="#a98e63" />;

            case 'Non Voucher Transfer':
              return <Image source={images.transferMoney} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />;
          
                case 'NVTS':
                  return <Image source={images.taxGold} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />;

                  case 'NV':
                    return <Image source={images.transferMoney} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />;
          default:
            return <Image source={images.transferMoneyGold} style={{ width: 24, height: 24 }} resizeMode="contain" />;
        }
      } else {
        // Category is null or empty, check tt_id
        switch (tt_id) {
          case 'CO':
            return <Ionicons name="cash-outline" size={24} color="#a98e63" />;
          case 'VO':
            return <Ionicons name="pricetag" size={24} color="#a98e63" />;
          case 'NV':
            return <Image source={images.transferMoney} style={{ width: 24, height: 24, tintColor: COLORS.primary }} resizeMode="contain" />;
            
            case 'NVTS':
              return <Image source={images.transferMoney} style={{ width: 24, height: 24 }} resizeMode="contain" />;
          case 'Gi':
            return <Ionicons name="gift" size={24} color="#a98e63" />;
          case 'Ta':
            // Use the Image component for displaying image assets
            return <Image source={images.taxGold} style={{ width: 24, height: 24 }} resizeMode="contain" />;
          default:
            return <Ionicons name="card" size={24} color="#a98e63" />;
        }
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
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderTransaction}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
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
    backgroundColor: COLORS.primary, // Match the list background color
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1, // Add a bottom border for visual separation
    borderBottomColor: '#E0E0E0', // Use a light color for the border
    zIndex: 1, // Ensure the header is above the list items
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'white'
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