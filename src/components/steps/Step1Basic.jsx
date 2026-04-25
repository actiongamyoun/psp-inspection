import { useEffect } from 'react';
import { getCurrentAffiliation } from '../../constants/config';
import { getLocationConfig } from '../../constants/locations';

export default function Step1Basic({ report, onChange }) {
  const affId = getCurrentAffiliation();
  const locationConfig = getLocationConfig(affId);

  // 파트너 고정 위치 자동 세팅
  useEffect(() => {
    if (locationConfig.type === 'fixed' && report.basic.inspectionLocation !== locationConfig.value) {
      onChange({
        ...report,
        basic: { ...report.basic, inspectionLocation: locationConfig.value },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key, value) => {
    onChange({
      ...report,
      basic: { ...report.basic, [key]: value },
    });
  };

  const renderLocationField = () => {
    // QM: 드롭다운 10개
    if (locationConfig.type === 'dropdown') {
      return (
        <div className="field-card">
          <div className="field-label">검사위치 <span className="field-label-en">Inspection Area</span></div>
          <select
            className="select-dropdown"
            value={report.basic.inspectionLocation}
            onChange={(e) => update('inspectionLocation', e.target.value)}
          >
            <option value="">위치를 선택하세요</option>
            {locationConfig.options.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      );
    }

    // 신화테크: 1호기 / 2호기 버튼
    if (locationConfig.type === 'select') {
      return (
        <div className="field-card">
          <div className="field-label">검사위치 <span className="field-label-en">Inspection Area</span></div>
          <div className="select-row" style={{ marginTop: 8 }}>
            {locationConfig.options.map(opt => (
              <button
                key={opt}
                type="button"
                className={`select-btn ${report.basic.inspectionLocation === opt ? 'selected-ok' : ''}`}
                onClick={() => update('inspectionLocation', opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 나머지 파트너: 자동 고정 표시
    return (
      <div className="field-card">
        <div className="field-label">검사위치 <span className="field-label-en">Inspection Area</span></div>
        <div style={{
          padding: '11px 12px',
          background: '#f0f7f3',
          borderRadius: 9,
          border: '1.5px solid #C5E0B4',
          fontSize: 15,
          fontWeight: 700,
          color: '#1B6B3A',
        }}>
          {locationConfig.value}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="step-title">기본 정보</h3>
      <p className="step-desc">레포트 식별 정보를 입력하세요</p>

      <div className="field-card">
        <div className="field-label">검사일 <span className="field-label-en">Inspection Date</span></div>
        <input
          className="input-field"
          type="date"
          value={report.basic.inspectionDate}
          onChange={(e) => update('inspectionDate', e.target.value)}
        />
      </div>

      <div className="field-card">
        <div className="field-label">호선번호 <span className="field-label-en">Hull No.</span></div>
        <input
          className="input-field"
          value={report.basic.hullNo}
          onChange={(e) => update('hullNo', e.target.value)}
          placeholder="예: H3395"
        />
      </div>

      <div className="field-card">
        <div className="field-label">강재번호 <span className="field-label-en">Steel Plate No.</span></div>
        <input
          className="input-field"
          value={report.basic.steelPlateNo}
          onChange={(e) => update('steelPlateNo', e.target.value)}
          placeholder="예: PB88746205"
        />
      </div>

      {renderLocationField()}

      <div className="field-card">
        <div className="field-label">검사자 <span className="field-label-en">Inspector</span></div>
        <input
          className="input-field"
          value={`${report.inspector.name} (${report.inspector.affiliation})`}
          readOnly
          style={{ background: '#f5f5f5', color: '#666' }}
        />
      </div>
    </div>
  );
}
