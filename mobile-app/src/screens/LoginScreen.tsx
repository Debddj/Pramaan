import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { api, getBaseUrl, setBaseUrl, DEFAULT_API_URL } from "../services/api";

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("officer@consumer.gov.in");
  const [password, setPassword] = useState("sih2026");
  const [loading, setLoading] = useState(false);

  // Server settings modal state
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  useEffect(() => {
    setServerUrlInput(getBaseUrl());
  }, []);

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
      const serverDetail = err.response?.data?.detail;
      const netMsg = err.message || "Network Error";
      const displayMsg = serverDetail
        ? `Server: ${serverDetail}`
        : `${netMsg}\n\nUnable to reach: ${getBaseUrl()}\n\nNote: Render free tier spins down when inactive. If the server was sleeping, please wait a moment and tap 'Authenticate Officer' again now that it is warm.`;

      Alert.alert("Authentication Failed", displayMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      // Temporarily apply input to test
      setBaseUrl(serverUrlInput);
      const res = await api.testConnection();
      if (res.ok) {
        setConnectionStatus(`Connected (${res.latencyMs}ms) - ${res.message}`);
      } else {
        setConnectionStatus(`Unreachable: ${res.message}`);
      }
    } catch (e: any) {
      setConnectionStatus(`Connection Error: ${e.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleApplyServerUrl = (url: string) => {
    setBaseUrl(url);
    setServerUrlInput(getBaseUrl());
    setServerModalVisible(false);
    Alert.alert("Server Configured", `Pramaan API set to:\n${getBaseUrl()}`);
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
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Security Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#64748b"
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

      {/* Server Configuration & Status */}
      <TouchableOpacity
        style={styles.serverBar}
        onPress={() => setServerModalVisible(true)}
      >
        <View style={styles.serverIndicatorDot} />
        <Text style={styles.serverBarText} numberOfLines={1}>
          Target Server: {getBaseUrl()}
        </Text>
        <Text style={styles.serverBarAction}>Configure</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Under Legal Metrology (Packaged Commodities) Rules, 2011
      </Text>

      {/* Server Settings Modal */}
      <Modal
        visible={serverModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setServerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Inspection Server Configuration</Text>
            <Text style={styles.modalSubtitle}>
              Connect mobile scanner to cloud production or local test server
            </Text>

            <Text style={styles.label}>API Base URL</Text>
            <TextInput
              style={styles.input}
              value={serverUrlInput}
              onChangeText={setServerUrlInput}
              placeholder="https://pramaan-backend.onrender.com/api/v1"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Quick Presets */}
            <View style={styles.presetContainer}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setServerUrlInput("https://pramaan-backend.onrender.com/api/v1")}
              >
                <Text style={styles.presetText}>Cloud (Render)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setServerUrlInput("http://10.0.2.2:8000/api/v1")}
              >
                <Text style={styles.presetText}>Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setServerUrlInput("http://192.168.1.10:8000/api/v1")}
              >
                <Text style={styles.presetText}>LAN IP (192.168.x)</Text>
              </TouchableOpacity>
            </View>

            {/* Connection Test Status */}
            {connectionStatus && (
              <View
                style={[
                  styles.statusBox,
                  connectionStatus.startsWith("Connected")
                    ? styles.statusSuccess
                    : styles.statusError,
                ]}
              >
                <Text style={styles.statusBoxText}>{connectionStatus}</Text>
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <ActivityIndicator color="#cbd5e1" size="small" />
                ) : (
                  <Text style={styles.testBtnText}>Test Ping</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => handleApplyServerUrl(serverUrlInput)}
              >
                <Text style={styles.saveBtnText}>Save & Apply</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setServerModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
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
  serverBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  serverIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 8,
  },
  serverBarText: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  serverBarAction: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  footerNote: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 16,
  },
  presetContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#475569",
  },
  presetText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "600",
  },
  statusBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  statusSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  statusError: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  statusBoxText: {
    color: "#f8fafc",
    fontSize: 12,
    textAlign: "center",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  testBtn: {
    flex: 1,
    backgroundColor: "#334155",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  testBtnText: {
    color: "#cbd5e1",
    fontWeight: "bold",
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  closeBtn: {
    padding: 10,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#94a3b8",
    fontSize: 13,
  },
});
