import { ScrollView,Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, FlatList } from 'react-native';
import React, { useState, useEffect, useContext, memo, useCallback, useRef, lazy, Suspense } from 'react';
import { COLORS, images } from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { Octicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, TOKEN } from '@env'; // Import environment variables
import axios from 'axios';
import BalanceContext from '../../data/balancesContext';
import Icon from 'react-native-vector-icons/FontAwesome';
import OtherContext from '../../data/otherContext';
import { InteractionManager } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';
import { Menu, Button } from 'react-native-paper';

// Lazy load components
const SubHeaderItem = lazy(() => import('../../components/SubHeaderItem'));
const Card = lazy(() => import('../../components/Card'));
const SavingCard = lazy(() => import('../../components/SavingCard'));

export interface BalanceContextType {
  currentBalance: number;
  setCurrentBalance: (balance: number) => void;
}

type Nav = {
  navigate: (value: string) => void;
};

const SearchBar = memo(({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(() => {
    onSearch(searchQuery);
  }, [onSearch, searchQuery]);

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
});

const TransactionModal = memo(({ isVisible, transaction, onRequestClose }) => {
  const formatTransactionDetail = useCallback((key, value) => {
    let formattedKey = key.replace(/_/g, ' ');
    formattedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

    let formattedValue = value;
    if (key === 'date') {
      formattedValue = new Date(value).toLocaleDateString('en-GB');
    } else if ((key === 'credit' || key === 'debit') && value > 0) {
      formattedValue = `£${value.toFixed(2)}`;
    } else if (key === 'credit' || key === 'debit') {
      return null;
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
          formattedValue = value;
      }
    }

    return `${formattedKey}: ${formattedValue}`;
  }, []);

  const TransactionModalContent = useCallback(({ transaction }) => {
    return (
      <View>
        <Text style={modalStyles.modalText}>Transaction Details</Text>
        {Object.entries(transaction).map(([key, value]) => {
          const detail = formatTransactionDetail(key, value);
          return detail ? <Text key={key}>{detail}</Text> : null;
        })}
      </View>
    );
  }, [formatTransactionDetail]);

  return (
    <Modal transparent={true} visible={isVisible} onRequestClose={onRequestClose}>
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          {transaction ? (
            <TransactionModalContent transaction={transaction} />
          ) : (
            <Text>No transaction data available.</Text>
          )}
          <TouchableOpacity style={modalStyles.button} onPress={onRequestClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const HomeScreen = () => {
  const { navigate } = useNavigation<Nav>();
  const route = useRoute();
  const [userToken, setUserToken] = useState(null);
  const [fullName, setFullName] = useState('');
  const [vaccountno, setVaccountno] = useState('');
  const { currentBalance, setCurrentBalance } = useContext<BalanceContextType>(BalanceContext);
  const { setCharities } = useContext(OtherContext);
  const { setUniqueCharities } = useContext(OtherContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { statements, setStatements } = useContext(OtherContext);
  const { standingOrders, setStandingOrders } = useContext(OtherContext);
  const { transactions, setTransactions } = useContext(OtherContext);
  const { voucherDetails, setVoucherDetails } = useContext(OtherContext);
  const { accountDetails, setAccountDetails } = useContext(OtherContext);
  const [logoutTimeLeft, setLogoutTimeLeft] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [timeLeftIcon, setTimeLeftIcon] = useState(TimeFullIcon);
  const { setCardDetails } = useContext(OtherContext);
  const { panNumber, setPanNumber } = useContext(OtherContext);
  let runningBalance = currentBalance;

  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  const toggleExpand = useCallback(() => {
    setIsExpanded((prevState) => !prevState);
  }, []);

  useEffect(() => {
    Animated.timing(rotateAnimation, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnimation]);

  const rotateInterpolation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const showTransactionModal = useCallback(
    (transaction) => {
      InteractionManager.runAfterInteractions(() => {
        setSelectedTransaction(transaction);
        setIsModalVisible(true);
      });
    },
    []
  );

  const hideModal = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsModalVisible(false);
      setSelectedTransaction(null);
    });
  }, []);

  const getTransactionIcon = useCallback((transaction) => {
    const transactionType = transaction.tt_id.toLowerCase();

    switch (transactionType) {
      case 'donation':
        return images.transferMoney;
      case 'nvts':
        return images.moneyBlack;
      case 'nv':
        return images.cardTransaction;
      case 'co':
        return images.moneyBlack;
      case 'vo':
        return images.voucherIconProfile;
      case 'ta':
        return images.taxRefund;
      case 'gift aid':
        return images.taxRefund;
      case 'gi':
        return images.taxRefund;
      default:
        return images.transferMoney;
    }
  }, []);

  const TimeFullIcon = <Octicons name="person" size={28} color={COLORS.white} />;
  const TimeHalfIcon = <Octicons name="clock" size={28} color={COLORS.white} />;
  const TimeLowIcon = <Octicons name="alert" size={28} color={COLORS.white} />;

  const determineTimeLeftIcon = useCallback(() => {
    const minutesLeft = parseInt(timeLeft.split(':')[0], 10);

    if (minutesLeft > 10) {
      return TimeFullIcon;
    } else if (minutesLeft > 5) {
      return TimeHalfIcon;
    } else {
      return TimeLowIcon;
    }
  }, [timeLeft]);

  const TimeLeftDisplay = memo(() => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const updateTimeLeft = async () => {
        const storedTimeLeft = await AsyncStorage.getItem('timeLeft');
        setTimeLeft(storedTimeLeft || 'No time left or not logged in');
      };

      updateTimeLeft();
      const intervalId = setInterval(updateTimeLeft, 1000);

      return () => clearInterval(intervalId);
    }, []);

    const [minutes, seconds] = timeLeft.split(':').map(Number);
    const totalSecondsLeft = minutes * 60 + seconds;

    if (totalSecondsLeft <= 180) {
      return (
        <>
          <Octicons name="person" size={28} color={COLORS.white} />
          <Text style={styles.timeLeftStyle}>Time Left: {timeLeft}</Text>
        </>
      );
    } else if (totalSecondsLeft < 1) {
      AsyncStorage.removeItem('userToken');
      AsyncStorage.setItem('dataFetched', 'false');
      AsyncStorage.setItem('fullName', null);
      navigate('login');
    }

    return <Octicons name="person" size={28} color={COLORS.white} />;
  });

  const [balanceAnimatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    const checkAndFetchData = async () => {
      const token = await AsyncStorage.getItem('userToken');

      if (!token || token === '') {
        AsyncStorage.removeItem('userToken');
        AsyncStorage.setItem('fullName', null);
        AsyncStorage.setItem('dataFetched', 'false');
        navigate('login');
      }

      const dataFetched = await AsyncStorage.getItem('dataFetched');

      if (token) {
        await fetchData();
        await AsyncStorage.setItem('dataFetched', 'true');
      } else if (!fullName) {
        await fetchData();
        await AsyncStorage.setItem('dataFetched', 'true');
      }

      if (!token) {
        AsyncStorage.removeItem('userToken');
        await AsyncStorage.setItem('dataFetched', 'false');
        navigate('login');
      }
    };

    checkAndFetchData();

    const fetchData = async () => {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert('No userToken', 'userToken is not set');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const urls = [
        `${API_URL}/client/accounts/general`,
        `${API_URL}/client/accounts/balances`,
        `${API_URL}/client/distributions/nvts`,
        `${API_URL}/client/statements`,
        `${API_URL}/client/distributions/charities`,
        `${API_URL}/client/vouchers/unused`,
        `${API_URL}/webdata/standingorders/unprocessed`,
        `${API_URL}/qpay/cards/details`,
        `${API_URL}/client/accounts/transactions/filtered?count=9999&type=all`,
        `${API_URL}/webdata/standingorders/unprocessed`,
        `${API_URL}/qpay/cards/pan`,
      ];

      try {
        const responses = await Promise.all(
          urls.map((url) =>
            axios.get(url, { headers }).catch((error) => {
              if (
                error.response &&
                error.response.status === 417 &&
                (url.includes('/qpay/cards/details') || url.includes('/qpay/cards/pan'))
              ) {
                return { data: { cards: [] }, status: 417 };
              } else {
                throw error;
              }
            })
          )
        );

        const [
          generalInfoResponse,
          balanceInfoResponse,
          nvtsResponse,
          statementsResponse,
          charitiesResponse,
          voucherDetailsResponse,
          standingOrdersResponse,
          cardDetailsResponse,
          transactionsResponse,
          fourDigitNumberResponse,
        ] = responses;

        const { firstname, lastname } = generalInfoResponse.data.general[0];
        const fullName = `${firstname} ${lastname}`;
        const { currentbalance } = balanceInfoResponse.data.balances[0];

        Animated.timing(balanceAnimatedValue, {
          toValue: currentbalance,
          duration: 1000,
          useNativeDriver: false,
        }).start();

        setCurrentBalance(currentbalance);
        setFullName(fullName);

        if (Array.isArray(statementsResponse.data)) {
          setStatements(statementsResponse.data);
        }

        if (generalInfoResponse.data.general && Array.isArray(generalInfoResponse.data.general)) {
          setAccountDetails(generalInfoResponse.data.general[0]);
        }
        const vaccountno = generalInfoResponse.data.general[0]?.vaccountno;

        if (voucherDetailsResponse.data && Array.isArray(voucherDetailsResponse.data.book_categories)) {
          setVoucherDetails(voucherDetailsResponse.data.summary);
        }

        if (cardDetailsResponse.status !== 417 && fourDigitNumberResponse.status !== 417) {
          if (cardDetailsResponse.data && Array.isArray(cardDetailsResponse.data.cards)) {
            const updatedCardDetails = cardDetailsResponse.data.cards.map((card) => ({
              ...card,
              fourDigitNumber: fourDigitNumberResponse.data,
            }));
            setPanNumber(fourDigitNumberResponse.data);
            setCardDetails(updatedCardDetails);
          }
        }

        if (standingOrdersResponse.data && Array.isArray(standingOrdersResponse.data['standing orders']) && vaccountno) {
          const allStandingOrders = standingOrdersResponse.data['standing orders'];
          const filteredStandingOrders = allStandingOrders.filter(order => order.accountno.toString() === vaccountno);
          setStandingOrders(filteredStandingOrders);

          const notAddedOrders = allStandingOrders.filter(order => order.accountno.toString() !== vaccountno);
        }

        if (charitiesResponse.data && Array.isArray(charitiesResponse.data['charity details'])) {
          const filteredCharities = charitiesResponse.data['charity details'].filter(charity => charity.regchar && charity.regchar.toLowerCase() !== 'private');

          const uniqueCharities = filteredCharities.reduce((acc, charity) => {
            if (!acc.some(c => c.charity === charity.charity)) {
              acc.push({
                charity: charity.charity,
                charityno: charity.charityno,
                regchar: charity.regchar,
              });
            }
            return acc;
          }, []);

          setCharities(filteredCharities);
          setUniqueCharities(uniqueCharities);
        }

        if (Array.isArray(transactionsResponse.data['transactions per client'])) {
          const transactionData = transactionsResponse.data['transactions per client'];
          setTransactions(transactionData);
          const transactionsWithBalance = transactionData.map((transaction) => ({
            ...transaction,
            balance: currentbalance,
          }));
          setTransactions(transactionsWithBalance);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const intervalId = setInterval(() => {
      checkAndFetchData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const AccountStats = memo(({ accountBalance, donationsToday, totalDonations, vouchersHeld, standingOrders }) => {
    return null;
  });

  const StatItem = memo(({ title, value, icon }) => {
    return (
      <View style={statsStyles.statItem}>
        <Image source={icon} style={statsStyles.statIcon} />
        <Text style={statsStyles.statTitle}>{title}</Text>
        <Text style={statsStyles.statValue}>{value}</Text>
      </View>
    );
  });

  const accountStatsData = {
    accountBalance: 4388.01,
    donationsToday: 0,
    totalDonations: 2393.77,
    vouchersHeld: 6276,
    standingOrders: 0,
  };

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
            <TouchableOpacity onPress={() => navigate('topup')} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TimeLeftDisplay />
              {(() => {
                const [minutes, seconds] = timeLeft.split(':').map(Number);
                const totalSecondsLeft = minutes * 60 + seconds;
                if (totalSecondsLeft <= 180) {
                  return <Text style={{ color: COLORS.white, marginLeft: 8 }}>{timeLeft}</Text>;
                }
                return null;
              })()}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceCardView}>
            <TouchableOpacity onPress={() => navigate("topup_Alt")} style={styles.balanceCardView}>
              <Text style={styles.balanceText}>Available Balance</Text>
              <Text style={styles.balanceValue}>£{currentBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featureColumn}>
            <View style={styles.subfeatureColumn}>
              <TouchableOpacity onPress={() => navigate("history")} style={styles.featureContainer}>
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
              <TouchableOpacity onPress={() => navigate("standingOrder")} style={styles.featureContainer}>
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
                  <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                    <Ionicons name="add-circle-outline" size={24} color="#a98e63" />
                  </Animated.View>
                </TouchableOpacity>
              )}

              {isExpanded && (
                <TouchableOpacity 
                  onPress={() => panNumber ? navigate("other") : navigate("orderCard")} 
                  style={styles.featureContainer}
                >
                  <View style={styles.featureIconContainer}>
                    <Image source={images.cardDashboard} contentFit='contain' style={styles.EvenlargerFeatureIcon} />
                  </View>
                  <Text style={styles.featureText}>
                    {panNumber ? 'Card Dashboard' : 'Order Card'}
                  </Text>
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

        <ScrollView style={{ top: -40 }}>
          <AccountStats
            donationsToday={accountStatsData.donationsToday}
            totalDonations={accountStatsData.totalDonations}
            vouchersHeld={accountStatsData.vouchersHeld}
            standingOrders={accountStatsData.standingOrders}
          />
          <Suspense fallback={<ActivityIndicator />}>
            <SubHeaderItem title="Recent Transactions" subtitle="View All" onPress={() => navigate('transactionsRedesign')} />
          </Suspense>

          {transactions.slice(0, 22).map((transaction, index) => {
            let displayHeader = null;
            const displayBalance = runningBalance.toFixed(2);
            runningBalance += 3;

            const transactionDate = new Date(transaction.date).toLocaleDateString('en-GB');

            if (transactionDate !== lastHeaderDate) {
              displayHeader = transactionDate;
              lastHeaderDate = transactionDate;
            }

            return (
              <Suspense key={index.toString()} fallback={<ActivityIndicator />}>
                <SavingCard
                  header={displayHeader}
                  title={transaction['payment reference'] ? transaction['payment reference'] : transaction.dc_description}
                  subtitle={`Date: ${transactionDate}`}
                  icon={getTransactionIcon(transaction)}
                  percentage={60}
                  transactionAmount={transaction['credit'] > 0 ? `+£${transaction['credit'].toFixed(2)}` : `-£${transaction['debit'].toFixed(2)}`}
                  onPress={() => showTransactionModal(transaction)}
                  imageStyle={{ transform: [{ scale: 0.2 }] }}
                />
              </Suspense>
            );
          })}
          <TransactionModal isVisible={isModalVisible} transaction={selectedTransaction} onRequestClose={hideModal} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

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
  timeLeftStyle:{
    color:COLORS.white,
  }
})
export default HomeScreen
