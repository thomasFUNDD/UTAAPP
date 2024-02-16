import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { COLORS, SIZES, icons } from '../constants'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../components/Header'
import { Image } from 'expo-image'
import { userCards } from '../data'
import Card from '../components/Card'
import { ScrollView } from "react-native-virtualized-view"
import { useNavigation } from 'expo-router'
import BalanceContext from '../data/balancesContext'; // Adjust the import path as necessary
import OtherContext from '../data/otherContext'; // Adjust the import path as necessary

type Nav = {
  navigate: (value: string) => void
}

const YourCardScreen = () => {
  const { cardDetails } = useContext(OtherContext);
  const { navigate } = useNavigation<Nav>();
  const { currentBalance } = useContext(BalanceContext); // Destructure to get currentBalance

  console.log('YourCardScreen rendered'); // Add this line

  useEffect(() => {
    console.log('Card Details:', cardDetails);
    console.log('Card Details:', cardDetails);
  }, [cardDetails]);

  // Render User Debit Card
  const renderAllUserCard = () => {
    return (
      <ScrollView style={{ paddingHorizontal: 16 }}>
        <FlatList
          data={userCards}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card
              number={item.number}
              balance={currentBalance} // Use currentBalance from context

              date={item.date}
              onPress={() => console.log("Card Pressed")}
              containerStyle={{
                width: SIZES.width - 32,
                marginBottom: 8
              }}
            />
          )} />
       


        <TouchableOpacity
          onPress={() => navigate("viewPin")}
          style={styles.btn}>
          <Image
            source={icons.plus}
            contentFit="contain"
            style={{
              height: 20,
              width: 20,
              tintColor: COLORS.primary,
              marginRight: 16
            }}
          />
          <Text style={styles.btnText}>Reveal pin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("changePin")}
          style={styles.btn}>
          <Image
            source={icons.plus}
            contentFit="contain"
            style={{
              height: 20,
              width: 20,
              tintColor: COLORS.primary,
              marginRight: 16
            }}
          />
          <Text style={styles.btnText}>Change pin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("addnewcard")}
          style={styles.btn}>
          <Image
            source={icons.plus}
            contentFit="contain"
            style={{
              height: 20,
              width: 20,
              tintColor: COLORS.primary,
              marginRight: 16
            }}
          />
          <Text style={styles.btnText}>Block Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate("transactionsRedesign")}
          style={styles.btn}>
          <Image
            source={icons.plus}
            contentFit="contain"
            style={{
              height: 20,
              width: 20,
              tintColor: COLORS.primary,
              marginRight: 16
            }}
          />
          <Text style={styles.btnText}>View Transactions</Text>
        </TouchableOpacity>
      </ScrollView>
    )
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        
        <Header title="Card Dashboard" />
        {renderAllUserCard()}
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
    flex: 1
  },
  btn: {
    width: SIZES.width - 32,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row"
  },
  btnText: {
    fontSize: 16,
    fontFamily: "medium",
    color: COLORS.primary
  }
})
export default YourCardScreen