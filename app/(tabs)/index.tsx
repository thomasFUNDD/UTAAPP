import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useContext, memo } from 'react';
import { FlatList } from 'react-native';
import { COLORS, images } from '../../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'expo-image'
import { Octicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import { TextInput } from 'react-native';
import SubHeaderItem from '../../components/SubHeaderItem'
import Card from '../../components/Card'
import { userCards } from '../../data'
import SavingCard from '../../components/SavingCard'
import { ScrollView } from 'react-native-virtualized-view'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL, TOKEN } from '@env' // Import environment variables
import axios from 'axios';
import BalanceProvider from '../../data/BalanceProvider'; // Adjust the path as necessary
import BalanceContext from '../../data/balancesContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import otherContext from '../../data/otherContext';
import otherContextProvider from '../../data/otherContextProvider';
import OtherContext from '../../data/otherContext';
import { InteractionManager } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FaTicketAlt } from 'react-icons/fa';
import { Ionicons } from 'react-native-vector-icons';
import { Menu, Button } from 'react-native-paper';




 // Adjust the path as necessary



export interface BalanceContextType {
  currentBalance: number;
  setCurrentBalance: (balance: number) => void;
}

type Nav = {
  navigate: (value: string) => void
}

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
        <Icon name="search" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const TransactionModalContent = memo(({ transaction }) => {
  // Transaction details components
  return (
    <>
      <Text style={modalStyles.modalText}>Transaction Details</Text>
      {/* ... other transaction details */}
    </>
  );
});

