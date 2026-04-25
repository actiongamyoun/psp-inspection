import { generateReportId } from './storage';
import { getCurrentAffiliation, getInspectorName } from '../constants/config';
import { getAffiliation } from '../constants/affiliations';

// 빈 검사 항목 객체 생성
const emptyItem = () => ({ value: '', result: null, reason: '' });

// 새 레포트 객체 생성
export const createNewReport = () => {
  const affId = getCurrentAffiliation();
  const aff = getAffiliation(affId);
  const inspectorName = getInspectorName();
  const today = new Date().toISOString().slice(0, 10);
  
  return {
    id: generateReportId(),
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inspector: {
      affiliation: aff?.name || '',
      affiliationId: affId,
      name: inspectorName,
    },
    basic: {
      hullNo: '',
      steelPlateNo: '',
      inspectionDate: today,
      inspectionLocation: '',
    },
    items: {
      // surfacePrep
      workSpeed: emptyItem(),
      heatingState: emptyItem(),
      dust: emptyItem(),
      millScale: emptyItem(),
      profile: emptyItem(),
      dft: emptyItem(),
      waterSolubleSalts: emptyItem(),
      // abrasives
      abrasivesConductivity: emptyItem(),
      // environmental
      dryBulb: emptyItem(),
      wetBulb: emptyItem(),
      relHumidity: emptyItem(),
      dewPoint: emptyItem(),
      surfaceTemp: emptyItem(),
      // others
      facilityManagement: emptyItem(),
      materialManagement: emptyItem(),
      paintManagement: emptyItem(),
      reportManagement: emptyItem(),
      mekTest: emptyItem(),
    },
    photos: {
      surfaceProfile: [],
      dust: [],
      salts: [],
      conductivity: [],
      dft: [],
      beforeTreatment: [],
      afterTreatment: [],
      shopprimer: [],
    },
    opinion: '',
  };
};
