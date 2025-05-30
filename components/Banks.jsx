import { View, Text, TextInput, Pressable } from "react-native";
import styles from "../styles";
import BtnPrimary from "./BtnPrimary";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { generateAxiosInstance } from "../shared/constants";
import { useEffect, useState } from "react";
import BtnSecondary from "./BtnSecondary";
const Banks = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const postBank = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let data = {
        name: name,
      };
      let res = await axiosInstance.post("/banks", data);
      
      if (res.data.status) {
        setLoading(false);
        setName("");
        fetchBank();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const [isEdit, setIsEdit] = useState(false);
  const [bankId, setBankID] = useState("");
  const updateBank = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let data = {
        id: bankId,
        name: name,
      };
      let res = await axiosInstance.put("/banks", data);
      
      if (res.data.status) {
        setIsEdit(false);
        setLoading(false);
        setBankID("");
        setName("");
        fetchBank();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const editBank = (bank) => {
    setName(bank.name);
    setBankID(bank.id);
    setIsEdit(true);
  };

  const [banks, setBanks] = useState([]);
  const fetchBank = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let data = {
        name: name,
      };
      let res = await axiosInstance.get("/banks", data);
     
      if (res.data.status) {
        console.log("Banks", res.data.payload);
        setBanks(res.data.payload);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBank();
  }, []);

  return (
    <View>
      <Text style={styles.gtitle}>Banks</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: "70%" }}>
          <TextInput
            placeholder="Enter Bank"
            onChangeText={(text) => setName(text)}
            value={name}
            style={styles.input}
          />
        </View>

        <View style={{ width: "30%", paddingLeft: 10 }}>
          {isEdit ? (
            <BtnSecondary loading={loading} title="Update" onPress={updateBank} />
          ) : (
            <BtnPrimary loading={loading} onPress={postBank} title="Save" />
          )}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          backgroundColor: "#e1e1e1",
        }}
      >
        <View style={{ width: "80%", padding: 10 }}>
          <Text>Banks</Text>
        </View>
        <View style={{ width: "20%", padding: 10, marginLeft: 10 }}>
          <Text>Action</Text>
        </View>
      </View>

      {banks.map((bank) => {
        return (
          <>
            <View key={bank.id}
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: "#e1e1e1",
              }}
            >
              <View style={{ width: "80%", padding: 10 }}>
                <Text style={{ fontWeight: "bold" }}>{bank.name}</Text>
              </View>
              <View style={{ width: "20%", padding: 10, marginLeft: 10 }}>
                <Pressable onPress={() => editBank(bank)}>
                  <FontAwesome name="edit" size={24} color="black" />
                </Pressable>
              </View>
            </View>
          </>
        );
      })}
    </View>
  );
};
export default Banks;
