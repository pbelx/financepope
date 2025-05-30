import React, { useContext, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";
import Home from "./screens/Home";
import About from "./screens/About"; // Import the About component
import Settings from "./screens/Settings";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import Reset from "./screens/Resset"; // Fixed typo: "Resset" -> "Reset"
import MyOrders from "./screens/AllOrders";
import RequestTransactionScreen from "./screens/AddOrder";
import TransactionListScreen from "./components/UserComp";
import OrderDetails from "./screens/OrderDetails";
import Profile from "./screens/Profile";
import Balances from "./screens/Balances";
import Collected from "./screens/Collected";
import CompletedOrder from "./screens/CompletedOrder";
import Reports from "./screens/Reports";
import Distributed from "./screens/Distributed";
import Collections from "./screens/Collections";
import Commissions from "./screens/Commissions";
import Users from "./screens/Users";
import Members from "./screens/Members";
import Messages from "./screens/Messages";
import AllOrders from "./screens/AllOrders";
import Admins from "./screens/Admins";
import Transactions from "./screens/Transactions";
import CompletedOrderAdmin from "./screens/CompletedOrderAdmin";
import AdminPendingOrder from "./components/AdminPendingOrder";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StackNav() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Reset" component={Reset} />
      <Stack.Screen name="About" component={About} />
      <Stack.Screen name="Balances" component={Balances} />
      <Stack.Screen name="Collections" component={Collections} />
      <Stack.Screen name="CompletedOrderAdmin" component={CompletedOrderAdmin} />
      <Stack.Screen name="CompletedOrder" component={CompletedOrder} />
      <Stack.Screen name="Commissions" component={Commissions} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Distributed" component={Distributed} />
      <Stack.Screen name="RequestTransactionScreen" component={RequestTransactionScreen} />
      <Stack.Screen name="TransactionListScreen" component={TransactionListScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="Users" component={Users} />
      <Stack.Screen name="Members" component={Members} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen name="AllOrders" component={AllOrders} />
      <Stack.Screen name="Collected" component={Collected} />
      <Stack.Screen name="Admin" component={Admins} />
      <Stack.Screen name="Home" component={TabNav} />
      <Stack.Screen name="Transactions" component={Transactions} />
      <Stack.Screen name="AdminPendingOrder" component={AdminPendingOrder} />
    </Stack.Navigator>
  );
}

function TabNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#0033A1",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="HomePage"
        component={Home}
        options={{
          tabBarLabel: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={About}
        options={{
          tabBarLabel: "About",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="information-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Profile"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return <StackNav />;
}