import { View, Text, Alert, StyleSheet,FlatList,Modal,TextInput } from 'react-native'
import React, { useCallback, useEffect, useReducer, useState,useMemo } from 'react'
import { ScrollView } from "react-native-virtualized-view"

import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES,images } from '../constants'
import Header from '../components/Header'
import InputLabel from '../components/InputLabel'
import { validateInput } from '../utils/actions/formActions'
import { reducer } from '../utils/reducers/formReducers'
import Input from '../components/Input'
import { useNavigation } from 'expo-router'
import Button from '../components/Button'
import { Picker } from '@react-native-picker/picker';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import icons from '../constants/icons'; // Adjust the import path as necessary
import { API_URL, TOKEN } from '@env' // Import environment variables
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AsyncStorage from '@react-native-async-storage/async-storage'

import BalanceContext from '../data/balancesContext'; // Adjust the path as necessary
import OtherContext from '../data/otherContext'; // Adjust the import path as necessary
type Nav = {
    navigate: (value: string) => void
}


interface InputValues {
    creditCardNumber: string
    creditCardExpiryDate: string
    cvv: string
    creditCardHolderName: string
    addressLine1: string
    addressLine2: string
}

interface InputValidities {
    creditCardNumber: boolean | undefined
    creditCardExpiryDate: boolean | undefined
    cvv: boolean | undefined
    creditCardHolderName: boolean | undefined
    addressLine1: boolean | undefined
    addressLine2: boolean | undefined
}

interface FormState {
    inputValues: InputValues
    inputValidities: InputValidities
    formIsValid: boolean
}

const initialState: FormState = {
    inputValues: {
        creditCardNumber: '',
        creditCardExpiryDate: '',
        cvv: '',
        creditCardHolderName: '',
        addressLine1: '',
        addressLine2: '',
    },
    inputValidities: {
        creditCardNumber: false,
        creditCardExpiryDate: false,
        cvv: false,
        creditCardHolderName: false,
        addressLine1: false,
        addressLine2: false,
    },
    formIsValid: false,
}





