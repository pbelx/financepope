import { Pressable, View, Text, StyleSheet,TextInput } from "react-native"
import gstyles from "../styles"
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme";
import BtnPrimary from "../components/BtnPrimary";


const Commissions = () => {
    const navigation = useNavigation();
    const balances = [
        { id: 1, collected: 23000, Commissions: 5000, commission: 4000, balance: 3200 },
        { id: 2, collected: 100000, Commissions: 45000, commission: 43000, balance: 7200 },
        { id: 3, collected: 43000, Commissions: 25000, commission: 1000, balance: 14200 },
        { id: 4, collected: 13000, Commissions: 52000, commission: 6000, balance: 17200 },
        { id: 5, collected: 11000, Commissions: 51000, commission: 4000, balance: 16200 },
        { id: 6, collected: 9000, Commissions: 15000, commission: 40600, balance: 1200 },
    ]
    return (
        <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                <View>
                    <Pressable onPress={() => navigation.navigate("Home")} style={{ padding: 5 }}>
                        <AntDesign name="arrowleft" size={32} color="black" />
                    </Pressable>

                </View>
                <View>
                    <Text style={gstyles.gtitle}>Commissions</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row' }}>
            <View style={{width:'20%'}}>
                <TextInput placeholder="4" style={gstyles.input}/>
            </View>
            <View style={{width:'30%',marginLeft:20}}>
                <BtnPrimary title="Generate" />
            </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 10, backgroundColor: COLORS.primary3, justifyContent: 'space-between' }}>
                <View style={{ padding: 5 }}>
                    <Text style={styles.tableHeader}>Date</Text>
                </View>
                <View style={{ padding: 5 }}>
                    <Text style={styles.tableHeader}>Distributed</Text>
                </View>
                <View style={{ padding: 5 }}>
                    <Text style={styles.tableHeader}>Commissions</Text>
                </View>


            </View>
            {balances.map((bal) => {
                return (
                    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#e1e1e1', justifyContent: 'space-between' }}>
                        <View style={{width: '30%', padding: 5 }}>
                            <Text style={styles.tablebody}>12-09-2025</Text>
                        </View>
                        <View style={{width: '30%', padding: 5 }}>
                            <Text style={styles.tablebody}>{bal.collected.toLocaleString()}</Text>
                        </View>
                        <View style={{width: '30%', padding: 5 }}>
                            <Text style={styles.tablebody}>{bal.Commissions.toLocaleString()}</Text>
                        </View>


                    </View>
                )
            })}
        </View>
    )
}

export default Commissions

const styles = StyleSheet.create({
    tableHeader: {
        color: COLORS.primary, fontWeight: 'bold'
    },
    tablebody: {

    }
})