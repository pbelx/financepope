import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "./theme";

const screenheight = Dimensions.get("window").height;
const height6 = screenheight * 0.1;
const height1 = screenheight * 0.3;
const height2 = screenheight * 0.1;

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    width: "100%",
    // color: '#fff',
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
  filterContainer: {
    // backgroundColor:"yellow",
    padding:10
  },
  gtitle: { 
    fontSize: 20,
     marginTop: 20, 
     marginLeft: 10,
     fontWeight:'bold'
    },
  buttonact: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
  },

  buttonactright: {
    backgroundColor: "#007bff",
    width: "48%",
    marginLeft: 10,
    borderRadius: 5,
    padding: 12,
    flexDirection: "row",
  },
  buttonact2: {
    backgroundColor: "#007bff",
    width: "48%",
    borderRadius: 5,
    padding: 12,
  },
  topActionText: {
    color: "#007bff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  buttonact2right: {
    backgroundColor: "#007bff",
    width: "48%",
    color: "#000",
    marginLeft: 10,
    borderRadius: 5,
    padding: 12,
  },
  button2: {
    backgroundColor: "#fff",
    width: "100%",
    color: "#007bff",
    borderWidth: 1,
    borderColor: "#007bff",
    marginTop: 20,
    borderRadius: 5,
    padding: 10,
  },
  btnCart: {
    backgroundColor: "#fff",
    color: "#007bff",
    borderWidth: 1,
    borderColor: "#007bff",
    marginTop: 20,
    borderRadius: 10,
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
  },
  attriutes: {
    flexDirection: "row",
    borderColor: "#e1e1e1",
    borderWidth: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "space-between",
  },
  buttonAdd: {
    backgroundColor: "#007bff",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    display: "center",
    flexDirection: "row",
  },
  btntext: {
    fontSize: 18,
    fontWeight: "medium",
    textAlign: "center",
    color: "#fff",
  },
  btntext2: {
    fontSize: 16,
    fontWeight: "medium",
    textAlign: "center",
    color: "#007bff",
    fontFamily: "Gilroy-Bold",
  },
  container: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingRight: 25,
    paddingBottom: 50,
    paddingLeft: 25,
    height: "100%",
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    height: "100%",
    width: "100%",
    // backgroundSize: 'cover'
  },
  textTitle: {
    color: "#007bff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  textTitle2: {
    color: "#007bff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: -15,
  },
  textTitle3: {
    color: "#000",
    fontSize: 30,
    fontWeight: "medium",
    textAlign: "center",
  },
  textDes: {
    color: "#000",
    fontSize: 13,
    textAlign: "center",
  },
  spaceview: {
    height: height6,
  },
  spaceview2: {
    height: height2,
  },
  pageTitle: {
    fontWeight: "bold",
    fontSize: 24,
  },

  pageHeader: {
    display: "flex",
  },
  inputLabel: {
    fontSize: 15,
    marginTop: 20
  },
  bgoverlay: {
    height: "100%",
    Width: "100%",
    padding: 50,
    backgroundColor: "#007bff",
  },
  bgoverlay2: {
    height: 400,
    Width: "100%",
    padding: 50,
    backgroundColor: "#fff",
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderStyle: "solid",
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: "60%",
    marginLeft: 5,
    fontSize: 16,
    color: "#616161",
    // marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderStyle: "solid",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    borderRadius: 5,
    width: "100%",
    fontSize: 14,
    // color: "#616161",
    color: "#000",
    marginTop: 10,
  },
  countryCode: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderStyle: "solid",
    borderRadius: 10,
    width: "37%",
    fontSize: 16,
    color: "#616161",
    marginTop: 10,
  },
  giftTitle: {
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#007bff",
    width: 150,
    padding: 5,
    borderRadius: 5,
    color: "#fff",
  },
  countryCodeinput: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderStyle: "solid",
    borderRadius: 10,
    width: "100%",
    fontSize: 16,
    color: "#616161",
    marginTop: 10,
  },
  selectinput: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderStyle: "solid",
    borderRadius: 8,
    width: "100%",
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#616161",
    marginTop: 10,
  },
  textp: {
    fontSize: 18,
    color: "#000",
  },
  texts: {
    fontSize: 18,
    color: "#007dff",
    fontWeight: "medium",
  },
  inputAndroid: {
    border: "1px #e1e1e1 solid",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    fontSize: 18,
    color: "#616161",
    marginTop: 10,
  },
});

export default styles;