const TransactionModal = ({ isVisible, transaction, onRequestClose }) => {
  const [isContentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Placeholder for any setup that needs to happen when the modal is visible.
  }, [isVisible]);

  // Function to format the display of each transaction property
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

    return `${formattedKey}: ${formattedValue}`;
  };

  const TransactionModalContent = memo(({ transaction }) => {
    return (
      <View>
        <Text style={modalStyles.modalText}>Transaction Details</Text>
        {Object.entries(transaction).map(([key, value]) => {
          const detail = formatTransactionDetail(key, value);
          return detail ? <Text key={key}>{detail}</Text> : null;
        })}
      </View>
    );
  });

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onRequestClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          {transaction ? (
            <TransactionModalContent transaction={transaction} />
          ) : (
            <Text>No transaction data available.</Text>
          )}
          <TouchableOpacity
            style={modalStyles.button}
            onPress={onRequestClose}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const HomeScreen = () => {
  const { navigate } = useNavigation<Nav>();

  const route = useRoute();
  const [userToken, setUserToken] = useState(null);
  const [fullName, setFullName] = useState(''); // State to store the full name

  const [vaccountno, setVaccountno] = useState('');
  const { currentBalance, setCurrentBalance } = useContext<BalanceContextType>(BalanceContext);
    const { setCharities } = useContext(OtherContext);

    const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { statements, setStatements } = useContext(OtherContext);
  const { standingOrders, setStandingOrders } = useContext(OtherContext);
  const { transactions, setTransactions} = useContext(OtherContext);
  const { voucherDetails, setVoucherDetails} = useContext(OtherContext);

  const { accountDetails, setAccountDetails } = useContext(OtherContext);
  const [logoutTimeLeft, setLogoutTimeLeft] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [timeLeftIcon, setTimeLeftIcon] = useState(TimeFullIcon); // State to hold the current icon


  const { setCardDetails } = useContext(OtherContext);

  let runningBalance = currentBalance; // Start with the current balance

  
    // Define showTransactionModal inside the HomeScreen component
    const showTransactionModal = (transaction) => {
      requestAnimationFrame(() => {
        setSelectedTransaction(transaction);
        setIsModalVisible(true);
      });
    };
    
    const hideModal = () => {
      requestAnimationFrame(() => {
        setIsModalVisible(false);
        setSelectedTransaction(null);
      });
    };



    // Define the getTransactionIcon function within your component file, but outside of your component definition
const getTransactionIcon = (transaction) => {
 
  switch (transaction.tt_id) { // Assuming 'type' is a property of your transaction object
    
    case 'donation':
      return images.donationIcon; // Assuming you have a donationIcon in your images object
      case 'NVTS':
        return images.moneyBlack; // Assuming you have a donationIcon in your images object

        case 'NV':
          return images.moneyBlack; // Assuming you have a donationIcon in your images object
    case 'CO':
      return images.moneyBlack; // Use the existing commission icon for commission transactions
    case 'VO':
      return images.voucherIconProfile; // Assuming you have a voucherIcon in your images object
    // Add more cases as needed for different transaction types
    case 'Ta':
      return images.taxRefund; // Assuming you have a voucherIcon in your images object
    default:
      return images.defaultIcon; // A default icon for transactions without a specific type
  }
};

const TimeFullIcon = <Octicons name="person" size={28} color={COLORS.white} />;
const TimeHalfIcon = <Octicons name="clock" size={28} color={COLORS.white} />;
const TimeLowIcon = <Octicons name="alert" size={28} color={COLORS.white} />;

const determineTimeLeftIcon = () => {
  const minutesLeft = parseInt(timeLeft.split(':')[0], 10);

  if (minutesLeft > 10) {
    return TimeFullIcon;
  } else if (minutesLeft > 5) {
    return TimeHalfIcon;
  } else {
    return TimeLowIcon;
  }
};

  
  useEffect(() => {


    const updateTimeLeft = async () => {
      const storedTimeLeft = await AsyncStorage.getItem('timeLeft');
      if (storedTimeLeft) {
        setTimeLeft(storedTimeLeft);
        // Update the icon based on time left
        const minutesLeft = parseInt(storedTimeLeft.split(':')[0], 10);
        if (minutesLeft > 10) {
          setTimeLeftIcon(TimeFullIcon);
        } else if (minutesLeft > 5) {
          setTimeLeftIcon(TimeHalfIcon);
        } else {
          setTimeLeftIcon(TimeLowIcon);
        }
      } else {
        setTimeLeft('Logging out soon...');
        setTimeLeftIcon(TimeLowIcon);
      }
    };


    const processTransactions = (transactions, balance) => {
      if (!Array.isArray(transactions)) {
        console.error('Expected transactions to be an array, received:', transactions);
        return [];
      }
    
      const transactionsWithBalance = transactions.map(transaction => {
        return { ...transaction, balance };
      });
    
      return transactionsWithBalance;
    };
    
    
    const calculateTimeLeft = async () => {
      const logoutTimestamp = await AsyncStorage.getItem('logoutTimestamp');
      if (logoutTimestamp) {
        const currentTime = new Date().getTime();
        const timeLeft = parseInt(logoutTimestamp) - currentTime;

        if (timeLeft > 0) {
          // Update every second
          setTimeout(() => {
            const minutes = Math.floor((timeLeft / 1000) / 60);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            setLogoutTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          }, 1000);
        } else {
          // Handle logout
          AsyncStorage.removeItem('userToken');
          navigate('login');
        }
      }
    };
    
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
    
        const reqs = [
          { "url": `${API_URL}/client/accounts/general`, "method": "get", "headers": headers },
          { "url": `${API_URL}/client/accounts/balances`, "method": "get", "headers": headers },
          { "url": `${API_URL}/client/distributions/nvts`, "method": "get", "headers": headers },
          { "url": `${API_URL}/client/statements`, "method": "get", "headers": headers },
          { "url": `${API_URL}/client/distributions/charities`, "method": "get", "headers": headers },
          { "url": `${API_URL}/client/vouchers/unused`, "method": "get", "headers": headers },
          { "url": `${API_URL}/webdata/standingorders/unprocessed`, "method": "get", "headers": headers },
          { "url": `${API_URL}/qpay/cards/details`, "method": "get", "headers": headers },
          { "url": `${API_URL}/client/accounts/transactions/filtered?count=9999&type=all`, "method": "get", "headers": headers },
          { "url": `${API_URL}/webdata/standingorders/unprocessed`, "method": "get", "headers": headers },
          { "url": `${API_URL}/qpay/cards/pan`, "method": "GET", "headers": headers }
        ];
        try {
          const responses = await Promise.all(reqs.map(req => axios({
            method: req.method,
            url: req.url,
            headers: req.headers,
          }).then(response => {
            console.log(`Successful response from: ${req.url}`); // Log successful response

            return response;
          }).catch(error => {
            if (error.response && error.response.status === 417 && 
                (req.url.includes('/qpay/cards/details') || req.url.includes('/qpay/cards/pan'))) {
              return { data: { cards: [] }, status: 417 };
            } else {
              throw error;
            }
          })));
    

          const generalInfo = responses[0].data.general[0];
          const fullName = `${generalInfo.firstname} ${generalInfo.lastname}`;
          const balanceInfo = responses[1].data.balances[0];
          
          setCurrentBalance(balanceInfo.currentbalance);
    
          const statementsResponse = responses[3].data;
          if (Array.isArray(statementsResponse)) {
            setStatements(statementsResponse);
          }
    
          const accountDetailsResponse = responses[0].data;
          if (accountDetailsResponse.general && Array.isArray(accountDetailsResponse.general)) {
            setAccountDetails(accountDetailsResponse.general[0]);
          }
    
          const voucherDetails = responses[5].data;
          if (voucherDetails && Array.isArray(voucherDetails.book_categories)) {
            setVoucherDetails(voucherDetails.summary);
          }
    
          const cardDetailsResponse = responses[7];
          const fourDigitNumber = responses[10];
    
          if (cardDetailsResponse.status !== 417 && fourDigitNumber.status !== 417) {
            if (cardDetailsResponse.data && Array.isArray(cardDetailsResponse.data.cards)) {
              const updatedCardDetails = cardDetailsResponse.data.cards.map(card => ({
                ...card,
                fourDigitNumber: fourDigitNumber.data,
              }));
    
              setCardDetails(updatedCardDetails);
            }
          }
    
          const standingOrdersResponse = responses[9].data;
          if (standingOrdersResponse && Array.isArray(standingOrdersResponse['standing orders'])) {
            setStandingOrders(standingOrdersResponse['standing orders']);
          }
    
          const charitiesResponse = responses[4].data;
          if (charitiesResponse && Array.isArray(charitiesResponse['charity details'])) {
            setCharities(charitiesResponse['charity details']);
          }
    
          const transactionData = responses[8].data['transactions per client'];
          if (Array.isArray(transactionData)) {
            setTransactions(transactionData);
            processTransactions(transactionData, balanceInfo.currentbalance);
          }
    
          const transactionResponse = responses[8].data;
          if (transactionResponse && Array.isArray(transactionResponse['transactions per client'])) {
            setTransactions(transactionResponse['transactions per client']);
          }
    
          setFullName(fullName);
    
    
        } catch (error) {
          console.error('Axios error:', error);
          if (error.config) {
            console.error(`Error config:`, error.config);
          }
          if (error.response) {
            console.error(`Error response:`, error.response);
          }
          if (error.stack) {
            console.error('Error stack:', error.stack);
          }
        }
      } else {
        Alert.alert('No userToken', 'userToken is not set');
      }
    };
    
    fetchData();
    calculateTimeLeft();
 

  }, []);
  const renderBalanceCard = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
  
    const toggleExpand = () => setIsExpanded(!isExpanded);
  
    return (
      <View style={styles.balanceCard}>
      <View style={styles.balanceCardView}>
        <Text style={styles.balanceText}>Available Balance</Text>
        <Text style={styles.balanceValue}>£{currentBalance.toFixed(2)}</Text>
      </View>

      
      <View style={styles.featureColumn}>

        <View style={styles.subfeatureColumn}>
          <TouchableOpacity onPress={() => navigate("send")} style={styles.featureContainer}>
            <View style={styles.featureIconContainer}>
              <Image source={images.donate} contentFit='contain' style={styles.EvenlargerFeatureIcon} />
            </View>
            <Text style={styles.featureText}>Donate</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate("transactionsRedesign")} style={styles.featureContainer}>
            <View style={styles.featureIconContainer}>
              <Image source={images.donateIcon} contentFit='contain' style={styles.featureIcon} />
            </View>
            <Text style={styles.featureText}>Transactions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate("standingOrders")} style={styles.featureContainer}>
            <View style={styles.featureIconContainer}>
              <Image 
                source={images.calendarIconnew} 
                contentFit='contain' 
                style={[styles.featureIcon, styles.largerFeatureIcon]}
              />
            </View>
            <Text style={styles.featureText}>Standing Orders</Text>
          </TouchableOpacity>
          
          {!isExpanded && (
  
        <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
          <Ionicons name="add-circle-outline" size={24} color="#a98e63" />
        </TouchableOpacity>
      
    )}

          
{isExpanded && (
  
  <TouchableOpacity onPress={() =>  navigate("orderCard")} style={styles.featureContainer}>
  <View style={styles.featureIconContainer}>
    <Image source={images.cardDashboard} contentFit='contain' style={styles.EvenlargerFeatureIcon} />
  </View>
  <Text style={styles.featureText}>Order Card</Text>
</TouchableOpacity>

)}
        </View>
      </View>
      {isExpanded && (

        <View style={styles.featureColumn}>
          <View style={styles.subfeatureColumn2}>

          <TouchableOpacity onPress={() => navigate("statements")} style={styles.featureContainer}>
            <View style={styles.featureIconContainer}>
              <Image source={images.statementIcon} contentFit='contain' style={styles.featureIcon} />
            </View>
            <Text style={styles.featureText}>Statements</Text>
          </TouchableOpacity>
           
            <TouchableOpacity onPress={() => navigate("CreateReceipt")} style={styles.featureContainer}>
              <View style={styles.featureIconContainer}>
                <Image source={images.receipt} contentFit='contain' style={styles.featureIcon} />
              </View>
              <Text style={styles.featureText}>Receipts</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate("orderVouchers")} style={styles.featureContainer}>
              <View style={styles.featureIconContainer}>
                <Image source={images.tag} contentFit='contain' style={styles.featureIcon} />
              </View>
              <Text style={styles.featureText}>Vouchers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigate("profile")} style={styles.featureContainer}>
              <View style={styles.featureIconContainer}>
                <Image source={images.profile} contentFit='contain' style={styles.featureIcon} />
              </View>
              <Text style={styles.featureText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isExpanded && (
        <View style={{backgroundColor: 'white', marginLeft:70, marginRight:70, borderRadius: 10, top:-20}}>
          <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
            <Ionicons name="remove-circle-outline" size={24} color="#a98e63" />
          </TouchableOpacity>
        </View>
      )}
    </View>
    );
  };
  // Render User Debit Card
  const renderAllDebitCard = () => {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <FlatList
          horizontal
          data={userCards}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card
              number={item.number}
              balance={item.balance}
              date={item.date}
              onPress={() => console.log("Card Pressed")}
            />
          )} />
      </View>
    )
  }


  const AccountStats = ({ accountBalance, donationsToday, totalDonations, vouchersHeld, standingOrders }) => {
  
  };

  const StatItem = ({ title, value, icon }) => {
    return (
      <View style={statsStyles.statItem}>
        <Image source={icon} style={statsStyles.statIcon} />
        <Text style={statsStyles.statTitle}>{title}</Text>
        <Text style={statsStyles.statValue}>{value}</Text>
      </View>
    );
  };

  const accountStatsData = {
    accountBalance: 4388.01,
    donationsToday: 0,
    totalDonations: 2393.77,
    vouchersHeld: 6276,
    standingOrders: 0,
  };

  const statsStyles = StyleSheet.create({
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: '#a98e63',
      paddingVertical: 10,
      borderRadius: 10,
      marginHorizontal: 20,
      marginTop: 20,
    },
    statItem: {
      alignItems: 'center',
    },
    statIcon: {
      width: 24,
      height: 24,
      marginBottom: 5,
    },
    statTitle: {
      fontSize: 12,
      color: '#fff',
    },
    statValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
  });

 // Declare lastHeaderDate outside of the map function to maintain its state across iterations
