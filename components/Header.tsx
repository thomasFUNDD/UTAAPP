import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { COLORS, icons } from '../constants';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    const navigate = useNavigation()
   
  return (
    <View style={styles.container}>
        <TouchableOpacity
         onPress={()=>navigate.goBack()}
        >
            <Image
              source={icons.back}
              contentFit='contain'
              style={styles.backIcon}
            />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity>
            <Image
              source={icons.more}
              contentFit='contain'
              style={styles.moreIcon}
            />
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 8,
        marginBottom: 16,
        backgroundColor: COLORS.white,
    },
    backIcon: {
        height: 24,
        width: 24,
        tintColor: "black"
    },
    title: {
        fontSize: 16,
        fontFamily: "medium",
        color: "black",
    },
    moreIcon: {
        height: 24,
        width: 24,
        tintColor: "black"
    }
})

export default Header