export const DEMO_MODE_STORAGE_KEY = "refundly-demo-mode";

export function getDemoModeEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function setDemoModeEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(enabled));
}
