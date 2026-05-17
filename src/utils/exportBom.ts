import { useStore } from '@/store/useStore';
import { downloadCSV } from './csv';
import { computeBOM, bomTotalMass } from './bom';
import { toast } from '@/ui/Toast';

/** 触发当前构件 BOM 的 CSV 下载,并提示 Toast */
export function exportCurrentBOM() {
  const s = useStore.getState();
  const rows = computeBOM(s.kind, s.beam, s.column, s.wall);
  if (rows.length === 0) {
    toast.warn('当前构件无钢筋数据');
    return;
  }
  const headers = ['编号', '类型', '规格', '直径(mm)', '长度(mm)', '数量', '单重(kg)', '总重(kg)'];
  const data = rows.map((r) => [
    r.mark,
    r.role,
    r.grade,
    r.d,
    r.length,
    r.count,
    r.mass.toFixed(3),
    (r.mass * r.count).toFixed(3),
  ]);
  // 合计行
  const total = bomTotalMass(rows);
  data.push(['合计', '', '', '', '', '', '', total.toFixed(3)]);

  const id = s.kind === 'beam' ? s.beam.id : s.kind === 'column' ? s.column.id : s.wall.id;
  const ts = new Date().toISOString().slice(0, 10);
  downloadCSV(`${id}_BOM_${ts}.csv`, headers, data);
  toast.success(`已导出 ${rows.length} 项明细`);
}
