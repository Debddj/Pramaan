// React Native Expo Mobile Field Client
// Features targeting HUD reticle, accelerometer-assisted motion guard, and barcode lock

export const CaptureScreenConfig = {
  reticleGuide: "Align EAN-13 barcode inside blue HUD bracket",
  motionGuardThreshold: 0.15, // Max accelerometer jitter before capture unlocks
  offlineQueueKey: "@pramaan_offline_scans"
};
