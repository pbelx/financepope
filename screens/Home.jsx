import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";
import { generateAxiosInstance } from "../shared/constants";
import UserComp from "../components/UserComp";
import MemberComp from "../components/MemberComp";
import AdminHome from "../components/AdminAssignPage"; 
// import AdminHome from "../components/AdminHome"; 

const Home = () => {
  const { user } = useContext(AuthContext);

  // Function to render the appropriate component based on user role
  const renderUserComponent = () => {
    if (user?.is_admin) {
      return <AdminHome />;
    } else if (user?.is_member) {
      return <MemberComp />;
    } else {
      return <UserComp />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Only show Header for admin users */}
      {user?.is_admin && <Header />}
      <ScrollView>
        {renderUserComponent()}
      </ScrollView>
    </View>
  );
};

export default Home;