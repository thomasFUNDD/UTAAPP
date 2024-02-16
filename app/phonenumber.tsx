import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import PageContainer from '../components/PageContainer'
import { COLORS, SIZES, icons } from '../constants'
import { Image } from 'expo-image'
import { TextInput } from 'react-native'
import Button from '../components/Button'
import { useNavigation } from 'expo-router'

type Nav = {
  navigate: (value: string) => void
}

const PhoneNumber = () => {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { navigate } = useNavigation<Nav>();

  // fectch codes from rescountries api
  useEffect(() => {
    fetch("https://restcountries.com/v2/all")
      .then(response => response.json())
      .then(data => {
        let areaData = data.map((item: any) => {
          return {
            code: item.alpha2Code,
            item: item.name,
            callingCode: `+${item.callingCodes[0]}`,
            flag: `https://flagsapi.com/${item.alpha2Code}/flat/64.png`
          }
        });

        setAreas(areaData);
        if (areaData.length > 0) {
          let defaultData = areaData.filter((a: any) => a.code == "US");

          if (defaultData.length > 0) {
            setSelectedArea(defaultData[0])
          }
        }
      })
  }, [])

  // render countries codes modal
  function renderAreasCodesModal() {

    const renderItem = ({ item }: { item: any }) => {
      return (
        <TouchableOpacity
          style={{
            padding: 10,
            flexDirection: "row"
          }}
          onPress={() => {
            setSelectedArea(item),
              setModalVisible(false)
          }}
        >
          <Image
            source={{ uri: item.flag }}
            contentFit='contain'
            style={{
              height: 30,
              width: 30,
              marginRight: 10
            }}
          />
          <Text style={{ fontSize: 16, color: "#fff" }}>{item.item}</Text>
        </TouchableOpacity>
      )
    }

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
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <View
              style={{
                height: 400,
                width: SIZES.width * 0.8,
                backgroundColor: COLORS.primary,
                borderRadius: 12
              }}
            >
              <FlatList
                data={areas}
                renderItem={renderItem}
                horizontal={false}
                keyExtractor={(item) => item.code}
                style={{
                  padding: 20,
                  marginBottom: 20
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }
  return (
    <SafeAreaView style={styles.area}>
      <PageContainer>
        <ScrollView>
          <Text style={styles.formTitle}>Your Phone Number</Text>
          <Text style={styles.formSubTitle}>Enter your mobile number to register an account</Text>
          <View
            style={{
              flexDirection: "row",
              borderColor: COLORS.black,
              borderWidth: .4,
              borderRadius: 6,
              height: 58,
              width: SIZES.width - 44,
              alignItems: 'center',
              marginVertical: 16
            }}>
            <TouchableOpacity
              style={{
                width: 90,
                height: 50,
                marginHorizontal: 5,
                flexDirection: "row",
              }}
              onPress={() => setModalVisible(true)}
            >

              <View style={{ justifyContent: "center" }}>
                <Image
                  source={icons.down}

                  style={{ width: 10, height: 10, tintColor: "#111" }}
                />
              </View>
              <View style={{ justifyContent: "center", marginLeft: 5 }}>
                <Image
                  source={{ uri: selectedArea?.flag }}
                  contentFit="contain"
                  style={{
                    width: 30,
                    height: 30
                  }}
                />
              </View>

              <View style={{ justifyContent: "center", marginLeft: 5 }}>
                <Text style={{ color: "#111", fontSize: 12 }}>{selectedArea?.callingCode}</Text>
              </View>
            </TouchableOpacity>
            {/* Phone Number Text Input */}
            <TextInput
              style={{
                flex: 1,
                marginVertical: 10,
                height: 40,
                fontSize: 14,
                color: "#111"
              }}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.black}
              selectionColor="#111"
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      </PageContainer>
      <View style={styles.footer}>
        <Button
          title="Send Code"
          filled
          onPress={() => navigate('verifyaccount')}
          style={styles.filledBtn}
        />
        <Button
          title="Sign Up With Email"
          onPress={() => navigate('signup')}
          textColor={COLORS.primary}
          style={styles.outlinedBtn}
        />
      </View>
      {renderAreasCodesModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
  },
  formSubTitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.black,
    textAlign: "center",
    paddingHorizontal: 16
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledBtn: {
    width: SIZES.width - 32,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  outlinedBtn: {
    width: SIZES.width - 32,
    marginBottom: SIZES.padding,
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  footer: {
    width: '100%',
    marginVertical: 12,
    position: "absolute",
    bottom: 22,
    right: 16,
    left: 16
  }
})
export default PhoneNumber