import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

interface CheckboxItemProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ label, selected, onSelect }) => {
  return (
    <TouchableOpacity onPress={onSelect} style={styles.rowContainer}>
      <View style={[styles.checkboxOutline, selected && styles.checkboxFilled]}>
        {selected && <View style={styles.checkboxInner}></View>}
      </View>
      <View>
        <Text style={styles.h3}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  h3: {
    fontSize: 14,
    fontFamily: 'medium',
    color: COLORS.black,
    marginLeft: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    alignItems: 'center',
  },
  checkboxOutline: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.secondaryBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    backgroundColor: COLORS.primary,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    borderWidth: 2
  },
});

export default CheckboxItem;