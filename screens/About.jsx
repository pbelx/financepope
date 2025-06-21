import React, { useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const About = () => {
  const { user } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Only show Header for admin users */}
      {user?.is_admin && <Header />}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* App Logo/Icon Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>APP</Text>
            </View>
            <Text style={styles.appName}>FLFL FINANCE</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <Text style={styles.sectionText}>
              We are dedicated to providing an exceptional user experience that connects 
              people and simplifies their daily tasks. Our platform is built with innovation, 
              reliability, and user satisfaction at its core.
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.featureText}>User-friendly interface designed for all skill levels</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.featureText}>Secure authentication and data protection</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.featureText}>Role-based access for different user types</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.featureText}>Real-time updates and notifications</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.featureText}>Cross-platform compatibility</Text>
              </View>
            </View>
          </View>

          {/* Team Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Team</Text>
            <Text style={styles.sectionText}>
              Built by a passionate team of developers and designers who believe in 
              creating technology that makes a difference. We're committed to continuous 
              improvement and listening to our users' feedback.
            </Text>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get in Touch</Text>
            <Text style={styles.sectionText}>
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </Text>
            <View style={styles.contactInfo}>
              <Text style={styles.contactItem}>📧 support@flfl.tech</Text>
              <Text style={styles.contactItem}>🌐 https://flfl.tech</Text>
              <Text style={styles.contactItem}>📱 Follow us on social media</Text>
            </View>
          </View>

          {/* Copyright Section */}
          <View style={styles.footer}>
            <Text style={styles.copyright}>
              © 2025 Finance App. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              Made with ❤️ for our amazing users
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
    textAlign: "justify",
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 16,
    color: "#555",
    flex: 1,
    lineHeight: 22,
  },
  contactInfo: {
    marginTop: 12,
  },
  contactItem: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    lineHeight: 22,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  copyright: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
});

export default About;