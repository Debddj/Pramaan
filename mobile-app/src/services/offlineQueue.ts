import { api } from "./api";

export interface QueuedScan {
  id: string;
  imageUri: string;
  barcode?: string;
  pdpArea?: number;
  timestamp: string;
  status: "pending" | "uploading" | "failed" | "synced";
  error?: string;
}

let queue: QueuedScan[] = [];

export const offlineQueue = {
  getQueue: (): QueuedScan[] => [...queue],

  enqueue: (item: Omit<QueuedScan, "id" | "timestamp" | "status">): QueuedScan => {
    const record: QueuedScan = {
      ...item,
      id: `OFFLINE-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: "pending",
    };
    queue.push(record);
    return record;
  },

  getPendingCount: (): number => {
    return queue.filter((i) => i.status === "pending" || i.status === "failed").length;
  },

  syncAll: async (onProgress?: (synced: number, total: number) => void): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;
    const pending = queue.filter((i) => i.status === "pending" || i.status === "failed");

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      item.status = "uploading";
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: item.imageUri,
          type: "image/jpeg",
          name: "inspection.jpg",
        } as any);
        if (item.barcode) formData.append("barcode", item.barcode);
        if (item.pdpArea) formData.append("pdp_area_sq_cm", String(item.pdpArea));

        await api.uploadScan(formData);
        item.status = "synced";
        success++;
      } catch (err: any) {
        item.status = "failed";
        item.error = err.message || "Upload failed";
        failed++;
      }
      if (onProgress) onProgress(i + 1, pending.length);
    }
    return { success, failed };
  },

  clearSynced: () => {
    queue = queue.filter((i) => i.status !== "synced");
  },
};
