import { View, Text, StyleSheet, TextInput } from 'react-native';
import React, { FC } from 'react';
import { COLORS, SIZES } from '../constants';

interface InputProps {
  id: string;
  placeholder?: string;
  placeholderTextColor?: string;
  errorText?: string[];
  style?: object;
  secureTextEntry?: boolean;
  onInputChanged: (id: string, text: string) => void;
}

const Input: FC<InputProps> = (props) => {
  const onChangeText = (text: string) => {
    props.onInputChanged(props.id, text);
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          ...styles.inputContainer,
          ...{ borderColor: COLORS.secondaryBlack },
          ...(props.style as object),
        }}
      >
        <TextInput
          {...props}
          onChangeText={onChangeText}
          style={styles.input}
          placeholder={props.placeholder}
          placeholderTextColor={props.placeholderTextColor}
          secureTextEntry={props.secureTextEntry}
        />
      </View>
      {props.errorText && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding2,
    borderRadius: 4,
    borderWidth: .3,
    borderColor: COLORS.secondaryBlack,
    marginVertical: 5,
    flexDirection: 'row',
    marginBottom: 8,
    height: 48
  },
  icon: {
    marginRight: 10,
  },
  input: {
    color: COLORS.black,
    flex: 1,
    fontFamily: 'regular',
    paddingTop: 0,
    textAlignVertical: "top"
  },
  errorContainer: {
    marginVertical: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});

export default Input;