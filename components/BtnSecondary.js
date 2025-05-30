import React from "react";
import { ActivityIndicator, Text, Pressable } from "react-native";
import PropTypes from "prop-types";
import styles from "../styles"; // Import your predefined styles.

const BtnSecondary = ({
  title = "Click Me",
  onPress = () => {},
  loading = false,
  buttonStyle,
  textStyle,
  spinnerColor = "#fff",
  spinnerSize = "small",
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={!loading && !disabled ? onPress : null}
      style={[styles.button2, buttonStyle, loading || disabled ? { opacity: 0.7 } : {}]}
      disabled={loading || disabled}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size={spinnerSize} />
      ) : (
        <Text style={[styles.btntext2, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

BtnSecondary.propTypes = {
  title: PropTypes.string,
  onPress: PropTypes.func,
  loading: PropTypes.bool,
  buttonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  spinnerColor: PropTypes.string,
  spinnerSize: PropTypes.oneOf(["small", "large"]),
  disabled: PropTypes.bool,
};

export default BtnSecondary;
