// 구글시트 연동
// 앱 → /api/submit (Vercel Function) → Apps Script → 구글시트
// Vercel Function이 CORS 처리해줘서 모바일도 정상 동작

const API_URL = '/api/submit';

// 레포트 업로드
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

// 레포트 목록 조회
export const fetchReports = async () => {
  const res = await fetch(`${API_URL}?action=list`);
  if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || '조회 실패');

  return data.reports || [];
};

// 하위 호환용 (관리자 모드에서 사용)
export const getAppsScriptUrl = () => API_URL;
export const setAppsScriptUrl = () => {}; // Vercel Function 사용으로 불필요
