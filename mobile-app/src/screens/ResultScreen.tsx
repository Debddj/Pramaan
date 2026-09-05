import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { api } from "../services/api";

export const ResultScreen = ({ route, navigation }: any) => {
  const result = route.params?.result;

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No scan data available.</Text>
      </View>
    );
  }

  const isCompliant = result.status === "compliant";
  const isViolation = result.status === "violation";

  const handleDownloadNotice = () => {
    const url = api.getNoticeUrl(result.scan_uuid);
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Verdict Card */}
      <View
        style={[
          styles.verdictCard,
          isCompliant && styles.cardCompliant,
          isViolation && styles.cardViolation,
        ]}
      >
        <Text style={styles.verdictTitle}>
          {result.status.toUpperCase().replace("_", " ")}
        </Text>
        <Text style={styles.verdictSubtitle}>
          Scan Reference: {result.scan_uuid}
        </Text>
        <Text style={styles.confidenceText}>
          Extraction Confidence: {Math.round(result.overall_confidence * 100)}%
        </Text>
      </View>

      {/* Optical Metrology Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Optical Ruler Calibration</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Detected Barcode:</Text>
          <Text style={styles.metricValue}>{result.barcode || "N/A"}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Scale Factor:</Text>
          <Text style={styles.metricValue}>
            {result.scale_factor_mm_per_px
              ? `${result.scale_factor_mm_per_px.toFixed(4)} mm/px`
              : "N/A"}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Measured Numeral Height:</Text>
          <Text style={styles.metricValue}>
            {result.measured_numeral_height_mm
              ? `${result.measured_numeral_height_mm.toFixed(2)} mm`
              : "N/A"}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>PDP Area:</Text>
          <Text style={styles.metricValue}>
            {result.pdp_area_sq_cm
              ? `${result.pdp_area_sq_cm.toFixed(1)} cm²`
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Violations Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Statutory Violations ({result.violations?.length || 0})
        </Text>
        {result.violations?.length > 0 ? (
          result.violations.map((v: any, index: number) => (
            <View key={index} style={styles.violationItem}>
              <View style={styles.violationHeader}>
                <Text style={styles.ruleCitation}>{v.citation}</Text>
                <Text style={styles.severityBadge}>{v.severity.toUpperCase()}</Text>
              </View>
              <Text style={styles.violationText}>{v.violation_text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noViolationText}>
            No contraventions detected under Legal Metrology Rules, 2011.
          </Text>
        )}
      </View>

      {/* Evidence Block */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Cryptographic Evidence</Text>
        <Text style={styles.hashText} numberOfLines={2}>
          SHA-256: {result.sha256_hash || "N/A"}
        </Text>
      </View>

      {/* Actions */}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleDownloadNotice}>
        <Text style={styles.primaryBtnText}>Download Statutory Notice (PDF)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate("Capture")}
      >
        <Text style={styles.secondaryBtnText}>Perform New Inspection</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  text: {
    color: "#f8fafc",
    textAlign: "center",
    marginTop: 40,
  },
  verdictCard: {
    backgroundColor: "#334155",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  cardCompliant: {
    backgroundColor: "#065f46",
  },
  cardViolation: {
    backgroundColor: "#991b1b",
  },
  verdictTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 2,
  },
  verdictSubtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
  },
  confidenceText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  sectionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },
  metricValue: {
    color: "#f8fafc",
    fontSize: 13,
    fontWeight: "600",
  },
  violationItem: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
  },
  violationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  ruleCitation: {
    color: "#f8fafc",
    fontWeight: "bold",
    fontSize: 13,
  },
  severityBadge: {
    color: "#ef4444",
    fontSize: 10,
    fontWeight: "bold",
  },
  violationText: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  noViolationText: {
    color: "#10b981",
    fontSize: 13,
  },
  hashText: {
    color: "#94a3b8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  primaryBtn: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: "#334155",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: 15,
  },
});
