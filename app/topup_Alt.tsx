import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useContext,useCallback,useMemo } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { COLORS, SIZES, icons, images } from '../constants'
import Slider from '@react-native-community/slider';
import { useNavigation } from 'expo-router'
import Button from '../components/Button'
import { ScrollView } from 'react-native-virtualized-view'


import { Picker } from '@react-native-picker/picker';
import BalanceContext from '../data/balancesContext'; // Adjust the path as necessary
import OtherContext from '../data/otherContext'; // Adjust the import path as necessary

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, TOKEN } from '@env' // Import environment variables



export interface BalanceContextType {
    currentBalance: number;
    setCurrentBalance: (balance: number) => void;
  }
  

interface ContainerProps {
    item: string | number;
    isSelected: boolean;
    onSelect: () => void;
}

type Nav = {
    navigate: (value: string) => void
}

const data = [100, 200, 250, 300, 400, 500, 600, 700, 1000];


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


const TopUpScreen = () => {
    const navigation = useNavigation();
    const { navigate } = useNavigation<Nav>()
    const [modalVisible, setModalVisible] = useState(false);

    const { accountDetails} = useContext(OtherContext)
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const { statements, setStatements } = useContext(OtherContext);
    const { standingOrders, setStandingOrders } = useContext(OtherContext);
    const { transactions, setTransactions} = useContext(OtherContext);
    const { voucherDetails, setVoucherDetails} = useContext(OtherContext);
    const { cardDetails, setCardDetails } = useContext(OtherContext); // Add this line

    /**
     * Render Header
     */
    console.log(voucherDetails);

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
                <Text style={styles.title}>Deposit info</Text>
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

    /**
     * Render Card Information
     */
    const renderCardInfo = () => {
        return (
            <ScrollView style={styles.cardInfoScrollContainer}>
                <View style={styles.cardInfoContainer}>
                    {/* Bank details with card styling */}
                    <View style={styles.card}>
                        <Text style={[styles.cardTitle, styles.bankDetailsTitle]}>Bank Details</Text>
                        <Text style={styles.cardContent}>Acc Name: United Talmudical Associates Ltd</Text>
                        <Text style={styles.cardContent}>Bank: Natwest Bank</Text>
                        <Text style={styles.cardContent}>Account No: 87812894</Text>
                        <Text style={styles.cardContent}>Sort Code: 60-20-32</Text>
                        <Text style={styles.cardContent}>Reference: Account No: {accountDetails.vaccountno}</Text>
                    </View>
    
                    {/* Instructions for making a deposit with card styling */}
                    <View style={styles.card}>
                        <Text style={[styles.cardTitle, styles.depositInstructionsTitle]}>Deposit Instructions</Text>
                        <Text style={styles.cardContent}>1. Log in to your online banking.</Text>
                        <Text style={styles.cardContent}>2. Navigate to the 'Make a Payment' section.</Text>
                        <Text style={styles.cardContent}>3. Enter the bank details as shown above.</Text>
                        <Text style={styles.cardContent}>4. Enter the amount you wish to deposit.</Text>
                        <Text style={styles.cardContent}>5. Add your Reference which is your account number.  {accountDetails.vaccountno}  to the transaction</Text>
                        <Text style={styles.cardContent}>6. Confirm the transaction.</Text>
                    </View>
                </View>
            </ScrollView>
        );
    }



    
    // Render Topup

    const renderTopup = () => {
        const [sliderValue, setSliderValue] = useState(0);
        const [selectedContainer, setSelectedContainer] = useState(null);

        const handleSelectContainer = (item: any): void => {
            setSelectedContainer(item);
        };

        const handleSliderChange = (value: number): void => {
            setSliderValue(value);
        };


        return (
            <View style={{
                marginHorizontal: 16
            }}>
                <Text style={{
                    fontFamily: "medium",
                    fontSize: 16,
                    color: COLORS.primary
                }}>Enter Nominal</Text>

                <Text style={{
                    fontSize: 32,
                    color: COLORS.primary,
                    fontFamily: 'semiBold',
                    marginVertical: 18
                }}>${sliderValue.toFixed(2)}</Text>

                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    value={sliderValue}
                    onValueChange={handleSliderChange}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor="gray"
                    thumbTintColor={COLORS.primary}
                />
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginVertical: 22
                }}>
                    {

                        data.map((item, index) => (
                            <Container
                                key={index}
                                item={item}
                                isSelected={selectedContainer === item}
                                onSelect={() => handleSelectContainer(item)}
                            />
                        )
                        )
                    }
                </View>
                <Button
                    title="Proceed"
                    onPress={() => setModalVisible(true)}
                    filled
                />
                <Button
                    title="Cancel"
                    style={{
                        marginTop: 6,
                        borderWidth: 0
                    }}
                />
            </View>
        )
    }





    const renderModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
                >
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(0,0,0,0.2)"

                        }}
                    >
                        <View
                            style={{
                                height: 494,
                                width: SIZES.width * 0.9,
                                backgroundColor: COLORS.white,
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 16
                            }}
                        >
                            <Image
                                source={images.success}
                                contentFit='contain'
                                style={{
                                    height: 217,
                                    width: 217,
                                    marginVertical: 22
                                }}
                            />
                            <Text style={{
                                fontSize: 24,
                                fontFamily: "semiBold",
                                color: COLORS.primary,
                                textAlign: "center",
                                marginVertical: 6
                            }}>Top Up Successfully</Text>
                            <Text style={{
                                fontSize: 14,
                                fontFamily: "regular",
                                color: COLORS.primary,
                                textAlign: "center",
                                marginVertical: 22
                            }}>The amount  will be reflected in your account with in few minutes</Text>
                            <Button
                                title="Continue"
                                filled
                                onPress={() => {
                                    setModalVisible(false)
                                    navigate("(tabs)")
                                }}
                                style={{
                                    width: "100%",
                                    marginTop: 12
                                }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
            <View style={{ flex: 1, backgroundColor: COLORS.primary }}>
                {renderHeader()}
                <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                    {renderCardInfo()}
           
                </View>
            </View>
           
        </SafeAreaView>
    )
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

    voucherCardContainer: {
        width: 96,
        height: 62,
        borderRadius: 6,
        backgroundColor: "transparent",
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
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        marginBottom: 16,
        backgroundColor: COLORS.primary,
        height: 78
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
 
  handLogo: {
    // Set width and height to fill the container
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // or 'contain' if you don't want the image to be cropped
  },

  bankDetailsContainer: {
    // Existing styles...
    marginBottom: 20, // Add some space between bank details and instructions
},
bankDetailsTitle: {
    fontSize: 18,
    fontFamily: "semiBold",
    color: COLORS.primary,
    marginBottom: 10,
},
depositInstructionsContainer: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray, // Assuming COLORS.lightGray is defined in your constants
    marginHorizontal: 16,
},
depositInstructionsTitle: {
    fontSize: 18,
    fontFamily: "semiBold",
    color: COLORS.primary,
    marginBottom: 10,
},
bankDetailsText: {
    // Existing styles...
    fontSize: 16, // Increase the font size for better readability
},

cardInfoScrollContainer: {
    flex: 1,
    backgroundColor: COLORS.lighterGray, // Use a light background color
},
cardInfoContainer: {
    padding: 16,
},
card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
},
cardTitle: {
    fontSize: 20,
    fontFamily: "semiBold",
    color: COLORS.primary,
    marginBottom: 10,
},
cardContent: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.darkGray,
    marginBottom: 5,
},
})

export default TopUpScreen