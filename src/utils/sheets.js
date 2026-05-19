// 구글시트 연동
// 작은 데이터: Vercel Function 경유 (CORS 안전)
// 큰 데이터 (Excel 업로드): Apps Script 직접 호출 (용량 제한 우회)

import { APP_CONFIG } from '../constants/config';

const VERCEL_API = '/api/submit';

// Apps Script URL 직접 가져오기 (config에서)
const getDirectUrl = () => {
  return APP_CONFIG.APPS_SCRIPT_URL || '';
};

// === 레포트 데이터 업로드 (작은 데이터, Vercel 경유) ===
export const uploadReport = async (report) => {
  const res = await fetch(VERCEL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upload', report }),
  });
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '업로드 실패');
  return data;
};

// === Excel 파일을 구글드라이브에 업로드 (큰 데이터, Apps Script 직접) ===
export const uploadExcelToDrive = async (report, excelBlob) => {
  const directUrl = getDirectUrl();
  if (!directUrl) throw new Error('Apps Script URL이 설정되지 않았습니다');

  // Blob → Base64
  const base64 = await blobToBase64(excelBlob);
  const fileName = `${report.id}.xlsx`;

  // Apps Script 직접 호출 (text/plain → preflight 회피)
  const res = await fetch(directUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'upload-excel',
      report: { id: report.id },
      excelBase64: base64,
      fileName,
    }),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Excel 업로드 실패');
  return data;
};

// === 대시보드 데이터 (Vercel 경유) ===
export const fetchDashboard = async () => {
  const res = await fetch(`${VERCEL_API}?action=dashboard`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '조회 실패');
  return data;
};

// Blob → Base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// 하위 호환
export const fetchReports = async () => {
  const res = await fetch(`${VERCEL_API}?action=list`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '조회 실패');
  return data.reports || [];
};
export const getAppsScriptUrl = () => VERCEL_API;
export const setAppsScriptUrl = () => {};
