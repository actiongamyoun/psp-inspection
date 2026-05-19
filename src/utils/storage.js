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
// 소속별 영문 코드
const AFFILIATION_CODES = {
  QM: 'QM',
  SHINWHA: 'SW',     // 신화테크
  HANIL: 'HI',       // 한일철강
  JEILTECH: 'JT',    // 제일테크노스
  HANLA: 'HL',       // 한라티씨
};

export const getAffiliationCode = (affId) => AFFILIATION_CODES[affId] || 'XX';

export const generateReportId = (affId) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const code = getAffiliationCode(affId);
  const prefix = `HHI-${yyyy}-${mm}${dd}-${code}`;
  
  const reports = getAllReports();
  const today = reports.filter(r => r.id.startsWith(prefix));
  const nextNum = String(today.length + 1).padStart(3, '0');
  
  return `${prefix}-${nextNum}`;
};
