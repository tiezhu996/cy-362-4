import { API_BASE_URL } from "../constants/app";
import type { OverviewResponse } from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function updateKpiTarget(label: string, monthlyTarget: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/kpi/target`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, monthlyTarget }),
  });

  if (!response.ok) {
    throw new Error(`Update KPI target failed: ${response.status}`);
  }

  return response.json() as Promise<{ success: boolean; message: string }>;
}
