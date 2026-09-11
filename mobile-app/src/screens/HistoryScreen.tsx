import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Linking,
  RefreshControl,
} from "react-native";
import { api } from "../services/api";

interface ScanItem {
  id: number;
  scan_uuid: string;
  barcode: string;
  product: string;
  manufacturer?: string;
  status: string;
  confidence: number;
  pdp_area_sq_cm?: number;
  measured_numeral_height_mm?: number;
  violations_count: number;
  time: string;
  created_at: string;
}

export const HistoryScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchScans = useCallback(
    async (query = searchQuery, status = statusFilter) => {
      setLoading(true);
      try {
        const data = await api.searchScans({
          q: query,
          status: status,
          page: 1,
          limit: 30,
        });
        setScans(data?.scans || []);
        setTotalCount(data?.total || 0);
      } catch (err) {
        console.warn("Error fetching scan history:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, statusFilter]
  );

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScans();
  };

  const handleOpenScan = async (scanUuid: string) => {
    try {
      setLoading(true);
      const fullScan = await api.getScan(scanUuid);
      navigation.navigate("Result", { result: fullScan });
    } catch (err) {
      console.warn("Error fetching scan detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadNotice = (scanUuid: string) => {
    const url = api.getNoticeUrl(scanUuid);
    Linking.openURL(url).catch(() => {});
  };

  const handleExportCsv = (scanUuid: string) => {
    const url = api.getNoticeCsvUrl(scanUuid);
    Linking.openURL(url).catch(() => {});
  };

  const handleExportJson = (scanUuid: string) => {
    const url = api.getNoticeJsonUrl(scanUuid);
    Linking.openURL(url).catch(() => {});
  };

  const renderItem = ({ item }: { item: ScanItem }) => {
    const isCompliant = item.status === "compliant";
    const isViolation = item.status === "violation";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleOpenScan(item.scan_uuid)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.scanMeta}>
            <Text style={styles.scanUuid}>{item.scan_uuid}</Text>
            <Text style={styles.timestamp}>
              {item.time || item.created_at?.slice(11, 19)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isCompliant && styles.badgeCompliant,
              isViolation && styles.badgeViolation,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCompliant && styles.statusTextCompliant,
                isViolation && styles.statusTextViolation,
              ]}
            >
              {item.status.toUpperCase().replace("_", " ")}
            </Text>
          </View>
        </View>

        <Text style={styles.productName}>{item.product}</Text>
        {item.manufacturer ? (
          <Text style={styles.manufacturerName}>{item.manufacturer}</Text>
        ) : null}

        <View style={styles.detailRow}>
          <Text style={styles.barcodeText}>Barcode: {item.barcode}</Text>
          {item.measured_numeral_height_mm ? (
            <Text style={styles.heightText}>
              Numeral: {item.measured_numeral_height_mm.toFixed(2)} mm
            </Text>
          ) : (
            <Text style={styles.uncalibratedText}>Uncalibrated</Text>
          )}
        </View>

        {item.violations_count > 0 ? (
          <View style={styles.violationTag}>
            <Text style={styles.violationTagText}>
              ⚠️ {item.violations_count} Statutory Contravention
              {item.violations_count > 1 ? "s" : ""}
            </Text>
          </View>
        ) : (
          <View style={styles.compliantTag}>
            <Text style={styles.compliantTagText}>✓ Full Rule Compliance</Text>
          </View>
        )}

        {/* Quick Export Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDownloadNotice(item.scan_uuid)}
          >
            <Text style={styles.actionBtnText}>PDF Notice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleExportCsv(item.scan_uuid)}
          >
            <Text style={styles.actionBtnText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleExportJson(item.scan_uuid)}
          >
            <Text style={styles.actionBtnText}>JSON</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Barcode, Commodity, or Brand..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => fetchScans(searchQuery, statusFilter)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => fetchScans(searchQuery, statusFilter)}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {["all", "compliant", "violation", "under_review"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              statusFilter === status && styles.filterChipActive,
            ]}
            onPress={() => {
              setStatusFilter(status);
              fetchScans(searchQuery, status);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {status.replace("_", " ").toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {totalCount} Total Recorded Inspection{totalCount === 1 ? "" : "s"}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Retrieving inspection records...</Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.scan_uuid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Inspections Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search terms or filter criteria.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  searchSection: {
    flexDirection: "row",
    padding: 12,
    paddingBottom: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#334155",
  },
  searchBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 8,
  },
  searchBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#3b82f6",
  },
  filterChipText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "bold",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultsCount: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: {
    padding: 12,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scanMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanUuid: {
    color: "#60a5fa",
    fontFamily: "monospace",
    fontWeight: "bold",
    fontSize: 12,
  },
  timestamp: {
    color: "#64748b",
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  badgeCompliant: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  badgeViolation: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  statusText: {
    color: "#f59e0b",
    fontSize: 9,
    fontWeight: "bold",
  },
  statusTextCompliant: {
    color: "#10b981",
  },
  statusTextViolation: {
    color: "#ef4444",
  },
  productName: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  manufacturerName: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  barcodeText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontFamily: "monospace",
  },
  heightText: {
    color: "#38bdf8",
    fontSize: 11,
    fontWeight: "600",
  },
  uncalibratedText: {
    color: "#64748b",
    fontSize: 11,
  },
  violationTag: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginBottom: 10,
  },
  violationTagText: {
    color: "#f87171",
    fontSize: 11,
    fontWeight: "600",
  },
  compliantTag: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
    marginBottom: 10,
  },
  compliantTagText: {
    color: "#34d399",
    fontSize: 11,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionBtnText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
});
