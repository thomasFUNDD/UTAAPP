import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Modal, TouchableWithoutFeedback, SectionList, FlatList } from 'react-native'
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


interface ContainerProps {
    item: string | number;
    isSelected: boolean;
    onSelect: () => void;
}

type Nav = {
    navigate: (value: string) => void
}


const data = [1, 2, 5, 20, 25, 50, 100, 500, 1000, 2500];


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

    const [stickyHeader, setStickyHeader] = useState('');
    const flatListRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [totalFaceValue, setTotalFaceValue] = useState(0);

    const [quantities, setQuantities] = useState({
        quantity100x50p: '',
        quantity50x1: '',
        quantity50x2: '',
        quantity50x3: '',
        quantity50x5: '',
        quantity50x10: '',
        quantity50x15: '',
        quantity50x18: '',
        quantity50x20: '',
        quantity50x25: '',
        quantity50x36: '',
        quantity50x50: '',
        quantity50x72: '',
        quantity50x100: '',
        quantity50x0: '',
    });

    const handleQuantityChange = (key, value) => {
        setQuantities((prevQuantities) => ({
            ...prevQuantities,
            [key]: value,
        }));
        calculateTotalFaceValue();
    };

    const calculateTotalFaceValue = () => {
        const total =
            parseInt(quantities.quantity50x1) * 50 +
            parseInt(quantities.quantity50x2) * 100 +
            parseInt(quantities.quantity50x3) * 150 +
            parseInt(quantities.quantity50x5) * 250 +
            parseInt(quantities.quantity50x10) * 500 +
            parseInt(quantities.quantity50x15) * 750 +
            parseInt(quantities.quantity50x18) * 900 +
            parseInt(quantities.quantity50x20) * 1000 +
            parseInt(quantities.quantity50x25) * 1250 +
            parseInt(quantities.quantity50x36) * 1800 +
            parseInt(quantities.quantity50x50) * 2500 +
            parseInt(quantities.quantity50x72) * 3600 +
            parseInt(quantities.quantity50x100) * 5000 +
            parseInt(quantities.quantity50x0) * 0;
        setTotalFaceValue(total);
    };

    const handleOrder = () => {
        // Process the order here
        console.log(`Ordered quantities: ${JSON.stringify(quantities)}`);
    };

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                </TouchableOpacity>
                <Text style={styles.title}>Order Booksdfs</Text>
                <TouchableOpacity>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            <FlatList
                data={[
                    { key: 'prepaid', title: 'Pre-Paid vouchers' },
                    { key: 'preprinted', title: 'Pre-Printed Voucher Books' },
                    { key: 'blank', title: 'Blank voucher books' },
                    { key: 'total', title: 'Order Total' },
                ]}
                renderItem={({ item }) => {
                    switch (item.key) {
                        case 'prepaid':
                            return (
                                <>
                                    <Text style={styles.subHeading}>{item.title}</Text>
                                    <Text style={styles.minorHeadings}>Book of 100 vouchers x 50p vouchers</Text>
                                    <Picker
                                        selectedValue={quantities.quantity50x50}
                                        onValueChange={(itemValue) => handleQuantityChange('quantity50x50', itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Book Quantity" value="" />
                                        {[...Array(51).keys()].map((i) => (
                                            <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                                        ))}
                                    </Picker>

                                    <Text style={styles.minorHeadings}>Book of 50 vouchers x £1.00 vouchers</Text>
                                    <Picker
                                        selectedValue={quantities.quantity100x50p}
                                        onValueChange={(itemValue) => handleQuantityChange('quantity100x50p', itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Book Quantity" value="" />
                                        {[...Array(51).keys()].map((i) => (
                                            <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                                        ))}
                                    </Picker>
                                </>
                            );
                        case 'preprinted':
                            return (
                                <>
                                    <Text style={styles.subHeading}>{item.title}</Text>
                                    <Text style={styles.minorHeadings}>Book of 50 vouchers x £2.00 vouchers</Text>
                                    <Picker
                                        selectedValue={quantities.quantity50x2}
                                        onValueChange={(itemValue) => handleQuantityChange('quantity50x2', itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Book Quantity" value="" />
                                        {[...Array(51).keys()].map((i) => (
                                            <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                                        ))}
                                    </Picker>

                                    <Text style={styles.minorHeadings}>Book of 50 vouchers x £3.00 vouchers</Text>
                                    <Picker
                                        selectedValue={quantities.quantity50x3}
                                        onValueChange={(itemValue) => handleQuantityChange('quantity50x3', itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Book Quantity" value="" />
                                        {[...Array(51).keys()].map((i) => (
                                            <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                                        ))}
                                    </Picker>

                                    {/* Render the rest of the Pre-Printed Voucher Books */}
                                </>
                            );
                        case 'blank':
                            return (
                                <>
                                    <Text style={styles.subHeading}>{item.title}</Text>
                                    <Picker
                                        selectedValue={quantities.quantity50x0}
                                        onValueChange={(itemValue) => handleQuantityChange('quantity50x0', itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Book Quantity" value="" />
                                        {[...Array(51).keys()].map((i) => (
                                            <Picker.Item key={i} label={`${i}`} value={i.toString()} />
                                        ))}
                                    </Picker>
                                </>
                            );
                        case 'total':
                            return (
                                <>
                                    <Text style={styles.subHeading}>{item.title}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Total face Value"
                                        value={`£${totalFaceValue.toFixed(2)}`}
                                        editable={false}
                                    />
                                    <TextInput
                                        style={styles.textArea}
                                        placeholder="Any special instructions or requirements"
                                        multiline
                                        numberOfLines={4}
                                    />
                                    <Button title="Order Books" onPress={handleOrder} />
                                </>
                            );
                        default:
                            return null;
                    }
                }}
                keyExtractor={(item) => item.key}
            />
        </View>
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
  
  subHeading: {
    fontSize: 24, // Example size, adjust as needed
    fontWeight: 'bold', // Bold font weight for headings
    color: '#a98e63', // Dark color for text for better readability
    textAlign: 'center', // Center align text
    marginBottom: 30, // Space below the heading
    // Add other styling properties as needed
  },

  minorHeadings: {
    fontSize: 18, // Example size, adjust as needed
    fontWeight: 'bold', // Bold font weight for headings
    color: COLORS.black, // Dark color for text for better readability
    textAlign: 'center', // Center align text
    marginBottom: 20, // Space below the heading
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
    backgroundColor: "white"
  },
})

export default SendScreen