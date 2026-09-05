import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "./src/screens/LoginScreen";
import { CaptureScreen } from "./src/screens/CaptureScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { OfflineQueueScreen } from "./src/screens/OfflineQueueScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: "#0f172a" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Pramaan Statutory Inspection" }}
        />
        <Stack.Screen
          name="Capture"
          component={CaptureScreen}
          options={{ title: "Field Inspection Scanner" }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: "Inspection Verdict" }}
        />
        <Stack.Screen
          name="OfflineQueue"
          component={OfflineQueueScreen}
          options={{ title: "Offline Queue" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
