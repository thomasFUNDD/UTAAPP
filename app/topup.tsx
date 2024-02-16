import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState, useContext } from 'react'
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
import { Ionicons } from 'react-native-vector-icons';
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

    
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const { statements, setStatements } = useContext(OtherContext);
    const { standingOrders, setStandingOrders } = useContext(OtherContext);
    const { transactions, setTransactions} = useContext(OtherContext);
    const { voucherDetails, setVoucherDetails} = useContext(OtherContext);
    const { cardDetails, setCardDetails } = useContext(OtherContext); // Add this line

    const { currentBalance, setCurrentBalance } = useContext<BalanceContextType>(BalanceContext);
    
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
                <Text style={styles.title}>Profile</Text>
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
            <View style={styles.cardInfoContainer}>
                   <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    
                     

   
           
                   
                    <View>
                    <Text style={styles.debit}>Balance</Text>
                    </View>
                   
                </View>



                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <Text style={{
                        fontFamily: "semiBold",
                        color: COLORS.primary,
                        fontSize: 16
                    }}>£{currentBalance.toFixed(2)}</Text>
                     
                </View>
            </View>
        )
    }


    const renderCardInfo2 = () => {
        console.log("fdsf",voucherDetails)
        return (
            <View style={styles.cardInfoContainer}>
            <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    
                     

   
           
                   
                    <View>
                        <Text style={styles.debit}>Outstanding</Text>
                        <Text style={styles.debit}>Vouchers</Text>
                    </View>
                    </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <Text style={{
                        fontFamily: "semiBold",
                        color: COLORS.primary,
                        fontSize: 16
                    }}>{voucherDetails.outstanding}</Text>
                     
                </View>
            </View>
        )
    }

    
    const renderCardInfo3 = () => {
        console.log("fdsf",voucherDetails)
        return (
            <View style={styles.cardInfoContainer}>
            <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <View>
                        <Text style={styles.debit}>Unused</Text>
                        <Text style={styles.debit}>Vouchers</Text>
                    </View>
            </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <Text style={{
                        fontFamily: "semiBold",
                        color: COLORS.primary,
                        fontSize: 16
                    }}>{voucherDetails.unused}</Text>
                     
                </View>
            </View>
        )
    }

    const renderCardInfo5 = () => {
        console.log("fdsf",voucherDetails)
        return (
            <View style={styles.cardInfoContainer}>
               <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    
                     

   
           
                   
                    <View>
                        <Text style={styles.debit}>Active</Text>
                        <Text style={styles.debit}>Standing</Text>
                        <Text style={styles.debit}>Orders</Text>
                    </View>
                    </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <Text style={{
                        fontFamily: "semiBold",
                        color: COLORS.primary,
                        fontSize: 16
                    }}>0</Text>
                     
                </View>
            </View>
        )
    }


    const renderCardInfo6 = () => {
        console.log("fdsf",voucherDetails)
        return (
            <View style={styles.cardInfoContainer}>
               <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    
                     

   
           
                   
                    <View>
                    <Text style={styles.debit}>Inactive</Text>
                        <Text style={styles.debit}>Standing</Text>
                        <Text style={styles.debit}>Orders</Text>
                    </View>
                    </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    <Text style={{
                        fontFamily: "semiBold",
                        color: COLORS.primary,
                        fontSize: 16
                    }}>0</Text>
                     
                </View>
            </View>
        )
    }

    const renderCardInfo4 = () => {
        console.log("fdsf",voucherDetails)
        return (
            <View style={styles.cardInfoContainer}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    
                     

   
           
                   
                    <View>
                        <Text style={styles.debit}>Card</Text>
                        <Text style={styles.debit}>Status</Text>
                    </View>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                <Text style={{
  fontFamily: "semiBold",
  color: COLORS.primary,
  fontSize: 16
}}>
  {cardDetails[0]?.status === 'Normal' ? 'Active' : cardDetails[0]?.status ?? 'Card Not Found...'}
</Text>
                     
                </View>
            </View>
        )
    }



    const renderCardInfo7 = () => {
        console.log("fdsf",voucherDetails)
        return (
            <View style={styles.cardInfoContainer}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                    
                     

   
           
                   
                    <View>
                        <Text style={styles.debit}>Donations</Text>
                        <Text style={styles.debit}>Today</Text>
                    </View>
                </View>

                <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                }}>
                <Text style={{
  fontFamily: "semiBold",
  color: COLORS.primary,
  fontSize: 16
}}>
 £0.00
</Text>
                     
                </View>
            </View>
        )
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
                    {renderCardInfo4()}
                    {renderCardInfo2()}
                    {renderCardInfo3()}
                    {renderCardInfo5()}
                    {renderCardInfo6()}
                    {renderCardInfo7()}
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
})

export default TopUpScreen