import { useEffect, useState } from 'react';
import { getLocations } from '../../constants/locations';

export default function Step1Basic({ report, onChange }) {
  const [locations, setLocations] = useState([]);
  
  useEffect(() => {
    setLocations(getLocations());
  }, []);
  
  const update = (key, value) => {
    onChange({
      ...report,
      basic: { ...report.basic, [key]: value },
    });
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
      
      <div className="field-card">
        <div className="field-label">검사위치 <span className="field-label-en">Inspection Area</span></div>
        <select
          className="select-dropdown"
          value={report.basic.inspectionLocation}
          onChange={(e) => update('inspectionLocation', e.target.value)}
        >
          <option value="">위치를 선택하세요</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      
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
