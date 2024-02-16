import { View, Text, TouchableOpacity,SafeAreaView,ScrollView, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useEffect, useContext } from 'react';

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
    const [activeFilter, setActiveFilter] = useState('all'); // 'in', 'out', or 'receipt'
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    let runningBalance = currentBalance; // Start with the initial balance
    const [filteredTransactions, setFilteredTransactions] = useState(transactions);


    const [searchTerm, setSearchTerm] = useState('');


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
    const getFilteredTransactions = () => {
        switch (activeFilter) {
            case 'in':
                return transactions.filter(t => t.debit > 0);
            case 'out':
                return transactions.filter(t => t.credit > 0);
            case 'receipt':
                // Implement receipt creation logic
                break;
            default:
                return transactions;
        }
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
                <Text style={styles.title}>Transactions</Text>
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

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Voucher':
              return <Ionicons name="pricetag" size={36} color="black" />;
            case 'Blank':
              return <Ionicons name="document-outline" size={36} color="black" />;
            case 'Card Syste':
              return <Ionicons name="card" size={36} color="black" />;
            case 'NV':
              return <Ionicons name="swap-vertical" size={36} color="black" />; // Alternative icon for 'Non Voucher Transfer'
              default:
              return <Ionicons name="pricetag" size={36} color="black" />; // Generic default icon
          }
      };
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
    
    


  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>




<View style={styles.filterContainer}>
{renderHeader()}

console.log({ transactions })
<View style={styles.whiteBackgroundContainer}>
  <View style={styles.filterRow}>
    <TouchableOpacity
      style={[styles.filterButton, styles.definedButton]}
      onPress={() => handleFilter('in')}
    >
        
      <Text style={[styles.filterButtonText, styles.definedText]}>Transactions In</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.filterButton, styles.definedButton]}
      onPress={() => handleFilter('out')}
    >
      <Text style={[styles.filterButtonText, styles.definedText]}>Transactions Out</Text>
    </TouchableOpacity>
  </View>
  <View style={styles.createReceiptContainer}>
    <TouchableOpacity
      style={[styles.filterButton, styles.definedButton]}
      onPress={() => handleFilter('receipt')}
    >
      <Text style={[styles.filterButtonText, styles.definedText]}>Create Receipts</Text>
    </TouchableOpacity>
  </View>
</View>
            </View>
        {/* ... other components ... */}
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>
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
    <ScrollView>
      {filteredTransactions.map((transaction, index) => {
        // Update the running balance for each transaction
        runningBalance += transaction.debit;
        runningBalance -= transaction.credit;

        return (
          <TouchableOpacity
            key={index}
            style={styles.transactionContainer}
            onPress={() => handleSelectTransaction(index)}
          >
            {selectedTransaction === index ? (
              // Detailed view for the selected transaction
              <View style={styles.transactionDetailContainer}>
                <Text style={styles.detailText}>Date: {transaction.date}</Text>
                <Text style={styles.detailText}>Payment Reference: {transaction['payment reference']}</Text>
                <Text style={styles.detailText}>Registration Number: {transaction.regcharno}</Text>
                <Text style={styles.detailText}>Debit: {transaction.debit}</Text>
                <Text style={styles.detailText}>Credit: {transaction.credit}</Text>
                <Text style={styles.detailText}>Transaction Type ID: {transaction.tt_id}</Text>
                <Text style={styles.detailText}>Ordering: {transaction.ordering}</Text>
                <Text style={styles.detailText}>Transaction Category: {transaction.txncategory}</Text>
                <Text style={styles.detailText}>Running Balance: £{runningBalance.toFixed(2)}</Text>
              </View>
            ) : (
              // Summary view for the transaction
              <View style={styles.transactionHeader}>
              <View style={styles.transactionDescription}>
              <View style={styles.transactionHeader}>
  <View style={{ flex: 1 }}>
    <Text style={styles.transactionIndex}>{index + 1}</Text>
  </View>
  <View style={{ flex: 3, alignItems: 'flex-end' }}>
    <Text style={styles.transactionDate}>{transaction.date}</Text>
  </View>
</View>
                <Text style={styles.transactionReference}>
                {getCategoryIcon(transaction.txncategory)}
                  {transaction['payment reference']}
                </Text>
              </View>
              <View style={styles.balanceContainer}>
              <Text>
              {transaction.debit > 0 ? (
  <Text style={{ color: '#a98e63', fontSize: 24 }}>+</Text>
) : (
  <Text style={{ color: '#a98e63', fontSize: 24 }}>-</Text>
)}
  <Text style={{ color: 'black' }}>£
    {transaction.debit > 0 ? transaction.debit.toFixed(2) : transaction.credit.toFixed(2)}
  </Text>
</Text>
              </View>
            </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
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
    transactionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
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
      
})

export default SendScreen