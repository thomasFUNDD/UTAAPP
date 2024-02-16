import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES } from '../constants'
import AsyncStorage from "@react-native-async-storage/async-storage"
import Button from '../components/Button'
import { useNavigation } from 'expo-router'

type Nav = {
  navigate: (value: string) => void
}

const Account = () => {
  const [isAccountHidden, setIsAccountHidden] = useState(false);
  const { navigate } = useNavigation<Nav>();

  const toggleSwitch = async (value: any) => {
    try {
      await AsyncStorage.setItem('isAccountHidden', JSON.stringify(value));
      setIsAccountHidden(value);
    } catch (error) {
      console.error('Error saving data: ', error);
    }
  };

  const getSwitchValue = async () => {
    try {
      const value = await AsyncStorage.getItem('isAccountHidden');
      if (value !== null) {
        setIsAccountHidden(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error retrieving data: ', error);
    }
  };

  React.useEffect(() => {
    getSwitchValue();
  }, []);

  const deleteAccount = () => {
    console.log('deleteAccount');
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Text style={styles.formTitle}>Account</Text>
        <View style={styles.formContainer}>
          <Text style={styles.formText}>Hide Account</Text>
          <Switch
            trackColor={{ false: '#767577', true: "#F1F1F1" }}
            thumbColor={isAccountHidden ? COLORS.primary : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isAccountHidden}
          />
        </View>
        <View style={{ marginVertical: 32 }}>
          <Text style={styles.body6}>Make sure you can remember you password,</Text>
          <Text style={styles.body6}>as you’ll need it to sign back in</Text>
        </View>
        <Text style={styles.email}>ed******@gmail.com</Text>
      </View>
      <View style={styles.footer}>
        <Button
          title="Change Password"
          filled
          onPress={() => navigate('(tabs)')}
          style={styles.filledBtn}
        />
        <Button
          title="Logout"
          onPress={() => console.log("Logout")}
          textColor={COLORS.primary}
          style={styles.outlinedBtn}
        />
        <TouchableOpacity
          onPress={() => deleteAccount()}
          style={{ alignItems: "center", justifyContent: "center" }}>
          <Text style={styles.footerText}>Delete Account</Text>
        </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 18,
  },
  formContainer: {
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: COLORS.black,
    borderBottomWidth: .3,
    paddingVertical: 8
  },
  formText: {
    fontSize: 16,
    fontFamily: "medium",
    color: COLORS.primary,
    textAlign: "center",
  },
  body6: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.primary,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    fontFamily: "medium",
    color: COLORS.primary,
    textAlign: "center",
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
  },
  footerText: {
    fontSize: 16,
    fontFamily: "regular",
    color: COLORS.black,
    textDecorationLine: "underline",
    textDecorationColor: COLORS.black,
    textDecorationStyle: "solid"
  }
})
export default Account