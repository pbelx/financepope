import { useState, useEffect } from "react";

import { View, Text, TextInput } from "react-native";
import styles from "../styles";
import BtnPrimary from "./BtnPrimary";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { generateAxiosInstance } from "../shared/constants";
import useCurrencies from "../hooks/useCurrencies";
import { Picker } from "@react-native-picker/picker";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons as Icon } from "@expo/vector-icons";

const Places = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [banksId, setBanksId] = useState("");
  const [currencysId, setCurrencyId] = useState("");
  const [places, setPlaces] = useState([])
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/places");
      if (res.data.status) {
        setPlaces(res.data.payload);
        console.log("places", res.data.payload);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  
  const fetchBanks = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/banks");

      if (res.data.status) {
        setFetchedBanks(res.data.payload);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
    fetchPlaces();
  }, []);

  const postPlace = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let formdata = {
        name: name,
        banks: JSON.stringify(banksId),
        currencys: JSON.stringify(currencysId)
      }
      let res = await axiosInstance.post("/places", formdata);
      if (res.data.status) {
        // console.log('post place', res.data);
        fetchPlaces();
      }
    } catch (error) {
      console.log(error)
    }
  }

  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const [fetchedBanks, setFetchedBanks] = useState([]);
  const [banks, setBanks] = useState([]);

  const { currencies: fetchedCurrencies } = useCurrencies();

  const [currencies, setCurrencies] = useState([]);



  return (
    <View>
      <Text style={styles.gtitle}>Places</Text>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: "50%" }}>
          <TextInput onChangeText={(text) => setName(text)}
            value={name} placeholder="Enter Place Name" style={styles.input} />
        </View>

        <View style={{ width: "50%", paddingLeft: 10 }}>
          <View style={styles.input}>
            {
              // @ts-ignore
              <SectionedMultiSelect
                items={fetchedCurrencies}
                // @ts-ignore
                IconRenderer={Icon}
                uniqueKey="id"
                onSelectedItemsChange={setCurrencyId}
                selectedItems={currencysId}
                selectText="Choose Currency"
              />
            }
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: "50%" }}>
          <View style={styles.input}>
            {
              // @ts-ignore
              <SectionedMultiSelect
                items={fetchedBanks}
                // @ts-ignore
                IconRenderer={Icon}
                uniqueKey="id"
                onSelectedItemsChange={setBanksId}
                selectedItems={banksId}
                selectText="Choose Banks"
              />
            }
          </View>
        </View>

        <View style={{ width: "30%", marginLeft: 60 }}>
          <BtnPrimary onPress={postPlace} loading={loading} title="Save" />
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
          <Text>Place</Text>
        </View>
        <View style={{ width: "20%", padding: 10, marginLeft: 10 }}>
          <Text>Action</Text>
        </View>
      </View>

      {places.map((place) => {
        return (
          <View key={place.id} style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#e1e1e1"
          }}>
            <View style={{ width: "80%", padding: 10 }}>
              <Text style={{ fontWeight: "bold" }}>{place.name}</Text>

              <View style={{ flexDirection: "row" }}>
                <View
                  style={{ width: "50%", flexDirection: "row", flexWrap: "wrap" }}
                >

                  {place?.banks?.map((bank) => {
                    return (
                      <View style={{ backgroundColor: '#e1e1e1', margin: 2, padding: 2 }}>
                        <Text style={{ fontSize: 10 }}>{bank?.name}</Text>
                      </View>
                    )
                  })}
                </View>
                <View
                  style={{ width: "50%", flexDirection: "row", flexWrap: "wrap" }}
                >

                  {place?.currencys?.map((curreny) => {
                    return (
                      <View style={{ borderColor: '#e1e1e1', borderWidth: 1, margin: 2, padding: 2 }}>
                        <Text style={{ fontSize: 10 }}>{curreny.name}</Text>
                      </View>
                    )
                  })}
                </View>


              </View>
            </View>
            <View style={{ width: "20%", padding: 10, marginLeft: 10 }}>
              <FontAwesome name="edit" size={24} color="black" />
            </View>

          </View>
        )
      })}


    </View>
  );
};
export default Places;
