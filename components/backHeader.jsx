import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native'; // Or any other icon library you prefer

const Header = ({ title, canGoBack, onBackPress }) => {
    const navigation = useNavigation();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.headerContainer}>
            {canGoBack !== false && (navigation.canGoBack() || onBackPress) && (
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>{title}</Text>
            {/* Placeholder for right-side actions if needed in the future */}
            {(canGoBack !== false && (navigation.canGoBack() || onBackPress)) && <View style={styles.rightPlaceholder} />}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Distributes space: back button, title, placeholder
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        paddingHorizontal: 10,
        backgroundColor: '#0033A1', // Match your screen background or choose another
        borderBottomWidth: 1,
        borderBottomColor: '#e0e6ed',
        minHeight: 50, // Ensure a minimum height
    },
    backButton: {
        padding: 5, // Make it easier to tap
        marginRight: 10, // Space between button and title
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1, // Allows title to take available space and center correctly
    },
    rightPlaceholder: { // To balance the back button and keep title centered
        width: 28 + 10 + 5, // Approx width of back button + margin + padding
    },
});

export default Header;