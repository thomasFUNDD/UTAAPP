import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import React from 'react';
import { useColorScheme } from 'react-native';
import { FONTS } from '../constants/fonts';
import BalanceProvider from '../data/balanceProvider';
import OtherContextProvider from '../data/otherContextProvider';


export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts(FONTS);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <RootLayoutNav />
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <OtherContextProvider>
      <BalanceProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "" }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding2" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding3" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="phonenumber" options={{ headerShown: false }} />
            <Stack.Screen name="verifyaccount" options={{ headerShown: false }} />
            <Stack.Screen name="forgotpassword" options={{ headerShown: false }} />
            <Stack.Screen name="resetpassword" options={{ headerShown: false }} />
            <Stack.Screen name="account" options={{ headerShown: false }} />
            <Stack.Screen name="accountcreated" options={{ headerShown: false }} />
            <Stack.Screen name="createpassword" options={{ headerShown: false }} />
            <Stack.Screen name="confirmpassword" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="requestmoney" options={{ headerShown: false }} />
            <Stack.Screen name="topup" options={{ headerShown: false }} />
            <Stack.Screen name="topup_Alt" options={{ headerShown: false }} />
            <Stack.Screen name="yourcard" options={{ headerShown: false }} />
            <Stack.Screen name="addnewcard" options={{ headerShown: false }} />
            <Stack.Screen name="yoursavings" options={{ headerShown: false }} />
            <Stack.Screen name="send" options={{ headerShown: false }} />
            <Stack.Screen name="sendmoneysuccess" options={{ headerShown: false }} />
            <Stack.Screen name="changeemail" options={{ headerShown: false }} />
            <Stack.Screen name="changepassword" options={{ headerShown: false }} />
            <Stack.Screen name="changepersonalprofile" options={{ headerShown: false }} />
            <Stack.Screen name="helpcenter" options={{ headerShown: false }} />
            <Stack.Screen name="transactions" options={{ headerShown: false }} />
            <Stack.Screen name="transactionsRedesign" options={{ headerShown: false }} />
            <Stack.Screen name="statements" options={{ headerShown: false }} />
            <Stack.Screen name="orderBooks" options={{ headerShown: false }} />
            <Stack.Screen name="viewVouchers" options={{ headerShown: false }} />
            <Stack.Screen name="changePin" options={{ headerShown: false }} />
            <Stack.Screen name="viewPin" options={{ headerShown: false }} />
            <Stack.Screen name="orderVouchers" options={{ headerShown: false }} />
            <Stack.Screen name="CreateReceipt" options={{ headerShown: false }} />
            <Stack.Screen name="standingOrder" options={{ headerShown: false }} />
            <Stack.Screen name="orderCard" options={{ headerShown: false }} />
            <Stack.Screen name="contactSupport" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </BalanceProvider>
    </OtherContextProvider>
  );
}