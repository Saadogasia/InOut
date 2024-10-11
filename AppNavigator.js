import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import Welcome from "./Welcome";
import AuthScreen from "./Auth";
import Home from "./Home";
import History from "./History";
import Profile from "./Profile";
import BalanceCircleScreen from "./BalanceCircleScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ userId }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: "black",
        },
        headerTintColor: "#e4fc5e",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerTitleAlign: "center",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopColor: "#444444",
        },
        tabBarLabelStyle: {
          color: "#e4fc5e",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "money-bills";
            return <FontAwesome6 name={iconName} size={size} color={color} />;
          } else if (route.name === "History") {
            iconName = "history";
            return <FontAwesome name={iconName} size={size} color={color} />;
          } else if (route.name === "Profile") {
            iconName = "user";
            return <AntDesign name={iconName} size={size} color={color} />;
          } else if (route.name === "BalanceCircle") {
            iconName = "pie-chart";
            return <FontAwesome name={iconName} size={size} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen name="Home" options={{ title: "IN OUT" }}>
        {(props) => <Home {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="History" options={{ title: "History" }}>
        {(props) => <History {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="BalanceCircle" options={{ title: "Pie" }}>
        {(props) => <BalanceCircleScreen {...props} userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ title: "Profile" }}>
        {(props) => <Profile {...props} userId={userId} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ showWelcome, userId, onAuth }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome ? (
          <Stack.Screen name="Welcome" component={Welcome} />
        ) : userId ? (
          <Stack.Screen name="MainTabs">
            {(props) => <MainTabs {...props} userId={userId} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth">
            {(props) => <AuthScreen {...props} onAuth={onAuth} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
