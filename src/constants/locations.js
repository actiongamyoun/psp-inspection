// 기본 검사 위치 (관리자가 추가/삭제 가능)
const DEFAULT_LOCATIONS = [
  '신화테크 1공장',
  '신화테크 2공장',
  '한일철강',
  '제일테크노스 (광양)',
  'HHI-1YD',
  'HHI-2YD',
];

const STORAGE_KEY = 'psp_locations';

export const getLocations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [...DEFAULT_LOCATIONS];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_LOCATIONS];
  } catch (e) {
    return [...DEFAULT_LOCATIONS];
  }
};

export const saveLocations = (locations) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
};

export const addLocation = (name) => {
  const trimmed = name.trim();
  if (!trimmed) return false;
  const list = getLocations();
  if (list.includes(trimmed)) return false;
  list.push(trimmed);
  saveLocations(list);
  return true;
};

export const removeLocation = (name) => {
  const list = getLocations().filter(l => l !== name);
  saveLocations(list);
};

export const resetLocations = () => {
  saveLocations([...DEFAULT_LOCATIONS]);
};
