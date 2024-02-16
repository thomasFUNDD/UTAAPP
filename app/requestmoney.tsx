import { View, StyleSheet, FlatList } from 'react-native'
import React from 'react'
import { COLORS } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import { requestMoneyData } from '../data'
import RequestMoneyCard from '../components/RequestMoneyCard'

const RequestMoneyScreen = () => {
    return (
        <SafeAreaView style={styles.area}>
            <View style={styles.container}>
                <Header title="Request Money" />
                <FlatList
                    data={requestMoneyData}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <RequestMoneyCard
                            name={item.name}
                            avatar={item.avatar}
                            date={item.date}
                            amount={item.amount}
                            acceptPress={() => console.log("Accept")}
                            declinePress={() => console.log("Decline")}
                        />
                    )
                    }
                />
            </View>
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
        paddingHorizontal: 16
    }
})
export default RequestMoneyScreen