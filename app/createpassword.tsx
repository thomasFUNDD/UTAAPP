import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'

type Nav = {
    navigate: (value: string) => void
}

const pinLength = 4
const pinContainerSize = SIZES.width / 2
const pinMaxSize = pinContainerSize / pinLength
const pinSpacing = 10
const pinSize = pinMaxSize - pinSpacing * 2

const dialPad = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']
const dialPadSize = SIZES.width * 0.2
const dialPadTextSize = dialPadSize * 0.4
const _spacing = 20

function DialPad({
    onPress,
}: {
    onPress: (item: (typeof dialPad)[number]) => void
}) {
    return (
        <FlatList
            numColumns={3}
            data={dialPad}
            style={{ flexGrow: 1 }}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            columnWrapperStyle={{ gap: _spacing }}
            contentContainerStyle={{ gap: _spacing }}
            renderItem={({ item }) => {
                return (
                    <TouchableOpacity
                        disabled={item === ''}
                        onPress={() => {
                            onPress(item)
                        }}
                    >
                        <View
                            style={{
                                width: dialPadSize,
                                height: dialPadSize,
                                borderRadius: dialPadSize / 2,
                                backgroundColor: COLORS.white,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: typeof item !== 'number' ? 0 : 1,
                                borderColor: 'black',
                            }}
                        >
                            {item === 'del' ? (
                                <Ionicons
                                    name="backspace-outline"
                                    size={dialPadTextSize}
                                    color="black"
                                />
                            ) : (
                                <Text
                                    style={{
                                        fontSize: dialPadTextSize,
                                        fontFamily: 'regular',
                                        color: 'black',
                                    }}
                                >
                                    {item}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )
            }}
        />
    )
}

const CreatePassword = () => {
    const [code, setCode] = useState<number[]>([]);
    const { navigate } = useNavigation<Nav>();
    return (
        <SafeAreaView style={styles.area}>
            <Text style={styles.formTitle}>Create Password</Text>
            <View
                style={{
                    flexDirection: 'row',
                    gap: pinSpacing * 2,
                    marginBottom: _spacing * 2,
                    height: pinSize * 2,
                    alignItems: "flex-end"
                }}
            >
                {[...Array(pinLength).keys()].map((key) => {
                    const isSelected = !!code[key];

                    return (
                        <View
                            key={key}
                            style={{
                                width: pinSize,
                                height: isSelected ? pinSize : 2,
                                borderRadius: pinSize,
                                backgroundColor: COLORS.primary,
                            }}
                        />
                    )
                })}
            </View>
            <DialPad
                onPress={(item) => {
                    if (item === 'del') {
                        setCode((prevCode) =>
                            prevCode.slice(0, prevCode.length - 1)
                        )
                    } else if (typeof item === 'number') {
                        if (code.length === pinLength) {
                            navigate("confirmpassword")
                        }
                        setCode((prevCode) => [...prevCode, item])
                    }
                }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    area: {
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 18,
    }
})

export default CreatePassword
