import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { api } from "../services/api";

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("officer@consumer.gov.in");
  const [password, setPassword] = useState("sih2026");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your official email and password");
      return;
    }
    setLoading(true);
    try {
      await api.login(email, password);
      navigation.replace("Capture");
    } catch (err: any) {
      Alert.alert(
        "Authentication Failed",
        err.response?.data?.detail || "Invalid credentials. Please verify your officer credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.badgeText}>GOVERNMENT OF INDIA</Text>
        <Text style={styles.title}>PRAMAAN</Text>
        <Text style={styles.subtitle}>Legal Metrology Statutory Inspection Field Suite</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Official Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="officer@consumer.gov.in"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Security Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Authenticate Officer</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        Under Legal Metrology (Packaged Commodities) Rules, 2011
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 24,
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 32,
  },
  badgeText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: "#f8fafc",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 3,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 10,
    padding: 14,
    color: "#f8fafc",
    marginBottom: 18,
    fontSize: 15,
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerNote: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
  },
});
