import { Tabs } from "expo-router";
import { View, Text, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "../../constants";

const IPHONE12_H = 844;
const IPHONE13_H = 844;
const IPHONE12_Max = 926;
const IPHONE12_Mini = 780;

const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS !== 'ios',
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          elevation: 0,
          height: 72,
          backgroundColor: COLORS.white,
          marginBottom:
            Platform.OS === 'ios' &&
              (D_HEIGHT === IPHONE12_H ||
                D_HEIGHT === IPHONE13_H ||
                D_HEIGHT === IPHONE12_Max ||
                D_HEIGHT === IPHONE12_Mini)
              ? 20 : 0
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }: { focused: boolean }) => {
            return (
              <View style={{
                alignItems: "center",
                paddingTop: 16
              }}>
                <Image
                  source={focused ? icons.home : icons.homeOutline}
                  contentFit="contain"
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? COLORS.primary : "black"
                  }}
                />
                <Text style={{
                  fontSize: 8,
                  fontFamily: "regular",
                  color: focused ? COLORS.primary : "black",
                  marginTop: 4
                }}>Home</Text>
              </View>
            )
          },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "",
          tabBarIcon: ({ focused }: { focused: boolean }) => {
            return (
              <View style={{
                alignItems: "center",
                paddingTop: 16
              }}>
                <Image
                  source={focused ? icons.voucherNav : icons.voucherNav}
                  contentFit="contain"
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? COLORS.primary : "black"
                  }}
                />
                <Text style={{
                  fontSize: 8,
                  fontFamily: "regular",
                  color: focused ? COLORS.primary : "black",
                  marginTop: 4
                }}>Donate</Text>
              </View>
            )
          },
        }}
      />


<Tabs.Screen
        name="other"
        options={{
          title: "",
          tabBarIcon: ({ focused }: { focused: boolean }) => {
            return (
              <View style={{
                alignItems: "center",
                paddingTop: 16
              }}>
                <Image
                  source={focused ? icons.card : icons.card}
                  contentFit="contain"
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? COLORS.primary : "black"
                  }}
                />
                <Text style={{
                  fontSize: 8,
                  fontFamily: "regular",
                  color: focused ? COLORS.primary : "black",
                  marginTop: 4
                }}>Card Dashboard</Text>
              </View>
            )
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ focused }: { focused: boolean }) => {
            return (
              <View style={{
                alignItems: "center",
                paddingTop: 16
              }}>
                <Image
                  source={focused ? icons.user : icons.userOutline}
                  contentFit="contain"
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? COLORS.primary : "black"
                  }}
                />
                <Text style={{
                  fontSize: 8,
                  fontFamily: "regular",
                  color: focused ? COLORS.primary : "black",
                  marginTop: 4
                }}>Profile</Text>
              </View>
            )
          },
        }}
      />
    </Tabs>
  )
}

export default TabLayout