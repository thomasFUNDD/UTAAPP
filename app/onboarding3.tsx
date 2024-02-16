import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Image } from "expo-image";
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { illustrations } from '../constants';
import PageContainer from '../components/PageContainer';
import DotsView from '../components/DotsView';
import Button from '../components/Button';
import Onboarding1Styles from '../styles/OnboardingStyles';
import { COLORS } from '../constants';
import { useNavigation } from 'expo-router';

type Nav = {
  navigate: (value: string) => void;
}

const Onboarding3 = () => {

  const { navigate } = useNavigation<Nav>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 1) {
          clearInterval(intervalId);
          return prevProgress;
        }
        return prevProgress + 0.25;
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (progress >= 1) {
      // navigate to the Onboarding3 Screen
      navigate('signup');
    }
  }, [progress, navigate]);

  return (
    <SafeAreaView style={Onboarding1Styles.container}>
      <StatusBar style="light" />
      <PageContainer>
        <View style={Onboarding1Styles.contentContainer}>
          <Image
            source={illustrations.requestMoney}
            contentFit="contain"
            style={Onboarding1Styles.illustration}
          />

          <View style={Onboarding1Styles.titleContainer}>
            <Text style={Onboarding1Styles.title}>Easy To Use</Text>
          </View>

          <Text style={Onboarding1Styles.description}>
            Very easy to use and easy to understand for those of you who are beginners
          </Text>

          <View style={Onboarding1Styles.dotsContainer}>
            {progress < 1 && <DotsView progress={progress} numDots={4} />}
          </View>

          <View style={Onboarding1Styles.buttonContainer}>
            <Button
              title="Next"
              filled
              onPress={() => navigate('signup')}
              style={Onboarding1Styles.nextButton}
            />
            <Button
              title="Skip"
              onPress={() => navigate('login')}
              textColor={COLORS.primary}
              style={Onboarding1Styles.skipButton}
            />
          </View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
};

export default Onboarding3;