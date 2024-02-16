import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, illustrations } from '../constants'
import { Image } from 'expo-image'
import Button from '../components/Button'
import { useNavigation } from 'expo-router'

type Nav = {
  navigate: (value: string) => void;
}

const AccountCreated = () => {
  const { navigate } = useNavigation<Nav>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={styles.formTitle}>Account Created</Text>
        <Text style={styles.formSubTitle}>Your account has been created successfully.
          Press continue to continue using the app</Text>
        <Image
          source={illustrations.accountCreated}
          contentFit='contain'
          style={styles.illustration}
        />
        <Button
          title="Continue"
          filled
          onPress={() => navigate('login')}
          style={styles.btn}
        />
        <View>
          <Text style={styles.footerTitle}>By clicking continue, you agree to our</Text>
          <TouchableOpacity>
            <Text style={styles.footerSubtitle}>Terms and Conditions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
  },
  formSubTitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: "black",
    textAlign: "center",
    paddingHorizontal: 16
  },
  illustration: {
    height: 217,
    width: 217,
    marginVertical: 64
  },
  btn: {
    width: SIZES.width - 32,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footerTitle: {
    fontSize: 12,
    fontFamily: "regular",
    color: "black",
    marginVertical: 4,
    textAlign: "center"
  },
  footerSubtitle: {
    fontSize: 12,
    fontFamily: "medium",
    color: "black",
    marginVertical: 4,
    textAlign: "center",
    textDecorationColor: "black",
    textDecorationLine: "underline",
    textDecorationStyle: "solid"
  }
})
export default AccountCreated