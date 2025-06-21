import { View, Text } from "react-native";
import styles from "../styles";

import { COLORS } from "../theme";

const AuthHeader = () => {
  return (
    <View>
      <View
        style={{
          backgroundColor: COLORS.primary,
          padding: 50,
        }}
      >
        <View style={{ height: 150 }}></View>
        <Text
          style={{
            color: "#fff",
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: -50,
          }}
        >
          Finance
        </Text>
        <View style={{ height: 50 }}></View>

      </View>
      <View style={{ height: 30, backgroundColor: '#fff', borderTopLeftRadius: 50, borderTopRightRadius: 50, marginTop: -30, marginBottom: -25 }}></View>
    </View>

  );
};

export default AuthHeader;
