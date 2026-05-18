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
    standard: 'ISO 8502-3: 입자크기 ≤ 2등급, 먼지양 ≤ 2등급',
    type: 'iso_dust',
    section: 'surfacePrep',
    iso: 'ISO 8502-3',
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
  { key: 'surfaceProfile', label: '표면조도', en: 'Surface Profile', max: 2 },
  { key: 'dust', label: '표면오염', en: 'Dust', max: 2 },
  { key: 'salts', label: '염분도', en: 'Water Soluble Salts', max: 2 },
  { key: 'conductivity', label: '연마재 전기전도도', en: 'Abrasives Conductivity', max: 2 },
  { key: 'dft', label: 'D.F.T', en: 'D.F.T', max: 2 },
  { key: 'beforeTreatment', label: '전처리 전 강재', en: 'Before Surface Treatment', max: 2 },
  { key: 'afterTreatment', label: '파이널 컨디션', en: 'Final Condition', max: 2 },
  { key: 'shopprimer', label: '도료 & Batch', en: 'Paint & Batch', max: 2 },
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

// =====================================================
// ISO / ASTM 측정 프로시저 정보
// =====================================================
export const ISO_PROCEDURES = {
  workSpeed: {
    standard: '-',
    title: '작업속도 (Work Speed)',
    procedure: '블라스팅 작업 시 강판 이송 속도를 측정합니다.\n기준값: 4.8 m/min\n측정 방법: 작업 전 설비 속도계 확인 및 기록',
  },
  heatingState: {
    standard: '-',
    title: '예열상태 (Heating State)',
    procedure: '블라스팅 전 강판 예열 여부를 확인합니다.\n점검 당일 Pre-Heating 준수 여부 확인\n상부: 320℃, 하부: 122℃ 기준',
  },
  dust: {
    standard: 'ISO 8502-3',
    title: '표면오염 - 먼지 평가 (Dust Assessment)',
    procedure: `ISO 8502-3: 도장 전 강재 표면의 먼지 평가

【입자 크기 등급 (Dust Size Class)】
0등급: 10배 확대경으로 보이지 않음
1등급: 10배 확대경으로만 보임 (≤50μm)
2등급: 육안으로 보임 (50~100μm)
3등급: 0.5mm 이하
4등급: 0.5~2.5mm
5등급: 2.5mm 초과

【먼지 양 등급 (Dust Quantity Rating)】
1등급: 거의 없음 (합격 기준)
2등급: 약간 있음
3등급: 중간
4등급: 많음
5등급: 매우 많음

【판정 기준】
입자크기 ≤ 2등급 AND 먼지양 ≤ 2등급 → 합격
Dust Tape test 사용: 테이프를 표면에 붙였다 떼어 평가지에 붙여 비교`,
  },
  millScale: {
    standard: 'ISO 8501-1',
    title: 'Mill Scale 제거 등급 (Blast Cleaning Grade)',
    procedure: `ISO 8501-1: 블라스트 청소 후 표면 청결도 등급

【등급 기준】
Sa 1: 가벼운 블라스트 청소
Sa 2: 철저한 블라스트 청소
Sa 2½: 매우 철저한 블라스트 청소 ← 기준
Sa 3: 육안으로 깨끗한 강재

【Sa 2½ 기준】
표면에 오일, 그리스, 먼지, 밀스케일, 녹, 도료,
이물질이 거의 없어야 함.
남아있는 오염물의 흔적은 가벼운 얼룩 형태만 허용.
잔존 밀스케일 ≤ 5% 허용`,
  },
  profile: {
    standard: 'ISO 8503-2 / ASTM D4417',
    title: '표면 조도 (Surface Profile)',
    procedure: `ISO 8503-2 / ASTM D4417-C: 표면 조도 측정

【측정 방법 - Replica Tape (ASTM D4417-C)】
1. 측정 위치 표면의 먼지 제거
2. Replica Tape를 표면에 부착
3. Burnishing tool로 문질러 표면 형상 복제
4. 마이크로미터로 테이프 총 두께 측정
5. 테이프 기본 두께(50μm) 차감
   → 실제 조도값

【기준값】
- 최소: 30 μm
- 최대: 75 μm
- 목표: Medium 등급 (42~85μm, ISO 8503)
- 권장: 50~70 μm`,
  },
  dft: {
    standard: 'ISO 2808 / SSPC-PA2',
    title: '측정 건도막두께 평균 (Dry Film Thickness)',
    procedure: `ISO 2808 / SSPC-PA2: 건도막 두께 측정

【측정 방법】
1. 자기유도식 두께 측정기 사용
2. 측정 전 장비 교정 (영점 및 표준편차 확인)
3. 측정 위치: 1m² 당 최소 5개 지점
4. 각 지점에서 3회 측정 후 평균

【기준값】
평균: 8 ± 2 μm (6~10 μm)

【SSPC-PA2 기준】
- 개별 측정값: 기준값의 ±20% 이내
- 5점 평균: 기준값 이상`,
  },
  waterSolubleSalts: {
    standard: 'ISO 8502-6 / ISO 8502-9',
    title: '수용성 염분 (Water Soluble Salts)',
    procedure: `ISO 8502-6 / ISO 8502-9: 수용성 염분 측정

【측정 방법 - Bresle Method (ISO 8502-6)】
1. Bresle patch를 표면에 부착 (접촉면적 확인)
2. 증류수 2~3mL 주입
3. 10분간 방치 (염분 용출)
4. 주사기로 용액 회수
5. 전도도계로 측정 (ISO 8502-9)

【계산식】
염분농도(mg/m²) = (측정값 - 영점) × 6

【기준값】
≤ 50 mg/m² (PSPC 기준)
Bresle patch 영점: 1.0 μS/cm`,
  },
  abrasivesConductivity: {
    standard: 'ISO 11126 / ISO 11127',
    title: '연마재 전기전도도 (Abrasives Conductivity)',
    procedure: `ISO 11127-6: 연마재 수용성 불순물 측정

【측정 방법】
1. 연마재 시료 채취 (작업 전)
2. 증류수와 1:1 혼합 후 교반
3. 전도도계로 상등액 측정

【기준값】
≤ 250 μS/cm

【주의사항】
전도도 초과 시 연마재 교체 필요.
높은 전도도 = 수용성 염분 오염 → 도막 하부 부식 원인`,
  },
  dryBulb: {
    standard: '-',
    title: '건구온도 / 습구온도 측정',
    procedure: `아스만 통풍건습계 또는 디지털 온습도계 사용

【측정 방법】
1. 건구온도계: 일반 온도 측정
2. 습구온도계: 감구부를 물에 적신 천으로 감싸 측정
3. 통풍 상태에서 3~5분 후 안정값 읽기
4. 두 값으로 상대습도 및 이슬점 계산

【Magnus 공식 (자동계산)】
상대습도 및 이슬점은 건구/습구 온도 입력 시 자동 계산됩니다.`,
  },
  surfaceTemp: {
    standard: 'ISO 8502-4',
    title: '철판온도 (Surface Temperature)',
    procedure: `ISO 8502-4: 도장 전 표면 온도 측정

【측정 방법】
1. 접촉식 온도계 또는 적외선 온도계 사용
2. 측정 위치: 도장 예정 구역 여러 곳
3. 직사광선, 바람 등 환경 영향 고려

【판정 기준】
철판온도 > 이슬점 + 3℃

【이유】
이슬점에 근접한 온도에서 도장 시
수분 응결로 인한 도막 부착력 저하 및 조기 부식 발생`,
  },
  mekTest: {
    standard: 'ASTM D4752',
    title: 'MEK 용제 저항성 시험 (MEK Rub Test)',
    procedure: `ASTM D4752: 도막 경화 상태 평가

【시험 방법】
1. MEK(메틸에틸케톤) 용제를 거즈에 적심
2. 도막 표면을 일정한 힘으로 왕복 문지름
3. 50회 왕복 후 도막 상태 확인

【Rating 기준】
Rating 5: 도막 손상 없음 (완전 경화)
Rating 4: 광택 약간 감소 (합격 기준)
Rating 3: 도막 약간 연화
Rating 2: 도막 상당 연화
Rating 1: 도막 완전 제거

【합격 기준】
≥ Rating 4`,
  },
  facilityManagement: {
    standard: '-',
    title: '공장설비 관리',
    procedure: '블라스팅 설비, 도장 설비 등 공장 내 설비 관리 상태 점검\n- 설비 청결도\n- 정기 유지보수 이행 여부\n- 안전장치 정상 작동 여부',
  },
  materialManagement: {
    standard: '-',
    title: '자재 관리',
    procedure: '도료, 연마재 등 자재 관리 상태 점검\n- 야적장 및 옥내 보관 상태\n- 유효기간 관리\n- 혼합비율 준수 여부',
  },
  paintManagement: {
    standard: '-',
    title: '도료 관리',
    procedure: '도료 보관 및 사용 상태 점검\n- 보관 온도/습도 적정 여부\n- Pot life 준수\n- 혼합 비율 (Paste:Liquid:Thinner) 기록',
  },
  reportManagement: {
    standard: '-',
    title: '전처리 일지 기록',
    procedure: '전처리 작업 일지 기록 여부 확인\n- 작업일, 담당자, 기상 조건\n- 블라스팅 조건, 측정값 기록\n- 이상사항 기록',
  },
};
