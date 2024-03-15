import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../constants';
import CircularPercentage from './CircularPercentage';

interface SavingCardProps {
    icon: string;
    title: string;
    subtitle: string;
    percentage: number;
    onPress: () => void;
    balance?: string; // Add this line, make it optional if it can be undefined
    transactionAmount?: string; // Add this line for transaction amount


}
const SavingCard: React.FC<SavingCardProps> = ({ icon, title, subtitle, percentage, balance, transactionAmount, onPress, header }) => {
  return (
    <>
      {header && (
        <Text style={styles.header}>{header}</Text>
      )}
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.iconContainer}>
            <Image
              source={icon}
              contentFit='contain'
              style={styles.icon}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {transactionAmount && (
              <Text style={styles.transactionAmount}>{transactionAmount}</Text>
            )}
            {balance && (
              <Text style={styles.balance}>{balance}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
    container: {
        height: 80,
        width: SIZES.width -32,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        backgroundColor: COLORS.white,
        marginHorizontal: 16,
        marginVertical: 6
    },
    iconContainer: {
        height: 36,
        width:36,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        backgroundColor: COLORS.tertiaryWhite,
        marginRight: 16
    },
    icon: {
        height: 20,
        width: 20
    },
    title: {
        fontSize: 14,
        fontFamily: "medium",
        color: '#000',
        marginVertical: 4
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "regular",
        color: '#000',
    },
    balance: {
        fontSize: 16, // Increase font size
        fontFamily: "medium", // Use a medium weight font if available
        color: COLORS.primary, // Change the color to something that fits your app's theme
        marginLeft: 'auto', // Keep it to the right
        marginRight: 16, // Add some margin to the right if needed
      },
      textContainer: {
        flex: 1, // Take up all available space
        justifyContent: 'center',
        marginRight: 8, // Add some margin to prevent text from touching the balance
      },
      title: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.black,
        // Remove marginVertical if it's causing layout issues
      },
      subtitle: {
        fontSize: 12,
        fontFamily: "regular",
        color: COLORS.black,
        // Adjust font size and family as needed
      },
      balance: {
        fontSize: 16,
        fontFamily: "medium",
        color: COLORS.primary,
        // Ensure this text is aligned to the right
        marginLeft: 'auto',
        marginRight: 16, // Add some margin to the right if needed
      },
      transactionAmount: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.black,
        marginLeft: 'auto',
        marginRight: 16,
      },
      header: {
        fontSize: 16, // Match the font size of the date header
        fontFamily: 'semiBold', // Adjust the font family to match the date header
        color: 'white', // Adjust the color to match the date header
        paddingVertical: 8, // Add some vertical padding
        paddingHorizontal: 16, // Match the horizontal padding of the date header
        backgroundColor: COLORS.primary, // Match the background color of the date header
        // Add any other styles to match the date header appearance
      },
})

export default SavingCard