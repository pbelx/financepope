import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { Animated } from "react-native";

// Main Card component with press animation
export const Card = ({ 
  children, 
  style, 
  variant = "elevated", 
  onPress, 
  disabled = false,
  testID,
  borderColor,
  backgroundColor = "#FFFFFF"
}) => {
  // Animation value for press effect
  const animatedScale = new Animated.Value(1);
  
  // Handle press animation
  const handlePressIn = () => {
    if (!onPress) return;
    
    Animated.spring(animatedScale, {
      toValue: 0.98,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    if (!onPress) return;
    
    Animated.spring(animatedScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Determine card style based on variant
  const cardStyle = [
    styles.card,
    variant === "elevated" && styles.elevated,
    variant === "outlined" && styles.outlined,
    variant === "flat" && styles.flat,
    borderColor && { borderColor },
    { backgroundColor },
    style,
  ];
  
  // Wrap in Pressable if onPress is provided
  const content = (
    <Animated.View 
      style={[
        cardStyle, 
        { transform: [{ scale: onPress ? animatedScale : 1 }] }
      ]}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <Pressable 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          pressed && styles.pressed,
          disabled && styles.disabled
        ]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }
  
  return content;
};

// Card Header component
export const CardHeader = ({ children, style }) => {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
};

// Card Content component
export const CardContent = ({ children, style, padded = true }) => {
  return (
    <View style={[
      styles.cardContent, 
      padded && styles.cardContentPadded,
      style
    ]}>
      {children}
    </View>
  );
};

// Card Footer component
export const CardFooter = ({ children, style }) => {
  return (
    <View style={[styles.cardFooter, style]}>
      {children}
    </View>
  );
};

// Card Media component for images
export const CardMedia = ({ children, style }) => {
  return (
    <View style={[styles.cardMedia, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  // Variant styles
  elevated: {
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  outlined: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  flat: {
    // No shadow or border
  },
  // Section styles
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardContent: {
    justifyContent: "center",
  },
  cardContentPadded: {
    padding: 16,
  },
  cardFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cardMedia: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  // Interactive states
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
});