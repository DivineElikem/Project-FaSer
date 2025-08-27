import { createDrawerNavigator } from "@react-navigation/drawer"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

// Screens
import HomeScreen from "../screens/HomeScreen"
import LiveScreen from "../screens/LiveScreen"
import AccessScreen from "../screens/AccessScreen"
import UsersScreen from "../screens/UsersScreen"
import LogsScreen from "../screens/LogsScreen"
import SettingsScreen from "../screens/SettingsScreen"

const Drawer = createDrawerNavigator()
const Tab = createBottomTabNavigator()

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Live") {
            iconName = focused ? "camera" : "camera-outline"
          } else if (route.name === "Access") {
            iconName = focused ? "finger-print" : "finger-print-outline"
          } else {
            iconName = "help-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Live" component={LiveScreen} />
      <Tab.Screen name="Access" component={AccessScreen} />
    </Tab.Navigator>
  )
}

export default function MainNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: "#2196F3",
        drawerInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: "#2196F3",
        },
        headerTintColor: "#fff",
      }}
    >
      <Drawer.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{
          title: "FaSer Control",
          drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Users"
        component={UsersScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="people-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Logs"
        component={LogsScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="list-outline" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  )
}
