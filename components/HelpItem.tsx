import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Image } from 'expo-image';
import { icons } from '../constants';

interface HelpItemProps {
    title: string;
    description: string;
}
const HelpItem: React.FC<HelpItemProps> = ({ title, description }) => {
    const [isOpen, setIsOpen] = useState(false)
  return (
    <View style={styles.container}>
       <View style={styles.itemContainer}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
             onPress={()=>setIsOpen(!isOpen)}
            >
            <Image
              source={isOpen ?  icons.down :  icons.next}
              contentFit='contain'
              style={styles.icon}
            />
            </TouchableOpacity>
       </View>
       {
        isOpen &&
        <Text style={styles.description}>{description}</Text>
       }
      
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: .5,
        borderBottomColor: "gray",
        paddingVertical: 12
    },
    itemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6
    },
    title: {
        fontSize: 16,
        fontFamily: "medium",
        color: "#333333"
    },
    icon: {
        width: 12,
        height: 12,
        tintColor: "#333333"
    },
    description: {
        fontSize: 14,
        fontFamily: "regular",
        color: "gray"
    }
})
export default HelpItem