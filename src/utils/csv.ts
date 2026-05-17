/** CSV 工具:导出带 UTF-8 BOM 的 CSV(Excel 中文不乱码) */

function escapeCell(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCell).join(',')];
  for (const r of rows) lines.push(r.map(escapeCell).join(','));
  return lines.join('\r\n');
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = toCSV(headers, rows);
  // UTF-8 BOM
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
