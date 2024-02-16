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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, TOKEN } from '@env' // Import environment variables

import RNFetchBlob from 'rn-fetch-blob';
import { PermissionsAndroid, Platform } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { encode as btoa } from 'base-64'; 
import * as FileSystem from 'expo-file-system';

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


const openAppSettings = () => {
  if (Platform.OS === 'android') {
    Linking.openSettings();
  }
};

const downloadFile = async (url, fileName) => {
  const uri = `${FileSystem.documentDirectory}${fileName}`;
  const downloadResult = await FileSystem.downloadAsync(url, uri);
  return downloadResult.uri;
};


const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'This app needs access to your storage to download files.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the storage');
    } else {
      console.log('Storage permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};


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
    const { statements } = useContext(OtherContext); // Access statements from context
    const [filteredStatements, setFilteredStatements] = useState(statements);


    const [searchTerm, setSearchTerm] = useState('');

    const [selectedStatement, setSelectedStatement] = useState(null); // Define the state for the selected statement
    function arrayBufferToBase64(buffer) {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    
    async function fetchStatementPage(pageNumber) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const apiUrl = `${API_URL}/client/statements/${pageNumber}`;
        const fileUri = `${FileSystem.cacheDirectory}statement_${pageNumber}.pdf`;
    
        const response = await axios.get(apiUrl, {
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const base64 = arrayBufferToBase64(response.data);
    
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
    
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          console.log('Sharing is not available');
        }
      } catch (error) {
        console.error('Error fetching and sharing PDF:', error);
      }
    }

    const handleSelectStatement = (index) => {
      if (selectedStatement === index) {
        setSelectedStatement(null); // Deselect if the same card is clicked again
      } else {
        setSelectedStatement(index);
      }
    };

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
                <Text style={styles.title}>Statements</Text>
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





 return (
  <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
    <View style={styles.filterContainer}>
      {renderHeader()}
    </View>
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={20} color={COLORS.darkGray} />
        <TextInput
          style={styles.searchBarInput}
          placeholder="Search statements"
          placeholderTextColor={COLORS.darkGray}
          value={searchTerm}
          onChangeText={handleSearch}
        />
      </View>
      <ScrollView>
        {statements.map((statement, index) => (
          <View key={index} style={styles.statementContainer}>
            <View style={styles.statementRow}>
              <Ionicons name="document" size={24} color="black" />
              <View style={styles.statementContent}>
                <Text style={styles.transactionReference}>Statement Page: {statement.stmt_pageno}</Text>
                <Text style={styles.transactionReference}>Statement From: {statement.stmt_from_date}</Text>
                <Text style={styles.transactionReference}>Statement To: {statement.stmt_to_date}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.openStatementButton}
                  onPress={() => fetchStatementPage(statement.stmt_pageno)}
                  >
              <Text style={styles.openStatementText}>Open Statement</Text>
            </TouchableOpacity>
          </View>
        ))}
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
      statementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // Add padding, margin, or any other styling as needed
      },

      statementContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
        padding: 16,
      },
      statementRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      statementContent: {
        flex: 1,
        marginRight: 10, // Adjust as needed for spacing
      },
      transactionReference: {
        fontSize: 16,
        color: COLORS.black,
      },
      openStatementButton: {
        padding: 8,
        backgroundColor: COLORS.primary, // Replace with your button color
        borderRadius: 5,
        alignSelf: 'flex-end', // Align to the left
        marginTop: 25, // Adjust as needed for spacing
      },
      openStatementText: {
        color: 'white', // Replace with your button text color
        fontSize: 14,
      },
})

export default SendScreen