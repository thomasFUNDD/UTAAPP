import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

interface InputLabelProps {
  title: string;
}

const InputLabel: React.FC<InputLabelProps> = ({ title }) => {
  return (
    <View style={{marginVertical: 6}}>
      <Text style={styles.inputLabel}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12,
    fontFamily: "regular",
    color: COLORS.secondaryBlack
  },
});

export default InputLabel;