import { Pressable, View, Text, StyleSheet, TextInput, Platform } from "react-native"
import gstyles from "../styles"
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme";
import BtnPrimary from "../components/BtnPrimary";
import { generateAxiosInstance } from "../shared/constants";
import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";

const Collected = () => {
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/users/members");
      
      if (res.data.status) {
        console.log("users", res.data.payload);
        setUsers(res.data.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [])

  const [collections, setCollections] = useState([]);

  const fetchCollections = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/collections");
      
      if (res.data.status) {
        console.log("collections", res.data.payload);
        setCollections(res.data.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [amount, setAmount] = useState(null);
  const [useId, setUserId] = useState(null);
  const [posting, setPosting] = useState(false);

  const postCollections = async () => {
    try {
      setPosting(true);
      const axiosInstance = await generateAxiosInstance(true);
      let data = {
        amount: amount,
        userId: useId
      };
      let res = await axiosInstance.post("/collections", data);
      
      if (res.data.status) {
        setPosting(false);
        setAmount(null);
        setUserId(null);
        fetchCollections();
        fetchUsers();
      }
    } catch (error) {
      console.log(error);
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [])

  // Get selected user name for display
  const getSelectedUserName = () => {
    if (!useId) return "Select User";
    const selectedUser = users.find(user => user.id === useId);
    return selectedUser ? selectedUser.full_name : "Select User";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Pressable onPress={() => navigation.navigate("Home")} style={styles.backButton}>
            <AntDesign name="arrowleft" size={32} color="black" />
          </Pressable>
        </View>
        <View style={styles.titleContainer}>
          <Text style={gstyles.gtitle}>Collected</Text>
        </View>
        <View style={styles.spacer}></View>
      </View>

      {/* Input Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputRow}>
          <View style={styles.amountContainer}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              placeholder="Enter Amount"
              style={gstyles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => setAmount(text)}
            />
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Select User</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={useId}
                onValueChange={(itemValue) => setUserId(itemValue)}
                style={styles.picker}
                mode="dropdown" // This helps on Android
                dropdownIconColor={COLORS.primary} // Makes dropdown arrow visible
                itemStyle={styles.pickerItem} // For iOS styling
              >
                <Picker.Item 
                  label="Select User" 
                  value={null} 
                  color={Platform.OS === 'android' ? '#999' : undefined}
                />
                {users.map((user) => (
                  <Picker.Item 
                    key={user.id} 
                    label={user.full_name} 
                    value={user.id}
                    color={Platform.OS === 'android' ? '#333' : undefined}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <BtnPrimary loading={posting} onPress={postCollections} title="Save" />
        </View>
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <View style={styles.dateColumn}>
            <Text style={styles.tableHeader}>Date</Text>
          </View>
          <View style={styles.memberColumn}>
            <Text style={styles.tableHeader}>Member</Text>
          </View>
          <View style={styles.amountColumn}>
            <Text style={styles.tableHeader}>Amount</Text>
          </View>
        </View>

        {/* Table Body */}
        {collections.map((col, index) => {
          // Find user name from users array
          const user = users.find(u => u.id === col.userId);
          const userName = user ? user.full_name : `User ${col.userId}`;
          
          return (
            <View key={index} style={[styles.tableRow, styles.tableBodyRow]}>
              <View style={styles.dateColumn}>
                <Text style={styles.tablebody}>
                  {col.created_at ? col.created_at.slice(0, 10) : ''}
                </Text>
              </View>
              <View style={styles.memberColumn}>
                <Text style={styles.tablebody}>{userName}</Text>
              </View>
              <View style={styles.amountColumn}>
                <Text style={styles.tablebody}>{col.amount.toLocaleString()}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default Collected

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  spacer: {
    width: 42,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  amountContainer: {
    flex: 1,
  },
  pickerContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: COLORS.primary
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    // Enhanced styling for better visibility
    minHeight: 50,
    justifyContent: 'center',
    ...Platform.select({
      android: {
        paddingHorizontal: 0, // Remove padding on Android
      },
      ios: {
        paddingHorizontal: 10,
      }
    })
  },
  picker: {
    height: 50,
    width: '100%',
    // Platform-specific styling
    ...Platform.select({
      android: {
        color: '#333',
        backgroundColor: 'transparent',
      },
      ios: {
        color: '#333',
      }
    })
  },
  pickerItem: {
    // iOS specific item styling
    fontSize: 16,
    color: '#333'
  },
  buttonContainer: {
    width: 120,
    alignSelf: 'flex-end'
  },
  tableContainer: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: COLORS.primary3,
    paddingVertical: 12,
  },
  tableBodyRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingVertical: 10,
  },
  dateColumn: {
    width: '30%',
    paddingHorizontal: 8,
  },
  memberColumn: {
    width: '40%',
    paddingHorizontal: 8,
  },
  amountColumn: {
    width: '30%',
    paddingHorizontal: 8,
  },
  tableHeader: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14
  },
  tablebody: {
    fontSize: 13,
    color: '#333'
  }
})