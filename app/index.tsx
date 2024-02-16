import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Image } from "expo-image";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { illustrations, images } from '../constants';
import PageContainer from '../components/PageContainer';
import DotsView from '../components/DotsView';
import Button from '../components/Button';
import Onboarding1Styles from '../styles/OnboardingStyles';
import { COLORS } from '../constants';
import { useNavigation } from 'expo-router';

type Nav = {
  navigate: (value: string) => void;
}

const Onboarding1 = () => {

  const { navigate } = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);





  return (
    <SafeAreaView style={Onboarding1Styles.container}>
      <StatusBar style="light" />
      <PageContainer>
        <View style={Onboarding1Styles.contentContainer}>
          <Image
            source={images.Logo}
            contentFit="contain"
            style={Onboarding1Styles.illustration}
          />

          <View style={Onboarding1Styles.titleContainer}>
            <Text style={Onboarding1Styles.title}>Philanthropy Services for Donors</Text>
          </View>

          <Text style={Onboarding1Styles.description}>
          Manage your long term giving
          </Text>

          

          <View style={Onboarding1Styles.buttonContainer}>
          
            <Button
              title="Login"
              onPress={() => navigate('login')}
              textColor={COLORS.primary}
              style={Onboarding1Styles.skipButton}
            />

<Button
              title="Signup"
              onPress={() => navigate('signup')}
              textColor={COLORS.primary}
              style={Onboarding1Styles.skipButton}
            />
          </View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
};

export default Onboarding1;