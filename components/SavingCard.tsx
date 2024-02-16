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
}
const SavingCard: React.FC<SavingCardProps> = ({ icon, title, subtitle, percentage, onPress }) => {
  return (
   <TouchableOpacity style={styles.container} onPress={onPress}>
       <View style={{flexDirection: "row"}}>
            <View 
              style={styles.iconContainer}>
                 <Image
                  source={icon}
                  contentFit='contain'
                  style={styles.icon}
                 />
            </View>
            <View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
       </View>
        <CircularPercentage percentage={percentage} radius={28}/>
   </TouchableOpacity>
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
        height: 48,
        width: 48,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 24,
        backgroundColor: COLORS.tertiaryWhite,
        marginRight: 16
    },
    icon: {
        height: 32,
        width: 32
    },
    title: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.primary,
        marginVertical: 4
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "regular",
        color: COLORS.primary
    }
})

export default SavingCard