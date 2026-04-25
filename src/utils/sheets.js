import { APP_CONFIG } from '../constants/config';

// Apps Script URL 가져오기 (런타임 변경 가능)
export const getAppsScriptUrl = () => {
  return localStorage.getItem('psp_apps_script_url') || APP_CONFIG.APPS_SCRIPT_URL || '';
};

export const setAppsScriptUrl = (url) => {
  localStorage.setItem('psp_apps_script_url', url || '');
};

// 레포트를 Google Sheet에 업로드
export const uploadReport = async (report) => {
  const url = getAppsScriptUrl();
  if (!url) {
    throw new Error('Apps Script URL이 설정되지 않았습니다. 관리자 모드에서 URL을 등록하세요.');
  }
  
  // Apps Script는 CORS 이슈를 피하기 위해 text/plain으로 보내고 서버에서 JSON 파싱
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'upload', report }),
  });
  
  if (!res.ok) {
    throw new Error(`Apps Script 응답 오류: ${res.status}`);
  }
  
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.error || '업로드 실패');
  }
  
  return data;
};

// 레포트 목록 조회 (옵션)
export const fetchReports = async () => {
  const url = getAppsScriptUrl();
  if (!url) throw new Error('Apps Script URL이 설정되지 않았습니다.');
  
  const res = await fetch(url + '?action=list');
  if (!res.ok) throw new Error(`응답 오류: ${res.status}`);
  
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '조회 실패');
  
  return data.reports || [];
};
