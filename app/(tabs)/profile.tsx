import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native'
import React, { useState,useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, SIZES, icons, images } from '../../constants'
import { Image } from 'expo-image'
import { SimpleLineIcons } from '@expo/vector-icons'
import { useNavigation } from 'expo-router'
import ProfileItem from '../../components/ProfileItem'
import { ScrollView } from 'react-native-virtualized-view'
import Button from '../../components/Button'
import { launchImagePicker } from '../../utils/ImagePickerHelper'
import AsyncStorage from '@react-native-async-storage/async-storage';
import otherContext from '../../data/otherContext';
import otherContextProvider from '../../data/otherContextProvider';
import OtherContext from '../../data/otherContext';
import { useContext } from 'react';
type Nav = {
  navigate: (value: string) => void
}

const ProfileScreen = () => {
  const { navigate } = useNavigation<Nav>();
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState<any>(null);
  const { setPanNumber } = useContext(OtherContext);


  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker()

      if (!tempUri) return

      // set the image
      setImage({ uri: tempUri })
    } catch (error) { }
  }



  useEffect(() => {
    const checkUserToken = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        // If userToken does not exist, navigate to the login screen
        navigate('login');
      }
    };

    checkUserToken();
  }, [navigate]);
  

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
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
           
              <Text style={styles.modalTitle}>Want to Logout ?</Text>
             
                <Button
  title="Logout Now"
  filled
  onPress={async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Remove the userToken
      setModalVisible(false); // Close the modal
      navigate('login'); // Navigate to the login screen
      setPanNumber(null); // Set panNumber to null on logout

      
    } catch (error) {
      // Handle error, if removal failed
      console.error('Failed to remove the user token.', error);
    }
  }}
  style={styles.modalBtn}
/>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Account Menu</Text>
          </View>
         
          <View style={styles.qrContainer}>
     
      
          </View>
          <View style={styles.settingsContainer}>
   
            

   


<Text style={styles.subtitle}>Account</Text>
  



   <ProfileItem
              title="Order Voucher Books"
              icon={icons.voucher}
              onPress={() => navigate("orderVouchers")}
            />

            
            <ProfileItem
              title="Statements"
              icon={icons.proofreading}
              onPress={() => navigate("statements")}
            />


            <ProfileItem
              title="View Vouchers"
              icon={icons.show}
              onPress={() => navigate("viewVouchers")}
            />

<Text style={styles.subtitle}>Menu</Text>
      
      <ProfileItem
        title="Help and Privacy"
        icon={icons.question}
        onPress={() => navigate("helpcenter")}
      />

<ProfileItem
        title="Contact support"
        icon={icons.email}
        onPress={() => navigate("changeemail")}
      />
      <ProfileItem
        title="Change Password"
        icon={icons.lock}
        onPress={() => navigate("changepassword")}
      />
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.btn}>
              <Text style={styles.logout}>Log out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      {renderModal()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.primary
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.secondaryWhite,
    paddingBottom: 40
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    height: 72,
    paddingVertical: 16
  },
  headerText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: "semiBold"
  },
  profileContainer: {
    height: 80,
    width: SIZES.width - 32,
    borderRadius: 10,
    padding: 10,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 6,
    top: -22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  profileLeftContainer: {
    flexDirection: "row",
    alignItems: "center",

  },
  profileRightContainer: {
    height: 26,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 32
  },
  avatar: {
    height: 48,
    width: 48,
    borderRadius: 24,
  },
  iconContainer: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: 0
  },
  name: {
    fontSize: 14,
    fontFamily: "medium",
    color: COLORS.primary,
    marginVertical: 4
  },
  phoneNumber: {
    fontSize: 14,
    fontFamily: "regular",
    color: "gray"
  },
  qrContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    justifyContent: "space-between"
  },
  qrInfoContainer: {
    width: (SIZES.width - 32) / 2 - 12,
    height: 72,
    borderRadius: 10,
    padding: 10,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  qrIconContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#F1EDFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  qrIcon: {
    height: 24,
    width: 24,
    tintColor: COLORS.primary
  },
  qrText: {
    fontSize: 14,
    fontFamily: "medium",
    color: COLORS.primary
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "medium",
    color: COLORS.primary,
    marginVertical: 16
  },
  settingsContainer: {
    marginHorizontal: 16
  },
  logout: {
    fontFamily: "semiBold",
    color: COLORS.primary,
    textDecorationLine: "underline",
    marginVertical: 22,
    textAlign: "center"
  },
  btn: {
    marginTop: 2,
    marginBottom: 36
  },
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)"

  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "semiBold",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 6
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "regular",
    color: COLORS.primary,
    textAlign: "center",
    marginVertical: 22
  },
  modalSuccess: {
    height: 217,
    width: 217,
    marginVertical: 22
  },
  modal: {
    height: 494,
    width: SIZES.width * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  },
  modalBtn: {
    width: "100%",
    marginTop: 12
  }
})

export default ProfileScreen