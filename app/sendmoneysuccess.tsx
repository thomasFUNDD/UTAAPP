import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { COLORS, SIZES, images } from '../constants'
import Barcode from '@kichiyaki/react-native-barcode-generator';
import Button from '../components/Button'
import { useNavigation } from 'expo-router'
import { ScrollView } from 'react-native-virtualized-view'

type Nav = {
    navigate: (value: string) => void
}
const SendMoneySuccess = () => {
    const { navigate } = useNavigation<Nav>()
    return (
        <SafeAreaView style={styles.area}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={{ alignItems: "center" }}>
                    <Image
                        source={images.checked}
                        contentFit='contain'
                        style={styles.checked}
                    />
                    <Text style={styles.subtitle}>Successfully</Text>
                </View>
                <View style={styles.summaryContainer}>
                    <Image
                        source={images.avatar6}
                        contentFit='contain'
                        style={styles.avatar}
                    />
                    <Text style={styles.name}>Vina Andini</Text>
                    <Text style={styles.number}>0821 2103 1120</Text>
                    <View style={styles.viewContainer}>
                        <Text style={styles.viewLeft}>Amount</Text>
                        <Text style={styles.viewRight}>$30.00</Text>
                    </View>
                    <View style={styles.viewContainer}>
                        <Text style={styles.viewLeft}>Admin fee</Text>
                        <Text style={styles.viewRight}>$50</Text>
                    </View>
                    <View style={styles.separateLine} />
                    <View style={styles.viewContainer}>
                        <Text style={styles.viewLeft}>Total</Text>
                        <Text style={styles.viewRight}>$60.50</Text>
                    </View>
                    <View style={styles.separateLine} />
                    <Barcode
                        format="EAN13"
                        value="0123456789012"
                        text="0123456789012"
                        width={SIZES.width - 64}
                        height={72}
                        style={{
                            marginBottom: 40,
                        }}
                        maxWidth={SIZES.width - 64}
                    />
                </View>
                <Button
                    title="Back To Home"
                    filled
                    onPress={() => navigate("(tabs)")}
                    style={{
                        width: SIZES.width - 32,
                        marginVertical: 22
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center'
    },
    checked: {
        height: 64,
        width: 64,
        tintColor: COLORS.primary,
    },
    subtitle: {
        fontFamily: "semiBold",
        fontSize: 20,
        color: COLORS.primary,
        marginVertical: 24
    },
    summaryContainer: {
        height: 424,
        width: SIZES.width - 32,
        backgroundColor: "#FAFAFA",
        alignItems: "center",
        padding: 16
    },
    avatar: {
        height: 56,
        width: 56,
        borderRadius: 28
    },
    name: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.primary,
        marginTop: 18,
        marginBottom: 6
    },
    number: {
        fontSize: 12,
        fontFamily: "regular",
        color: "gray"
    },
    viewContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginVertical: 12
    },
    viewLeft: {
        fontSize: 12,
        fontFamily: "regular",
        color: "gray"
    },
    viewRight: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.primary
    },
    separateLine: {
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "gray",
        width: "100%",
        marginVertical: 12
    }
})
export default SendMoneySuccess