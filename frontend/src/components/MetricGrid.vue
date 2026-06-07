<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { KpiItem } from "../types";
import { updateKpiTarget } from "../api/client";

const props = defineProps<{ items: KpiItem[] }>();
const emit = defineEmits<{ (e: "target-updated"): void }>();

const targetDialogVisible = ref(false);
const editingItem = ref<KpiItem | null>(null);
const targetValue = ref("");

function parseNumericValue(value: string): number {
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

function getProgress(item: KpiItem): number {
  if (!item.monthlyTarget) return 0;
  const current = parseNumericValue(item.value);
  const progress = (current / item.monthlyTarget) * 100;
  return Math.min(progress, 100);
}

function isLowProgress(item: KpiItem): boolean {
  return getProgress(item) < 80;
}

function formatProgress(item: KpiItem): string {
  return getProgress(item).toFixed(1);
}

function openTargetDialog(item: KpiItem) {
  editingItem.value = item;
  targetValue.value = item.monthlyTarget?.toString() || "";
  targetDialogVisible.value = true;
}

async function saveTarget() {
  if (!editingItem.value || !targetValue.value) return;

  const target = parseInt(targetValue.value);
  if (isNaN(target) || target <= 0) {
    ElMessage.warning("请输入有效的目标值");
    return;
  }

  try {
    const result = await updateKpiTarget(editingItem.value.label, target);
    if (result.success) {
      ElMessage.success(result.message);
      targetDialogVisible.value = false;
      emit("target-updated");
    } else {
      ElMessage.error(result.message);
    }
  } catch {
    editingItem.value.monthlyTarget = target;
    ElMessage.success("目标已更新（本地）");
    targetDialogVisible.value = false;
  }
}

const toneColors: Record<string, string> = {
  primary: "#3268b8",
  warm: "#cf5c36",
  cool: "#2a9d8f",
  neutral: "#6b7280",
};

function getProgressColor(item: KpiItem): string {
  if (isLowProgress(item)) {
    return "#e63946";
  }
  return toneColors[item.tone] || "#3268b8";
}
</script>

<template>
  <section class="metric-grid" aria-label="关键指标">
    <article v-for="item in items" :key="item.label" class="metric-card" :class="{ 'card-low': isLowProgress(item) }">
      <div class="card-header">
        <span>{{ item.label }}</span>
        <button class="target-setting-btn" @click.stop="openTargetDialog(item)" title="设置月度目标">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.5a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.5a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.5a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.5a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>
      <div class="metric-main">
        <strong class="metric-value" :style="{ color: toneColors[item.tone] }">{{ item.value }}</strong>
        <div class="metric-trend" :class="item.tone">{{ item.trend }}</div>
      </div>
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">月度目标达成</span>
          <span class="progress-value" :class="{ 'text-warning': isLowProgress(item) }">
            {{ formatProgress(item) }}%
          </span>
        </div>
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill"
            :style="{
              width: `${getProgress(item)}%`,
              background: getProgressColor(item)
            }"
          ></div>
        </div>
        <div class="progress-target">
          <span>目标: {{ item.monthlyTarget || "-" }}</span>
        </div>
      </div>
    </article>
  </section>

  <el-dialog
    v-model="targetDialogVisible" title="设置月度目标" width="400px" :close-on-click-modal="false">
    <div v-if="editingItem" class="target-dialog-content">
      <div class="target-info">
      <div class="target-info-label">{{ editingItem.label }}</div>
      <div class="target-info-value">当前值: {{ editingItem.value }}</div>
    </div>
    <div class="target-input-group">
      <label class="target-input-label">月度目标值</label>
      <el-input
        v-model="targetValue"
        type="number"
        placeholder="请输入目标值"
        min="1"
        @keyup.enter="saveTarget"
      />
      <div class="target-input-hint">
        {{ editingItem.label === "履约率" ? "建议设置 80-100 之间" : "请输入合理的月度目标数值" }}
      </div>
    </div>
  </div>
  <template #footer>
    <el-button @click="targetDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="saveTarget">确认</el-button>
  </template>
</el-dialog>
</template>

<style scoped>
.metric-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;
}

.card-low {
  border-color: color-mix(in srgb, #e63946 40%, transparent) !important;
  box-shadow: 0 18px 50px color-mix(in srgb, #e63946 12%, transparent) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: color-mix(in srgb, #19212e 70%, transparent);
}

.target-setting-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: color-mix(in srgb, #19212e 40%, transparent);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.target-setting-btn:hover {
  background: color-mix(in srgb, #3268b8 12%, transparent);
  color: #3268b8;
}

.metric-main {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.metric-trend {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.metric-trend.primary {
  color: #3268b8;
}

.metric-trend.warm {
  color: #cf5c36;
}

.metric-trend.cool {
  color: #2a9d8f;
}

.metric-trend.neutral {
  color: #6b7280;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, #19212e 8%, transparent);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.progress-label {
  color: color-mix(in srgb, #19212e 60%, transparent);
}

.progress-value {
  font-weight: 700;
  color: #19212e;
}

.progress-value.text-warning {
  color: #e63946;
}

.progress-bar-track {
  height: 8px;
  background: color-mix(in srgb, #19212e 8%, transparent);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease, background 0.3s ease;
}

.progress-target {
  font-size: 11px;
  color: color-mix(in srgb, #19212e 50%, transparent);
}

.target-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.target-info {
  padding: 16px;
  background: color-mix(in srgb, #3268b8 8%, transparent);
  border-radius: 8px;
}

.target-info-label {
  font-size: 16px;
  font-weight: 700;
  color: #19212e;
  margin-bottom: 8px;
}

.target-info-value {
  font-size: 14px;
  color: color-mix(in srgb, #19212e 70%, transparent);
}

.target-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.target-input-label {
  font-size: 14px;
  font-weight: 600;
  color: #19212e;
}

.target-input-hint {
  font-size: 12px;
  color: color-mix(in srgb, #19212e 50%, transparent);
}
</style>
