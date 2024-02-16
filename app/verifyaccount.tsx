import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity,TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import PageContainer from '../components/PageContainer'
import { COLORS, SIZES } from '../constants'

import { useNavigation } from 'expo-router'
import Button from '../components/Button'

type Nav = {
  navigate: (value: string) => void;
}

const VerifyAccount = () => {
  const { navigate } = useNavigation<Nav>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred', error);
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.area}>
      <PageContainer>
        <ScrollView>
          <Text style={styles.formTitle}>Verify Account</Text>
          <Text style={styles.formSubTitle}>Enter digit code we have sent to</Text>
          <Text style={styles.phoneNumber}>+6285788773880</Text>
          <View style={{ marginVertical: 16 }}>
            <TextInput
              textInputStyle={styles.OTPStyle}
              inputCount={4}
              tintColor={COLORS.primary}
            />
          </View>
          <Text style={styles.formSubTitle}>Haven’t received verification code?</Text>
          <TouchableOpacity>
            <Text style={styles.resendCode}>Resend Code</Text>
          </TouchableOpacity>
        </ScrollView>
      </PageContainer>
      <View style={styles.footer}>
        <Button
          title="Verify Now"
          filled
          onPress={() => navigate('accountcreated')}
          style={styles.filledBtn}
        />
      </View>
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
    color: "black",
    textAlign: "center",
    paddingHorizontal: 16
  },
  phoneNumber: {
    fontSize: 14,
    fontFamily: "medium",
    color: "black",
    textAlign: "center",
    paddingHorizontal: 16,
    marginVertical: 8
  },
  OTPStyle: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
    borderRadius: 10,
    height: 58,
    width: 58,
    borderBottomWidth: 2,
  },
  footer: {
    width: '100%',
    marginVertical: 12,
    position: "absolute",
    bottom: 36,
    right: 16,
    left: 16
  },
  resendCode: {
    fontSize: 16,
    fontFamily: "semiBold",
    color: COLORS.primary,
    textAlign: "center",
    textDecorationColor: COLORS.primary,
    textDecorationLine: "underline",
    marginVertical: 4
  },
  filledBtn: {
    width: SIZES.width - 32,
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
})

export default VerifyAccount