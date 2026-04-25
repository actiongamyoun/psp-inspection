// 검사 항목 표준값 정의 + 자동판정 로직
// 단위는 표시용, 값은 숫자/문자열로 입력

export const STANDARDS = {
  // === 표면처리 (Surface Preparation) ===
  workSpeed: {
    label: '작업속도',
    labelEn: 'Work Speed',
    unit: 'm/min',
    standard: '4.8',
    type: 'numeric_target', // 정확히 일치 또는 ± 허용
    target: 4.8,
    tolerance: 0.5, // ±0.5
    section: 'surfacePrep',
  },
  heatingState: {
    label: '예열상태',
    labelEn: 'Heating State',
    unit: '',
    standard: '-',
    type: 'manual_select',
    options: ['가동', '미가동'],
    section: 'surfacePrep',
  },
  dust: {
    label: '표면오염',
    labelEn: 'Dust',
    unit: '',
    standard: 'Rating 1',
    type: 'rating_1to5', // Rating 1 = 만족, 2~5 = 불만족
    passRating: 1,
    section: 'surfacePrep',
  },
  millScale: {
    label: 'Mill Scale',
    labelEn: 'Existing Mill Scale',
    unit: '',
    standard: 'Sa 2½',
    type: 'manual_pass_fail',
    section: 'surfacePrep',
  },
  profile: {
    label: '표면조도',
    labelEn: 'Profile',
    unit: '㎛',
    standard: '30 ~ 75',
    type: 'numeric_range',
    min: 30,
    max: 75,
    section: 'surfacePrep',
  },
  dft: {
    label: '측정건도막두께(평균)',
    labelEn: 'D.F.T (Avg)',
    unit: '㎛',
    standard: '8 ± 2',
    type: 'numeric_target',
    target: 8,
    tolerance: 2,
    section: 'surfacePrep',
  },
  waterSolubleSalts: {
    label: '염분도',
    labelEn: 'Water Soluble Salts',
    unit: 'mg/㎡',
    standard: '≤ 50',
    type: 'numeric_max',
    max: 50,
    section: 'surfacePrep',
  },

  // === 연마재 ===
  abrasivesConductivity: {
    label: '연마재 전기전도도',
    labelEn: 'Abrasives Conductivity',
    unit: 'uS/cm',
    standard: '≤ 250',
    type: 'numeric_max',
    max: 250,
    section: 'abrasives',
  },

  // === 환경 조건 ===
  dryBulb: {
    label: '건구온도',
    labelEn: 'Dry Bulb',
    unit: '℃',
    standard: '-',
    type: 'numeric_input', // 판정 없음, 자동계산 입력값
    section: 'environmental',
  },
  wetBulb: {
    label: '습구온도',
    labelEn: 'Wet Bulb',
    unit: '℃',
    standard: '-',
    type: 'numeric_input',
    section: 'environmental',
  },
  relHumidity: {
    label: '상대습도',
    labelEn: 'Relative Humidity',
    unit: '%',
    standard: '< 85',
    type: 'numeric_max_calculated',
    max: 85,
    section: 'environmental',
  },
  dewPoint: {
    label: '이슬점',
    labelEn: 'Dew Point',
    unit: '℃',
    standard: '-',
    type: 'numeric_calculated',
    section: 'environmental',
  },
  surfaceTemp: {
    label: '철판온도',
    labelEn: 'Surface Temp.',
    unit: '℃',
    standard: '> 이슬점 + 3℃',
    type: 'numeric_dewpoint_check', // dewPoint + 3 보다 커야 만족
    section: 'environmental',
  },

  // === 기타 사항 ===
  facilityManagement: {
    label: '공장설비관리',
    labelEn: 'Facility Management',
    unit: '',
    standard: '-',
    type: 'manual_pass_fail',
    section: 'others',
  },
  materialManagement: {
    label: '자재관리',
    labelEn: 'Material Management',
    unit: '',
    standard: '-',
    type: 'manual_pass_fail',
    section: 'others',
  },
  paintManagement: {
    label: '도료관리',
    labelEn: 'Paint Management',
    unit: '',
    standard: '-',
    type: 'manual_pass_fail',
    section: 'others',
  },
  reportManagement: {
    label: '전처리 일지 기록',
    labelEn: 'Report',
    unit: '',
    standard: '-',
    type: 'manual_pass_fail',
    section: 'others',
  },
  mekTest: {
    label: '도료 경화 상태 (MEK Test)',
    labelEn: 'MEK Test',
    unit: '',
    standard: '≥ Rating 4',
    type: 'manual_pass_fail',
    section: 'others',
  },
};

