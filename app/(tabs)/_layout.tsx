import { Tabs } from "expo-router";
import { View, Text, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { COLORS, icons } from "../../constants";

const { height: D_HEIGHT, width: D_WIDTH } = Dimensions.get('window');
const isTablet = D_WIDTH > 768;

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
          height: isTablet ? 100 : 72,
          backgroundColor: COLORS.white,
          marginBottom:
            Platform.OS === 'ios' &&
            (D_HEIGHT === 844 || D_HEIGHT === 926 || D_HEIGHT === 780)
              ? 20 : 0
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", paddingTop: isTablet ? 20 : 16 }}>
              <Image
                source={focused ? icons.home : icons.homeOutline}
                contentFit="contain"
                style={{
                  width: isTablet ? 32 : 24,
                  height: isTablet ? 32 : 24,
                  tintColor: focused ? COLORS.primary : "black"
                }}
              />
              <Text style={{
                fontSize: isTablet ? 10 : 8,
                fontFamily: "regular",
                color: focused ? COLORS.primary : "black",
                marginTop: isTablet ? 6 : 4,
                width: isTablet ? 100 : 50,
                textAlign: "center"
              }}>
                Home
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", paddingTop: isTablet ? 20 : 16 }}>
              <Image
                source={focused ? icons.voucherNav : icons.voucherNav}
                contentFit="contain"
                style={{
                  width: isTablet ? 32 : 24,
                  height: isTablet ? 32 : 24,
                  tintColor: focused ? COLORS.primary : "black"
                }}
              />
              <Text style={{
                fontSize: isTablet ? 10 : 8,
                fontFamily: "regular",
                color: focused ? COLORS.primary : "black",
                marginTop: isTablet ? 6 : 4,
                width: isTablet ? 100 : 50,
                textAlign: "center"
              }}>
                Donate
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="other"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", paddingTop: isTablet ? 20 : 16 }}>
              <Image
                source={focused ? icons.card : icons.card}
                contentFit="contain"
                style={{
                  width: isTablet ? 32 : 24,
                  height: isTablet ? 32 : 24,
                  tintColor: focused ? COLORS.primary : "black"
                }}
              />
              <Text style={{
                fontSize: isTablet ? 10 : 8,
                fontFamily: "regular",
                color: focused ? COLORS.primary : "black",
                marginTop: isTablet ? 6 : 4,
                width: isTablet ? 100 : 50,
                textAlign: "center"
              }}>
                Card Dashboard
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: "center", paddingTop: isTablet ? 20 : 16 }}>
              <Image
                source={focused ? icons.user : icons.userOutline}
                contentFit="contain"
                style={{
                  width: isTablet ? 32 : 24,
                  height: isTablet ? 32 : 24,
                  tintColor: focused ? COLORS.primary : "black"
                }}
              />
              <Text style={{
                fontSize: isTablet ? 10 : 8,
                fontFamily: "regular",
                color: focused ? COLORS.primary : "black",
                marginTop: isTablet ? 6 : 4,
                width: isTablet ? 100 : 50,
                textAlign: "center"
              }}>
                Profile
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;