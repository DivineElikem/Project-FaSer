import { NavigationContainer } from "@react-navigation/native"
import { PaperProvider } from "react-native-paper"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import MainNavigator from "./src/navigation/MainNavigator"
import { theme } from "./src/styles/theme"

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainNavigator />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}