// 섹션별 항목 목록
export const SECTION_ITEMS = {
  surfacePrep: ['workSpeed', 'heatingState', 'dust', 'millScale', 'profile', 'dft', 'waterSolubleSalts'],
  abrasives: ['abrasivesConductivity'],
  environmental: ['dryBulb', 'wetBulb', 'relHumidity', 'dewPoint', 'surfaceTemp'],
  others: ['facilityManagement', 'materialManagement', 'paintManagement', 'reportManagement', 'mekTest'],
};

// 사진 항목
export const PHOTO_SECTIONS = [
  { key: 'surfaceProfile', label: '표면조도', en: 'Surface Profile', max: 3 },
  { key: 'dust', label: '표면오염', en: 'Dust', max: 3 },
  { key: 'salts', label: '염분도', en: 'Water Soluble Salts', max: 3 },
  { key: 'conductivity', label: '연마재 전기전도도', en: 'Abrasives Conductivity', max: 3 },
  { key: 'dft', label: 'D.F.T', en: 'D.F.T', max: 3 },
  { key: 'beforeTreatment', label: '전처리 전 강재', en: 'Before Surface Treatment', max: 3 },
  { key: 'afterTreatment', label: '전처리 후 강재', en: 'After Surface Treatment', max: 3 },
  { key: 'shopprimer', label: 'Shopprimer', en: 'Shopprimer', max: 3 },
];

// 자동 판정 함수
export const judgeAuto = (key, value, allValues = {}) => {
  const std = STANDARDS[key];
  if (!std || value === '' || value === null || value === undefined) {
    return { result: null, auto: false };
  }
  
  const num = parseFloat(value);
  
  switch (std.type) {
    case 'numeric_range':
      if (isNaN(num)) return { result: null, auto: false };
      return {
        result: num >= std.min && num <= std.max ? '만족' : '불만족',
        auto: true,
        message: num < std.min ? `최소 ${std.min}${std.unit} 미만` : 
                 num > std.max ? `최대 ${std.max}${std.unit} 초과` : null,
      };
      
    case 'numeric_target':
      if (isNaN(num)) return { result: null, auto: false };
      return {
        result: Math.abs(num - std.target) <= std.tolerance ? '만족' : '불만족',
        auto: true,
        message: Math.abs(num - std.target) > std.tolerance ? 
          `목표 ${std.target} ± ${std.tolerance} 벗어남` : null,
      };
      
    case 'numeric_max':
    case 'numeric_max_calculated':
      if (isNaN(num)) return { result: null, auto: false };
      return {
        result: num <= std.max ? '만족' : '불만족',
        auto: true,
        message: num > std.max ? `최대 ${std.max}${std.unit} 초과` : null,
      };
      
    case 'numeric_dewpoint_check': {
      const dp = parseFloat(allValues.dewPoint);
      if (isNaN(num) || isNaN(dp)) return { result: null, auto: false };
      return {
        result: num > dp + 3 ? '만족' : '불만족',
        auto: true,
        message: num <= dp + 3 ? `이슬점+3℃(${(dp + 3).toFixed(1)}℃) 미달` : null,
      };
    }
    
    case 'rating_1to5': {
      const rating = parseInt(value);
      if (isNaN(rating)) return { result: null, auto: false };
      return {
        result: rating <= (std.passRating || 1) ? '만족' : '불만족',
        auto: false,
        ratingValue: rating,
      };
    }

    case 'manual_pass_fail':
    case 'manual_select':
      // 수동 선택은 value가 곧 결과
      if (std.type === 'manual_pass_fail') {
        return { result: value, auto: false };
      }
      return { result: value ? '만족' : null, auto: false };
      
    default:
      return { result: null, auto: false };
  }
};

// Magnus 공식: 건구+습구 → 상대습도 + 이슬점 계산
// 입력: TDB (건구온도, ℃), TWB (습구온도, ℃)
// 출력: { rh: 상대습도(%), dp: 이슬점(℃) }
export const calcHumidity = (tdb, twb) => {
  const TDB = parseFloat(tdb);
  const TWB = parseFloat(twb);
  
  if (isNaN(TDB) || isNaN(TWB)) return { rh: null, dp: null };
  
  // Magnus 상수
  const a = 17.625;
  const b = 243.04;
  
  // 포화수증기압 (hPa)
  const es_db = 6.112 * Math.exp((a * TDB) / (b + TDB));
  const es_wb = 6.112 * Math.exp((a * TWB) / (b + TWB));
  
  // 실제수증기압 (psychrometric eq, 대기압 1013.25 hPa)
  const P = 1013.25;
  const e = es_wb - 0.000662 * P * (TDB - TWB);
  
  // 상대습도
  let rh = (e / es_db) * 100;
  if (rh < 0) rh = 0;
  if (rh > 100) rh = 100;
  
  // 이슬점 (Magnus 역산)
  const ln = Math.log(e / 6.112);
  const dp = (b * ln) / (a - ln);
  
  return {
    rh: Math.round(rh * 10) / 10,
    dp: Math.round(dp * 10) / 10,
  };
};
