"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Checks whether the user has at least one connected drive (Google or OneDrive).
 * Shared by the sidebar and topbar so the status-fetch logic lives in one place.
 *
 * @param deps  re-run the check whenever these change (keep the length constant).
 */
export function useConnectionStatus(deps: unknown[] = []) {
  const [isConnected, setIsConnected] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      const [googleRes, onedriveRes] = await Promise.all([
        fetch("/api/googleDrive/auth/status", { credentials: "include" }),
        fetch("/api/onedrive/auth/status", { credentials: "include" }),
      ]);

      let googleConnected = false;
      let onedriveConnected = false;

      if (googleRes.ok) {
        const data = await googleRes.json();
        googleConnected = data.connected && data.accountsCount > 0;
      }

      if (onedriveRes.ok) {
        const data = await onedriveRes.json();
        onedriveConnected = data.connected && data.accountsCount > 0;
      }

      setIsConnected(googleConnected || onedriveConnected);
    } catch (error) {
      console.error("Connection check failed:", error);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { isConnected, statusLoading, recheck: checkConnection };
}
