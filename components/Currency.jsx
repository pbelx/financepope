import {
  Text,
  TextInput,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  View,
} from "react-native";
import styles from "../styles";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { generateAxiosInstance } from "../shared/constants";
import { ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import useCurrencies from "../hooks/useCurrencies";

const Currency = () => {
  const [currencys, setcurrencys] = useState([]);
  const navigation = useNavigation();
  const { currencies, fetchCurrencies } = useCurrencies();
  const vheight = Dimensions.get("window").height * 0.6;

  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratePerDollar, setratePerDollar] = useState("");
  const [name, setName] = useState("");
  const [catId, setCatId] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const postcurrencys = async () => {
    try {
      if (name === "") {
        alert("Enter Category Name");
      } else if (ratePerDollar === "") {
        alert("ratePerDollar is required");
      } else {
        setPosting(true);

        let formData = {
          name: name,
          code: name,
          symbol: name,
          ratePerDollar: Number(ratePerDollar),
        };

        const axiosInstance = await generateAxiosInstance(true);
        let res = await axiosInstance.post("/currency/create", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status) {
          setPosting(false);
          fetchCurrencies();
          setName(" ");
          setratePerDollar(" ");
        }
      }
    } catch (error) {
      console.error("cate log", error);
      setPosting(false);
    }
  };

  const updatecurrencys = async () => {
    try {
      if (name === "") {
        alert("Enter Category Name");
      } else if (ratePerDollar === "") {
        alert("ratePerDollar is required");
      } else {
        setPosting(true);

        let formData = {
          id: catId,
          name: name,
          code: name,
          symbol: name,
          ratePerDollar: Number(ratePerDollar),
        };

        const axiosInstance = await generateAxiosInstance(true);
        let res = await axiosInstance.put("/currency/update", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status) {
          setPosting(false);
          fetchCurrencies();
          setName(" ");
          setratePerDollar(" ");
        }
      }
    } catch (error) {
      console.error("cate log", error);
      setPosting(false);
    }
  };

  const editCat = (cat) => {
    setCatId(cat.id.toString());
    setName(cat.name);
    setratePerDollar(cat.rate_per_dollar.toString()); // Ensure it's a string for TextInput

    setIsEdit(true);
  };

  return (
    <View style={{ padding: 10 }}>
      <View
        style={{ display: "flex", marginVertical: 10, flexDirection: "row" }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-sharp" size={32} color="black" />
        </Pressable>
        <View style={{ marginLeft: 100, flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Currency</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          backgroundColor: "#fff",
          marginTop: 20,
        }}
      >
        <View style={{ width: "48%" }}>
          <Text>Currency</Text>
          <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
            style={styles.input}
            placeholder="Currency"
          />
        </View>
        {/* // Rendering component */}
        <View style={{ width: "48%", marginLeft: 5 }}>
          <Text>Rate Per dollar</Text>
          <TextInput
            value={ratePerDollar}
            onChangeText={(text) => setratePerDollar(text)}
            style={styles.input}
            placeholder="Rate Per dollar"
          />
        </View>
      </View>
      <View style={{ width: 100 }}>
        {posting ? (
          <Pressable style={styles.button}>
            <ActivityIndicator color="#fff" />
          </Pressable>
        ) : (
          <View>
            {isEdit ? (
              <Pressable onPress={updatecurrencys} style={styles.button}>
                <Text style={{ margin: 5, color: "#fff", textAlign: "center" }}>
                  Update
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={postcurrencys} style={styles.button}>
                <Text style={{ margin: 5, color: "#fff", textAlign: "center" }}>
                  Save
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      <View style={{ height: vheight }}>
        <ScrollView style={{ marginTop: 20 }}>
          {currencies.map((cat) => {
            return (
              <View
                key={cat.id}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#e1e1e1",
                }}
              >
                <Text style={{ width: "40%", padding: 10 }}>{cat.name}</Text>

                <Text style={{ width: "40%", padding: 10 }}>
                  {cat.rate_per_dollar.toLocaleString()}
                </Text>
                <View
                  style={{
                    width: "20%",
                  }}
                >
                  <Pressable
                    onPress={() => editCat(cat)}
                    style={{ padding: 5 }}
                  >
                    <Text
                      style={{
                        color: "orange",
                        textAlign: "center",
                        backgroundColor: "#fff",
                        padding: 5,
                      }}
                    >
                      Edit
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          {loading ? <ActivityIndicator /> : null}
          <View style={{ height: 200 }}></View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Currency;
