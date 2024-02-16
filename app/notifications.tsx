import { View, Text, StyleSheet, useWindowDimensions, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../constants'
import Header from '../components/Header'
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { allNotifications, unreadNotifications } from '../data'
import NotificationCard from '../components/NotificationCard'

const AllNotificationsRoute = () => (
  <View style={{ flex: 1, padding: 16, backgroundColor: COLORS.white }}>
    <FlatList
      data={allNotifications}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <NotificationCard
          icon={item.icon}
          title={item.title}
          name={item.name}
          amount={item.amount}
          date={item.date}
          onPress={() => console.log("Pressed")}
        />
      )}
    />
  </View>
);

const UnreadNotificationsRoute = () => (
  <View style={{ flex: 1, padding: 16, backgroundColor: COLORS.white }}>
    <FlatList
      data={unreadNotifications}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <NotificationCard
          icon={item.icon}
          title={item.title}
          name={item.name}
          amount={item.amount}
          date={item.date}
          onPress={() => console.log("Pressed")}
        />
      )}
    />
  </View>
);

const renderScene = SceneMap({
  first: AllNotificationsRoute,
  second: UnreadNotificationsRoute,
});

const NotificationsScreen = () => {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'All Notifications' },
    { key: 'second', title: 'Unread' },
  ]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: COLORS.primary,
      }}
      style={{
        backgroundColor: '#fff',
      }}
      renderLabel={({ route, focused, color }) => (
        <Text style={[{
          color: focused ? COLORS.primary : 'gray',
          fontSize: 14,
          fontFamily: focused ? "medium" : "regular"
        }]}>
          {route.title}
        </Text>
      )}
    />
  )

  return (
    <SafeAreaView style={styles.area}>
      <View style={styles.container}>
        <Header title="Notifications" />
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: COLORS.white
  },
  container: {
    flex: 1
  }
})
export default NotificationsScreen