let lastHeaderDate = null;

return (
  
  <SafeAreaView style={styles.area}>
    <StatusBar style="light" />
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.username}>Welcome: {fullName ? fullName : 'User'}</Text>
        </View>
        <View style={styles.headerContainer}>
  <TouchableOpacity onPress={() => navigate("topup")} style={{ flexDirection: 'row', alignItems: 'center' }}>
    {determineTimeLeftIcon()}
    {
      (() => {
        const [minutes, seconds] = timeLeft.split(':').map(Number);
        const totalSecondsLeft = minutes * 60 + seconds;
        if (totalSecondsLeft <= 180) { // Less than or equal to 3 minutes
          return <Text style={{ color: COLORS.white, marginLeft: 8 }}>{timeLeft}</Text>;
        }
        return null; // Don't render anything if more than 3 minutes
      })()
    }
  </TouchableOpacity>
</View>
      </View>
      {renderBalanceCard()}

      
      <ScrollView style={{ top: -40 }}>
  <AccountStats
    donationsToday={accountStatsData.donationsToday}
    totalDonations={accountStatsData.totalDonations}
    vouchersHeld={accountStatsData.vouchersHeld}
    standingOrders={accountStatsData.standingOrders}
  />
  <SubHeaderItem
    title="Recent Trandsactions"
    subtitle="View All"
    onPress={() => navigate("transactionsRedesign")}
  />

  {transactions.slice(0, 5).map((transaction, index) => {
     let displayHeader = null;
    // Calculate the display balance for each transaction
    const displayBalance = runningBalance.toFixed(2);
    runningBalance += 3; // Modify the running balance as needed for the next transaction

    const transactionDate = new Date(transaction.date).toLocaleDateString('en-GB');
   

    // Compare the current transaction date to the last header date
    if (transactionDate !== lastHeaderDate) {
      displayHeader = transactionDate; // Set the header to be displayed
      lastHeaderDate = transactionDate; // Update the last header date
    }

    return (
      <SavingCard
        key={index.toString()}
        header={displayHeader} // Pass the conditional header
        title={transaction['payment reference'] ? transaction['payment reference'] : transaction.dc_description}
        subtitle={`Date: ${transactionDate}`}
        icon={getTransactionIcon(transaction)} // Use the function to get the appropriate icon
        percentage={60}
        transactionAmount={transaction['credit'] > 0 ? `+£${transaction['credit'].toFixed(2)}` : `-£${transaction['debit'].toFixed(2)}`}
        balance={`£${displayBalance}`}
        onPress={() => showTransactionModal(transaction)}
        imageStyle={{ transform: [{ scale: 0.2 }] }} // Scale the image to half its size
      />
    );
  })}
  <TransactionModal
    isVisible={isModalVisible}
    transaction={selectedTransaction}
    onRequestClose={hideModal}
  />
