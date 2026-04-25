// 소속 목록
export const AFFILIATIONS = [
  { id: 'QM', name: 'QM', type: 'qm', color: '#1B6B3A' },
  { id: 'SHINWHA', name: '신화테크', type: 'partner', color: '#2E7D32' },
  { id: 'HANIL', name: '한일철강', type: 'partner', color: '#2E7D32' },
  { id: 'JEILTECH', name: '제일테크노스', subtitle: '광양', type: 'partner', color: '#2E7D32' },
  { id: 'HANLA', name: '한라티씨', type: 'partner', color: '#2E7D32' },
];

export const getAffiliation = (id) => AFFILIATIONS.find(a => a.id === id);
