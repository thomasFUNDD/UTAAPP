import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../constants'
import Header from '../components/Header'
import HelpItem from '../components/HelpItem'
import { AntDesign } from '@expo/vector-icons'
import { ScrollView } from 'react-native-virtualized-view'
import { helpData } from '../data'

const HelperCenterScreen = () => {
  const [searchValue, setSearchValue] = useState('')
  const [filteredData, setFilteredData] = useState(helpData)

  const handleSearch = () => {
    const filteredItems = helpData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description
          .toLowerCase()
          .includes(searchValue.toLowerCase())
    )
    setFilteredData(filteredItems)
  }
  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Help Center" />
        <ScrollView>
          <View style={{ margin: 16 }}>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.searchIcon}
                onPress={handleSearch}
              >
                <AntDesign
                  name="search1"
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              <TextInput
                placeholder="Search anything here"
                style={styles.input}
                placeholderTextColor="gray"
                onChangeText={(value) => setSearchValue(value)}
                value={searchValue}
                onSubmitEditing={handleSearch}
              />
            </View>
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <HelpItem
                  title={item.title}
                  description={item.description}
                />
              )}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  inputContainer: {
    height: 48,
    borderRadius: 6,
    borderWidth: 0.4,
    borderColor: 'gray',
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingRight: 16,
    fontSize: 16,
    color: 'gray',
  },
})

export default HelperCenterScreen