</ScrollView>
    </View>
  </SafeAreaView>
);
}


const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 0, // Set margin to 0
    width: '100%', // Set width to 100%
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
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10, // Add some space below the search bar
    alignItems: 'center',
    backgroundColor: '#fff', // Assuming you want a white background
  },
  searchInput: {
    flex: 1,
    padding: 8,
    marginRight: 10,
    fontSize: 16, // Adjust font size as needed
  },
  searchIcon: {
    padding: 5,
    color: '#000', // Make the icon black or choose a color that makes it distinct
  }
  // ... other styles you might need for your modal
});

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.primary, // Changed from COLORS.primary to '#a98e63'
    

    marginBottom: 0,
    height: "100%"
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    marginBottom: 30,
    width: "100%"
  },
  headerContainer: {
    backgroundColor: '#a98e63', // Changed from COLORS.primary to '#a98e63'

    height: 126,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "regular",
    color: "rgba(255, 255, 255,.72)",
  },
  username: {
    fontSize: 18,
    fontFamily: "medium",
    color: COLORS.white,
    marginTop: 8
  },
  notiView: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "red",
    position: "absolute",
    top: 0,
    right: 2,
    zIndex: 999
  },
  balanceCard: {

    backgroundColor: COLORS.primary,
    borderRadius: 10,
    marginVertical: 5,
    top: -40,
    width: "100%",
    paddingBottom:10
  },
  balanceCardView: {
    justifyContent: "space-between",
    alignItems: "left",
    backgroundColor: COLORS.primary,
    paddingVertical: 10, // Add vertical padding
    paddingHorizontal: 16, // Add horizontal padding
    width: "100%"
  },
  balanceText: {
    fontSize: 16,
    fontFamily: "regular",
    color: "rgba(255, 255, 255, 0.7)", // Lighter color for the label
    marginBottom: 4, // Add some space below the label
  },
  balanceValue: {
    fontSize: 36, // Larger font size for the value
    fontFamily: "semiBold",
    color: COLORS.white, // Bright color for the value
    textShadowColor: 'rgba(0, 0, 0, 0.25)', // Optional shadow for depth
    textShadowOffset: {width: 0, height: 1}, // Shadow position
    textShadowRadius: 4 // Shadow blur radius
  },
  featureColumn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15
  },
  subfeatureColumn: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 10, // Added to round off the corners
