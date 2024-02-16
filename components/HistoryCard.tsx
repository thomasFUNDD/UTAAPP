import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../constants';

interface HistoryCardProps {
    avatar: string;
    name: string;
    date: string;
    amount: number;
    onPress: () => void;
}
const HistoryCard: React.FC<HistoryCardProps> = ({ avatar, name, date, amount, onPress }) => {
  return (
   <TouchableOpacity style={styles.container} onPress={onPress}>
       <View style={{flexDirection: "row"}}>
            <View 
              style={styles.iconContainer}>
                 <Image
                  source={avatar}
                  contentFit='contain'
                  style={styles.icon}
                 />
            </View>
            <View>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>{date}</Text>
            </View>
       </View>
       <Text style={styles.amount}>${amount}</Text>
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
        marginRight: 16
    },
    icon: {
        height: 48,
        width: 48,
        borderRadius: 24,
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
    },
    amount: {
        fontSize: 14,
        fontFamily: "medium",
        color: COLORS.primary
    }
})

export default HistoryCard