const AddNewCardScreen = () => {
    const { navigate } = useNavigation<Nav>()
    const [error, setError] = useState<string | undefined>()
    const [formState, dispatchFormState] = useReducer(reducer, initialState)


    const [quantity100x50p, setQuantity100x50p] = useState(0);
const [quantity50x1, setQuantity50x1] = useState(0);
const [quantity50x2, setQuantity50x2] = useState(0);
const [quantity50x3, setQuantity50x3] = useState(0);
const [quantity50x5, setQuantity50x5] = useState(0);
const [quantity50x10, setQuantity50x10] = useState(0);
const [quantity50x15, setQuantity50x15] = useState(0);
const [quantity50x18, setQuantity50x18] = useState(0);
const [quantity50x20, setQuantity50x20] = useState(0);
const [quantity50x25, setQuantity50x25] = useState(0);
const [quantity50x36, setQuantity50x36] = useState(0);
const [quantity50x50, setQuantity50x50] = useState(0);
const [quantity50x72, setQuantity50x72] = useState(0);
const [quantity50x100, setQuantity50x100] = useState(0);
const [quantity0x50, setQuantity0x50] = useState(0);
const navigation = useNavigation();
const [modalVisible, setModalVisible] = useState(false);
const [modalMessage, setModalMessage] = useState('');
const [isBasketModalVisible, setBasketModalVisible] = useState(false);
const [total, setTotal] = useState(0);// Define more quantities as needed

const items = [
    { id: '1', title: '100 £0.50 Vouchers', category: 'Pre-Paid vouchers', quantity: quantity100x50p, bookCode: 's50p', price: 0.50 * 100, value:0.5 },
    { id: '2', title: '50 £1 Vouchers', category: 'Pre-Paid vouchers', quantity: quantity50x1, bookCode: 's1', price: 1.00 * 50, value: 1 },
    { id: '3', title: '50 £2 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x2, bookCode: 's2', price: 2.00 * 50, value: 2 },
    { id: '4', title: '50 £3 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x3, bookCode: 's3', price: 3.00 * 50, value: 3 },
    { id: '5', title: '50 £5 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x5, bookCode: 's5', price: 5.00 * 50, value:5  },
    { id: '6', title: '50 £10 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x10, bookCode: 's10', price: 10.00 * 50, value:10 },
    { id: '7', title: '50 £15 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x15, bookCode: 's15', price: 15.00 * 50, value:15 },
    { id: '8', title: '50 £18 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x18, bookCode: 's18', price: 18.00 * 50, value: 18 },
    { id: '9', title: '50 £20 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x20, bookCode: 's20', price: 20.00 * 50, value: 20 },
    { id: '10', title: '50 £25 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x25, bookCode: 's25', price: 25.00 * 50, value: 25 },
    { id: '11', title: '50 £36 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x36, bookCode: 's36', price: 36.00 * 50, value: 36 },
    { id: '12', title: '50 £50 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x50, bookCode: 's50', price: 50.00 * 50, value: 50 },
    { id: '13', title: '50 £72 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x72, bookCode: 's72', price: 72.00 * 50, value: 72 },
    { id: '14', title: '50 £100 Vouchers', category: 'Pre-Printed Voucher Books', quantity: quantity50x100, bookCode: 's100', price: 100.00 * 50, value: 100 },
    { id: '15', title: '50 £0 Vouchers', category: 'Blank voucher books', quantity: quantity0x50, bookCode: 's0', price: 0, value: 0 },
    // Add more items as needed
];
  const showBasket = () => {
    // Assuming you have a way to filter basket items already
    openBasketModal();
};

const submitOrder = async () => {
    const orderItems = items.map(item => {
        return {
            quantity: item.quantity,
            bookcode: item.bookCode,
            category: item.category,
            value: item.value, // Use the value directly from the item
            instructions: "Your special instructions here" // Replace with actual instructions if needed
        };
    });

    const filteredOrderItems = orderItems.filter(item => item.quantity > 0);
    const payload = filteredOrderItems;

    const token = await AsyncStorage.getItem('userToken');
    console.log('Retrieved token:', token); // Add this line to check the token value

    try {
        const response = await axios.post(`${API_URL}/client/books/order`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Ensure token is correctly included
            },
        });

        console.log(response.data);

        if (response.status === 200 || response.status === 201) {
            setModalMessage('Order submitted successfully');
            setQuantity100x50p(0);
            setQuantity50x1(0);
            setQuantity50x2(0);
            setQuantity50x3(0);
            setQuantity50x5(0);
            setQuantity50x10(0);
            setQuantity50x15(0);
            setQuantity50x18(0);
            setQuantity50x20(0);
            setQuantity50x25(0);
            setQuantity50x36(0);
            setQuantity50x50(0);
            setQuantity50x72(0);
            setQuantity50x100(0);
            setQuantity0x50(0);
    
        } else {
            console.log(response);
            setModalMessage('Failed to submit order');
        }

        setModalVisible(true);
    } catch (error) {
        console.error(error);
        setModalMessage('Failed to submit order');
        setModalVisible(true);
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
            <Text style={styles.title}>Order Books</Text>
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

const calculateTotal = useCallback(() => {
    let total = 0;
    items.forEach(item => {
        total += item.quantity * item.price;
    });
    setTotal(total);
}, [items]);

const openBasketModal = useCallback(() => {
    setBasketModalVisible(true);
}, []);

const closeBasketModal = useCallback(() => {
    setBasketModalVisible(false);
}, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    switch(itemId) {
        case '1':
            setQuantity100x50p(quantity);
            break;
        case '2':
            setQuantity50x1(quantity);
            break;
        case '3':
            setQuantity50x2(quantity);
            break;
        case '4':
            setQuantity50x3(quantity);
            break;
        case '5':
            setQuantity50x5(quantity);
            break;
        case '6':
            setQuantity50x10(quantity);
            break;
        case '7':
            setQuantity50x15(quantity);
            break;
        case '8':
            setQuantity50x18(quantity);
            break;
        case '9':
            setQuantity50x20(quantity);
            break;
        case '10':
            setQuantity50x25(quantity);
            break;
        case '11':
            setQuantity50x36(quantity);
            break;
        case '12':
            setQuantity50x50(quantity);
            break;
        case '13':
            setQuantity50x72(quantity);
            break;
        case '14':
            setQuantity50x100(quantity);
            break;
        case '15':
            setQuantity0x50(quantity);
            break;
        default:
            console.log('Invalid item id');
    }
    calculateTotal();

}, [setQuantity100x50p, setQuantity50x1, setQuantity50x2, setQuantity50x3, setQuantity50x5, setQuantity50x10, setQuantity50x15, setQuantity50x18, setQuantity50x20, setQuantity50x25, setQuantity50x36, setQuantity50x50, setQuantity50x72, setQuantity50x100, setQuantity0x50]);

const categories = ['Pre-Paid vouchers', 'Pre-Printed Voucher Books', 'Blank voucher books', 'All'];
const [selectedCategory, setSelectedCategory] = useState(categories[0]);

const inputChangedHandler = useCallback(
    (inputId: string, inputValue: string) => {
        const result = validateInput(inputId, inputValue)
        dispatchFormState({
            inputId,
            validationResult: result,
            inputValue,
        })
    },
    [dispatchFormState]
)

useEffect(() => {
    calculateTotal();
}, [
    quantity100x50p, quantity50x1, quantity50x2, quantity50x3, quantity50x5,
    quantity50x10, quantity50x15, quantity50x18, quantity50x20, quantity50x25,
    quantity50x36, quantity50x50, quantity50x72, quantity50x100, quantity0x50
]);

const filteredItems = useMemo(() => {
    return items.filter(item => selectedCategory === 'All' || item.category === selectedCategory);
}, [items, selectedCategory]);

const pickerItems = useMemo(() => {
    return [...Array(51).keys()].map((value) => (
        <Picker.Item key={value} label={value.toString()} value={value} />
    ));
}, []);

const VoucherItem = React.memo(({ item, onQuantityChange }) => {
    return (
        <View style={styles.itemContainer}>
            <Text>{item.title}</Text>
            <Text>{item.category}</Text>
            <View style={styles.quantityControlRow}>
                <TouchableOpacity 
                    onPress={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1))}
                    style={styles.iconButton}
                >
                    <Icon name="remove" size={24} color="black" />
                </TouchableOpacity>
                <Picker
                    selectedValue={item.quantity}
                    onValueChange={(itemValue) => onQuantityChange(item.id, itemValue)}
                    style={styles.quantityPicker}
                >
                    {pickerItems}
                </Picker>
                <TouchableOpacity 
                    onPress={() => onQuantityChange(item.id, item.quantity + 1)}
                    style={styles.iconButton}
                >
                    <Icon name="add" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
});

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
           {renderHeader()}

           <Modal
    visible={modalVisible}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setModalVisible(false)}
>
    <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
            >
                <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
        </View>
    </View>
</Modal>
           <View style={styles.shoppingView}>
            <ScrollView style={{ marginHorizontal: 16 }}>
                <Text style={styles.header}>Order Books</Text>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                >
                    {categories.map((category, index) => (
                        <Picker.Item key={index} label={category} value={category} />
                    ))}
                </Picker>
                <FlatList
    data={filteredItems}
    renderItem={({ item }) => (
        <VoucherItem item={item} onQuantityChange={updateQuantity} />
    )}
    keyExtractor={item => item.id}
    numColumns={1}
    extraData={selectedCategory}
/>
            </ScrollView>
            <View style={styles.footer}>
                <Text style={styles.totalText}>Total: £{total.toFixed(2)}</Text>
                <TouchableOpacity onPress={submitOrder} style={styles.submitButton}>
    <Text style={styles.submitButtonText}>Submit Order</Text>
</TouchableOpacity>
                <TouchableOpacity onPress={showBasket} style={styles.basketButton}>
                    <Text style={styles.basketButtonText}>Basket</Text>
                </TouchableOpacity>
            </View>
            <Modal
  animationType="slide"
  transparent={true}
  visible={isBasketModalVisible}
  onRequestClose={closeBasketModal}
>
  <View style={styles.modalView}>
  <FlatList
    data={filteredItems}
    renderItem={({ item }) => (
        <View style={styles.itemContainer}>
            <Text>{item.title}</Text>
            <Text>{item.category}</Text>
            <View style={styles.quantityControlRow}>
                <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    style={styles.quantityButton}
                >
                    <Icon name="remove" size={24} color="black" />
                </TouchableOpacity>
                <Picker
                    selectedValue={item.quantity}
                    onValueChange={(itemValue) => updateQuantity(item.id, itemValue)}
                    style={styles.picker}
                >
                    {pickerItems}
                </Picker>
                <TouchableOpacity 
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.quantityButton}
                >
                    <Icon name="add" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )}
    keyExtractor={item => item.id}
    numColumns={1}
/>

<Text style={styles.instructionsLabel}>Special Instructions:</Text>
    <TextInput
      style={styles.instructionsInput}
      multiline
      numberOfLines={5} // You can adjust the number of lines
      placeholder="Enter any special instructions here"
      // onChangeText, value, and any other props you need
    />
    <TouchableOpacity onPress={closeBasketModal} style={styles.closeModalButton}>
      <Text style={styles.closeModalButtonText}>Close</Text>
    </TouchableOpacity>
  </View>
</Modal>
</View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    rowRightContainer: {
        width: (SIZES.width - 32) / 2 - 8,
        marginLeft: 8
    },
    rowLeftContainer: {
        width: (SIZES.width - 32) / 2 - 8,
        marginRight: 8
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "medium",
        color: "black",
        marginVertical: 12
    },
    itemContainer: {
        flex: 1,
        margin: 8,
        paddingTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 2, // Specify border width at the top
        borderBottomWidth: 2, // Specify border width at the bottom
        borderColor: '#a98e63', // Specify border color
        // ... other existing styles ...
    },
    image: {
        width: '100%', // Adjust the width as necessary
        height: 150, // Adjust the height as necessary
        resizeMode: 'contain',
    },
    picker: {
        width: '100%',
        // ... other styles you may need for the picker
    },


    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    footer: {
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#eaeaea',
        backgroundColor: 'white',
        paddingTop: 40,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#a98e63',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    basketButton: {
        backgroundColor: 'black', // Choose a color that fits your design
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10, // Add some space between the submit button and the basket button
    },
    basketButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'white',
    },

    shoppingView: {
        flex: 1,
         marginTop: 22,
        backgroundColor: 'white',
    },
    modalItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: 10,
      },
      itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
      },
      quantityControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 10, // Add some space between the title and the buttons
      },
      quantityButton: {
        flex: 1, // Each button will take up an equal amount of space
        alignItems: 'center', // Center the icons horizontally
        justifyContent: 'center', // Center the icons vertically
      },
    closeModalButton: {
        backgroundColor: '#a98e63',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
    },
    closeModalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
      },
      instructionsLabel: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 5,
        textAlign: 'center',
      },
      instructionsInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        margin: 10,
        textAlignVertical: 'top', // Aligns text to the top on Android
        height: 100, // Adjust the height as necessary
      },
      headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 8,
        marginBottom: 16,
        backgroundColor: COLORS.primary,
        height: 28
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
    quantityControlRow: {
        flexDirection: 'row', // Align items horizontally
        justifyContent: 'center', // Center items in the row
        alignItems: 'center', // Align items vertically
    },
    iconButton: {
        // Style for your icon button, e.g., padding for touch area
        padding: 10, // Adjust padding as needed
        // You might want to set a specific width and height for the touchable area
    },
    quantityPicker: {
        width: '65%', // Adjust the width as needed
        // You might want to set a specific height for the picker
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalButton: {
        backgroundColor: '#a98e63',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

})

export default AddNewCardScreen 