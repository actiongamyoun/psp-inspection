// 검사위치 - 소속별 고정값 (로컬 저장 없이 코드로 관리)

// QM이 선택 가능한 전체 위치 목록
export const QM_LOCATIONS = [
  '신화테크 1호기',
  '신화테크 2호기',
  '한일철강',
  '제일테크노스 (광양)',
  '한라티씨',
  'HHI-1YD-1HO',
  'HHI-1YD-2HO',
  'HHI-1YD-3HO',
  'HHI-2YD-1HO',
  'HHI-2YD-2HO',
];

// 파트너별 위치 설정
// type: 'select' → 선택 필요 (버튼), 'fixed' → 자동 고정
export const PARTNER_LOCATIONS = {
  SHINWHA: {
    type: 'select',
    options: ['신화테크 1호기', '신화테크 2호기'],
  },
  HANIL: {
    type: 'fixed',
    value: '한일철강',
  },
  JEILTECH: {
    type: 'fixed',
    value: '제일테크노스 (광양)',
  },
  HANLA: {
    type: 'fixed',
    value: '한라티씨',
  },
};

// 소속 ID로 위치 설정 가져오기
export const getLocationConfig = (affiliationId) => {
  if (affiliationId === 'QM') {
    return { type: 'dropdown', options: QM_LOCATIONS };
  }
  return PARTNER_LOCATIONS[affiliationId] || { type: 'fixed', value: '' };
};
