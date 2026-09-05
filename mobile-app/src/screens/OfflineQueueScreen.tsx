import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { offlineQueue, QueuedScan } from "../services/offlineQueue";

export const OfflineQueueScreen = ({ navigation }: any) => {
  const [items, setItems] = useState<QueuedScan[]>(offlineQueue.getQueue());
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await offlineQueue.syncAll();
      setItems(offlineQueue.getQueue());
      Alert.alert(
        "Sync Complete",
        `Successfully uploaded: ${res.success}\nFailed / Pending: ${res.failed}`
      );
    } catch (err: any) {
      Alert.alert("Sync Error", err.message || "Failed to sync offline scans");
    } finally {
      setSyncing(false);
    }
  };

  const handleClear = () => {
    offlineQueue.clearSynced();
    setItems(offlineQueue.getQueue());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline Inspection Queue</Text>
        <Text style={styles.subtitle}>
          Inspections captured without field cellular network coverage
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemRow}>
              <Text style={styles.itemId}>{item.id}</Text>
              <Text
                style={[
                  styles.statusTag,
                  item.status === "synced" && styles.tagSynced,
                  item.status === "failed" && styles.tagFailed,
                ]}
              >
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.itemMeta}>Barcode: {item.barcode || "N/A"}</Text>
            <Text style={styles.itemMeta}>Captured: {item.timestamp}</Text>
            {item.error && <Text style={styles.itemError}>{item.error}</Text>}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No pending offline inspections.</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.syncBtn, syncing && styles.btnDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.syncBtnText}>Sync All Pending to Server</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>Purge Synced Records</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  itemId: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 13,
  },
  statusTag: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  tagSynced: {
    color: "#10b981",
  },
  tagFailed: {
    color: "#ef4444",
  },
  itemMeta: {
    color: "#cbd5e1",
    fontSize: 12,
    marginBottom: 2,
  },
  itemError: {
    color: "#ef4444",
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    marginTop: 40,
  },
  footer: {
    marginTop: 16,
  },
  syncBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  syncBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  clearBtn: {
    backgroundColor: "#334155",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  clearBtnText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
