import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles";
import { generateAxiosInstance } from "../shared/constants";

const Users = ({ navigation }) => {

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/users/users");
      // console.log("Create Bank", res);
      if (res.data.status) {
        console.log("users", res.data.payload);
        setUsers(res.data.payload);

      }
    } catch (error) {
      console.log(error);

    }
  };

  const makeAdmin = async (user) => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.post("/users/make-admin",{id:user.id});
      // console.log("Create Bank", res);
      if (res.data.status) {
       fetchUsers();
      }
    } catch (error) {
      console.log(error);

    }
  };

  const makeMember = async (user) => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.post("/users/make-member",{id:user.id});
      // console.log("Create Bank", res);
      if (res.data.status) {
        fetchUsers();
      }
    } catch (error) {
      console.log(error);

    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View
      style={{
        paddingVertical: 40,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
      }}
    >
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-sharp" size={32} color="black" />
        </Pressable>
        <View style={{ width: '75%', paddingHorizontal: 20 }}>
          <TextInput style={styles.input} placeholder="Search User" />
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Users</Text>
        </View>
      </View>

      <ScrollView style={{ marginTop: 20 }}>

        <View
          style={{
            flexDirection: "row",
            padding: 10,
            justifyContent: "space-between",
            borderColor: "#e1e1e1",
            borderBottomWidth: 1,
            backgroundColor: "#0275d8",
            marginTop: 20
          }}
        >
          <Text style={{
            width: "40%", fontSize: 12, padding: 2, color: "#fff"
          }}>Name</Text>
          <Text style={{
            width: "40%", fontSize: 12, padding: 2, color: "#fff"
          }}>Email</Text>
          <Text style={{
            width: "20%", fontSize: 12, padding: 2, color: "#fff"
          }}>#</Text>

        </View>
        {users.map((user) => {
          return (
            <View
              key={user.id}
              style={{
                flexDirection: "row",
                padding: 10,
                justifyContent: "space-between",
                borderBottomColor: "#e1e1e1",
                backgroundColor: "#fff",
                borderBottomWidth: 1,
              }}
            >
              <Text style={{
                width: "40%", fontSize: 12, padding: 2
              }}> {user.full_name} </Text>
              <Text style={{
                width: "40%", fontSize: 12, padding: 2
              }}> {user.email} </Text>

              <View style={{
                width: "20%", fontSize: 12, padding: 2
              }}> 
              
              <Pressable onPress={()=>makeAdmin(user)}  style={{padding:2, margin:2,backgroundColor:'#e1e1e1'}}>
                <Text style={{fontSize:12,textAlign:'center'}}>Admin</Text>
              </Pressable>

              <Pressable onPress={()=>makeMember(user)} style={{padding:2, margin:2, backgroundColor:'#e1e1e1'}}>
                <Text style={{fontSize:12, textAlign:'center'}}>Member</Text>
              </Pressable>
               </View>
            </View>

          );
        })}

        <View style={{ height: 50 }}></View>
      </ScrollView>
    </View>
  );
};

export default Users;
