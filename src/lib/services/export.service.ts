import { api } from "@/lib/axios";
import { ENDPOINTS, path } from "@/constants/api";

export type ExportType = "ALL_RECORDS" | "DRAFT" | "SUBMITTED" | "APPROVED";

export type ExportRoute =
  | { kind: "all"; exportType: ExportType; recyclerId?: string }
  | { kind: "allBatches"; exportType: ExportType; recyclerId?: string }
  | { kind: "draft"; recyclerId?: string }
  | { kind: "submitted"; recyclerId?: string }
  | { kind: "approved"; recyclerId?: string }
  | { kind: "byBatch"; batchId: string; exportType: ExportType; recyclerId?: string }
  | {
      kind: "dateRange";
      startDate: string; // yyyy-mm-dd from <input type="date">
      endDate: string; // yyyy-mm-dd
      exportType: ExportType;
      recyclerId?: string;
    };

function parseFilenameFromContentDisposition(headerValue?: string): string | null {
  if (!headerValue) return null;
  // e.g. attachment; filename="export.xlsx"
  const match = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(headerValue);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export const ExportService = {
  async exportRecords(route: ExportRoute): Promise<{ filename: string; recordCount?: number }> {
    let endpoint: string;
    const params: Record<string, string> = {};

    if ("recyclerId" in route && route.recyclerId) {
      params.recyclerId = route.recyclerId;
    }

    switch (route.kind) {
      case "draft":
        endpoint = ENDPOINTS.EXPORTS.DRAFT;
        break;
      case "submitted":
        endpoint = ENDPOINTS.EXPORTS.SUBMITTED;
        break;
      case "approved":
        endpoint = ENDPOINTS.EXPORTS.APPROVED;
        break;
      case "byBatch":
        endpoint = ENDPOINTS.EXPORTS.BY_BATCH(route.batchId);
        params.exportType = route.exportType;
        break;
      case "dateRange":
        endpoint = ENDPOINTS.EXPORTS.DATE_RANGE;
        params.startDate = route.startDate;
        params.endDate = route.endDate;
        params.exportType = route.exportType;
        break;
      case "allBatches":
        endpoint = ENDPOINTS.EXPORTS.ALL_BATCHES;
        params.exportType = route.exportType;
        break;
      case "all":
      default:
        endpoint = ENDPOINTS.EXPORTS.RECORDS;
        params.exportType = route.exportType;
        break;
    }

    const res = await api.get(path.exports(endpoint), {
      params,
      responseType: "arraybuffer",
    });

    const contentType =
      (res.headers?.["content-type"] as string | undefined) ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const filename =
      parseFilenameFromContentDisposition(res.headers?.["content-disposition"] as string | undefined) ||
      "export.xlsx";

    const recordCountHeader = res.headers?.["x-record-count"] as string | undefined;
    const recordCount =
      recordCountHeader && !Number.isNaN(Number(recordCountHeader))
        ? Number(recordCountHeader)
        : undefined;

    const blob = new Blob([res.data], { type: contentType });
    downloadBlob(blob, filename);

    return { filename, recordCount };
  },

  exportAllBatchesMultiSheet(params: {
    exportType: ExportType;
    recyclerId?: string;
  }): Promise<{ filename: string; recordCount?: number }> {
    return this.exportRecords({
      kind: "allBatches",
      exportType: params.exportType,
      recyclerId: params.recyclerId,
    });
  },
};

