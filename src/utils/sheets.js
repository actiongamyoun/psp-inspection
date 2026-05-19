// 구글시트 연동
// 앱 → /api/submit (Vercel Function) → Apps Script → 구글시트/드라이브

const API_URL = '/api/submit';

// 레포트 데이터 업로드
export const uploadReport = async (report) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upload', report }),
  });
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '업로드 실패');
  return data;
};

// Excel 파일을 구글드라이브에 업로드
// excelBlob: Blob 객체
export const uploadExcelToDrive = async (report, excelBlob) => {
  // Blob → Base64
  const base64 = await blobToBase64(excelBlob);
  const fileName = `${report.id}.xlsx`;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upload-excel',
      report: {
        id: report.id,
      },
      excelBase64: base64,
      fileName,
    }),
  });
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Excel 업로드 실패');
  return data;
};

// 대시보드 데이터 조회
export const fetchDashboard = async () => {
  const res = await fetch(`${API_URL}?action=dashboard`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '조회 실패');
  return data;
};

// Blob → Base64 변환
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // result: "data:...;base64,XXX..."
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// 하위 호환
export const fetchReports = async () => {
  const res = await fetch(`${API_URL}?action=list`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '조회 실패');
  return data.reports || [];
};
export const getAppsScriptUrl = () => API_URL;
export const setAppsScriptUrl = () => {};
