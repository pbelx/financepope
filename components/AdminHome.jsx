import React from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  SafeAreaView,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Banknote, FileText, Shield, Settings, HelpCircle, ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

import { Card } from "./ui/card";

const AdminHome = () => {
  const navigation = useNavigation();

  const sections = [
    {
      title: "Manage Users",
      icon: <User color="#FFFFFF" size={28} />,
      route: "ManageUsers",
      description: "Add, remove, and update user accounts",
      gradient: ["#4F46E5", "#7C3AED"],
    },
    {
      title: "Transactions",
      icon: <Banknote color="#FFFFFF" size={28} />,
      route: "Transactions",
      description: "View and manage transactions",
      gradient: ["#10B981", "#059669"],
    },
    {
      title: "Reports",
      icon: <FileText color="#FFFFFF" size={28} />,
      route: "Reports",
      description: "Generate and download reports",
      gradient: ["#F97316", "#EA580C"],
    },
    {
      title: "Security",
      icon: <Shield color="#FFFFFF" size={28} />,
      route: "Security",
      description: "Manage security settings",
      gradient: ["#EF4444", "#DC2626"],
    },
    {
      title: "Settings",
      icon: <Settings color="#FFFFFF" size={28} />,
      route: "Settings",
      description: "Adjust platform configurations",
      gradient: ["#6B7280", "#4B5563"],
    },
    {
      title: "Support",
      icon: <HelpCircle color="#FFFFFF" size={28} />,
      route: "Support",
      description: "Access help and support",
      gradient: ["#DB2777", "#BE185D"],
    },
  ];

  const screenWidth = Dimensions.get("window").width;
  const numColumns = 2;
  const spacing = 16;
  const cardWidth = (screenWidth - spacing * (numColumns + 1)) / numColumns;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gridItem, { width: cardWidth }]}
      onPress={() => navigation.navigate(item.route)}
      activeOpacity={0.8}
    >
      <Card style={styles.card}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {item.icon}
        </LinearGradient>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
          <View style={styles.arrowContainer}>
            <ChevronRight color="#6B7280" size={20} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#0033A1" />
      
      {/* <View style={styles.header}>
       
        <Text style={styles.subtitle}>Manage your application</Text>
      </View> */}
      
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  grid: {
    padding: 16,
    paddingTop: 1,
  },
  gridItem: {
    margin: 8,
    height: 180,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    height: 60,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    // borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default AdminHome;