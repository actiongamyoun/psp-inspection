// 앱 설정
export const APP_CONFIG = {
  APP_NAME: 'PSP REPORT',
  APP_SUBTITLE: 'Primary Surface Preparation',
  ADMIN_PIN: 'admin0000',
  
  // Google Apps Script Web App URL (배포 후 여기에 입력)
  APPS_SCRIPT_URL: '',
  
  REPORT_PREFIX: 'HHI',
};

// === 소속 ===
export const getCurrentAffiliation = () => {
  return localStorage.getItem('psp_affiliation') || '';
};

export const setCurrentAffiliation = (id) => {
  localStorage.setItem('psp_affiliation', id);
};

export const clearCurrentAffiliation = () => {
  localStorage.removeItem('psp_affiliation');
  // 이름은 유지 (다음 로그인 시 자동 채움)
};

// === 검사자 이름 ===
export const getInspectorName = () => {
  return localStorage.getItem('psp_inspector_name') || '';
};

export const setInspectorName = (name) => {
  localStorage.setItem('psp_inspector_name', name);
};

// === 로그인 완료 여부 ===
export const isLoggedIn = () => {
  return !!getCurrentAffiliation() && !!getInspectorName();
};