paddingBottom:10,
    width: "100%"
  },
  subfeatureColumn2: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 10, // Added to round off the corners
    top: -13,
    width: "100%"
  },
  featureContainer: {
    width: 90, // Increased width
    height: 110, // Increased height
    padding: 10, // Increased padding
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15, // Rounded edges
    margin: 10, // Increased margin
    
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    borderWidth: 1, // Thin border width
    borderColor: COLORS.primary, // Border color set to primary color for a 3D effect
  },
  featureIconContainer: {
    height: 60, // Increased icon container size
    width: 60, // Increased icon container size
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Adjusted spacing
  },
  featureIcon: {
    height: 32,
    width: 32
  },
 
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    paddingLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontFamily: "medium",
    color: '#000',
    flex: 1, // Allow the title to shrink and grow as needed
    marginVertical: 4,
    marginRight: 8, // Add some right margin to prevent text from touching the balance
  },
  subtitle: {
    fontSize: 12, // You might want to adjust the font size to ensure it fits
    fontFamily: "regular",
    color: '#000',
    flex: 1, // Allow the subtitle to shrink and grow as needed
    marginRight: 8, // Add some right margin to prevent text from touching the balance
  },
  balance: {
    fontSize: 16,
    fontFamily: "medium",
    color: COLORS.primary,
    marginLeft: 'auto', // Keep it to the right
    marginRight: 16, // Add some margin to the right if needed
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#a98e63',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#fff',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  expandedFeatureColumn: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  featureContainer: {
    width: '25%', // Adjust the width as needed
    padding: 5, // Adjust the padding as needed
    alignItems: 'center',
  },
  featureIconContainer: {
    // Container for the icon
  },
  featureIcon: {
    height: 32, // Adjust the size as needed
    width: 32, // Adjust the size as needed
    marginBottom: 5,
  },
  largerFeatureIcon: {
    marginTop: 12,
    width: 34, // Adjust width as needed
    height: 34, // Adjust height as needed
    
    
  },
  EvenlargerFeatureIcon: {

    height:35, // Adjust the size as needed
    width: 35, // Adjust the size as needed
    marginBottom: 4,
    
  },
  featureText: {
    fontSize: 11, // Increased font size
    fontWeight: '600', // Bold font weight
    textAlign: 'center',
    color: '#a98e63', // Theme color for text
  },
  expandButton: {
    // Style for the expand button
    marginTop: 10,
    alignSelf: 'center',
  },
})
export default HomeScreen
