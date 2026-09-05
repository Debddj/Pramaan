import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Accelerometer } from "expo-sensors";
import { api } from "../services/api";
import { offlineQueue } from "../services/offlineQueue";

export const CaptureScreenConfig = {
  reticleGuide: "Align EAN-13 barcode inside blue HUD bracket",
  motionGuardThreshold: 0.18,
  offlineQueueKey: "@pramaan_offline_scans",
};

export const CaptureScreen = ({ navigation }: any) => {
  const [isStable, setIsStable] = useState(true);
  const [jitter, setJitter] = useState(0.05);
  const [uploading, setUploading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    Accelerometer.setUpdateInterval(200);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const currentJitter = Math.sqrt(x * x + y * y + (z - 1) * (z - 1));
      setJitter(currentJitter);
      setIsStable(currentJitter < CaptureScreenConfig.motionGuardThreshold);
    });

    setPendingCount(offlineQueue.getPendingCount());

    return () => subscription && subscription.remove();
  }, []);

  const handleCapture = async () => {
    if (!isStable) {
      Alert.alert(
        "Motion Blur Guard Active",
        "Device movement detected. Please hold device steady to ensure statutory numeral measurement precision."
      );
      return;
    }

    setUploading(true);
    try {
      // Simulate photo capture data for testing / field demonstration
      const sampleScanPayload = {
        barcode: "8901030000001",
        pdp_area_sq_cm: 180.0,
        detected_barcode_width_px: 745.8,
        detected_text_height_px: 36.0,
        category: "biscuits",
        raw_ocr_text: `BRITANNIA GOOD DAY Butter Cookies\nNet Qty: 100 g\nMRP Rs. 30.00 (Incl. of all taxes)\nMfg: 08/2026\nMfd By: Britannia Ltd, Kolkata\nCare: feedback@britindia.com`,
      };

      const result = await api.uploadScan(sampleScanPayload as any);
      navigation.navigate("Result", { result });
    } catch (err: any) {
      // Fallback to offline queue
      offlineQueue.enqueue({
        imageUri: "file:///local_cache/capture.jpg",
        barcode: "8901030000001",
        pdpArea: 180.0,
      });
      setPendingCount(offlineQueue.getPendingCount());
      Alert.alert(
        "Offline Mode Active",
        "Connection offline or unreachable. Inspection successfully stored in encrypted local queue."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HUD Camera Frame Simulation */}
      <View style={styles.cameraBox}>
        <View style={styles.reticleFrame}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <View style={styles.barcodeGuide}>
            <Text style={styles.guideText}>ALIGN BARCODE (EAN-13)</Text>
          </View>
        </View>

        <View style={styles.overlayBar}>
          <View style={styles.pill}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isStable ? "#10b981" : "#ef4444" },
              ]}
            />
            <Text style={styles.pillText}>
              {isStable ? "STABLE (CALIBRATION READY)" : "MOTION DETECTED"}
            </Text>
          </View>

          {pendingCount > 0 && (
            <TouchableOpacity
              style={styles.offlineBadge}
              onPress={() => navigation.navigate("OfflineQueue")}
            >
              <Text style={styles.offlineText}>{pendingCount} QUEUED</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <Text style={styles.instText}>
          Optical Ruler: EAN-13 nominal 37.29mm scale calibration
        </Text>

        <TouchableOpacity
          style={[styles.captureBtn, (!isStable || uploading) && styles.captureBtnDisabled]}
          onPress={handleCapture}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.captureInnerCircle} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  cameraBox: {
    flex: 3,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  reticleFrame: {
    width: 280,
    height: 380,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#38bdf8",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#38bdf8",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#38bdf8",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#38bdf8",
  },
  barcodeGuide: {
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    borderStyle: "dashed",
    width: 220,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  guideText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  overlayBar: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pillText: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "600",
  },
  offlineBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offlineText: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "bold",
  },
  controlPanel: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  instText: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  captureBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnDisabled: {
    opacity: 0.4,
  },
  captureInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#ffffff",
  },
});
