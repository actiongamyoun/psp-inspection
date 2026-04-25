// localStorage 기반 레포트 저장/조회
const STORAGE_KEY = 'psp_reports';

export const getAllReports = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load reports', e);
    return [];
  }
};

export const getReportById = (id) => {
  const reports = getAllReports();
  return reports.find(r => r.id === id);
};

export const saveReport = (report) => {
  const reports = getAllReports();
  const idx = reports.findIndex(r => r.id === report.id);
  const now = new Date().toISOString();
  
  if (idx >= 0) {
    reports[idx] = { ...report, updatedAt: now };
  } else {
    reports.push({ ...report, createdAt: report.createdAt || now, updatedAt: now });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  return report;
};

export const deleteReport = (id) => {
  const reports = getAllReports();
  const filtered = reports.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

// 레포트 번호 자동 생성 (HHI-YYYY-MMDD-NNN)
export const generateReportId = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `HHI-${yyyy}-${mm}${dd}`;
  
  const reports = getAllReports();
  const today = reports.filter(r => r.id.startsWith(prefix));
  const nextNum = String(today.length + 1).padStart(3, '0');
  
  return `${prefix}-${nextNum}`;
};
