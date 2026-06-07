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
  try {
    const response = await fetch(`${API_BASE_URL}/kpi/target`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, monthlyTarget }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        if (response.status === 404) errorMessage = "接口不存在";
        else if (response.status === 500) errorMessage = "服务器内部错误";
        else if (response.status === 0) errorMessage = "网络连接失败";
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<{ success: boolean; message: string }>;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        throw new Error("无法连接到服务器，请检查后端服务是否启动");
      }
      throw error;
    }
    throw new Error("保存失败，未知错误");
  }
}
