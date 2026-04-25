import { useEffect } from 'react';
import { calcHumidity, judgeAuto, STANDARDS } from '../../constants/standards';
import InputField from '../InputField';

export default function Step4Environmental({ report, onChange }) {
  const items = report.items;
  
  // 건구/습구 입력 시 상대습도/이슬점 자동 계산
  useEffect(() => {
    const tdb = items.dryBulb.value;
    const twb = items.wetBulb.value;
    
    if (tdb !== '' && twb !== '' && !isNaN(parseFloat(tdb)) && !isNaN(parseFloat(twb))) {
      const { rh, dp } = calcHumidity(tdb, twb);
      
      if (rh !== null && dp !== null) {
        // 상대습도 자동 판정
        const rhJudge = judgeAuto('relHumidity', rh);
        // 이슬점은 판정 없음 (참조용)
        // 철판온도가 입력되어 있으면 재판정
        const surfaceJudge = items.surfaceTemp.value !== '' 
          ? judgeAuto('surfaceTemp', items.surfaceTemp.value, { dewPoint: dp })
          : { result: null, auto: false };
        
        const newItems = {
          ...items,
          relHumidity: {
            ...items.relHumidity,
            value: String(rh),
            result: rhJudge.result,
            isAuto: true,
            autoMessage: rhJudge.message || '',
            calculated: true,
          },
          dewPoint: {
            ...items.dewPoint,
            value: String(dp),
            calculated: true,
          },
        };
        
        if (items.surfaceTemp.value !== '') {
          newItems.surfaceTemp = {
            ...items.surfaceTemp,
            result: surfaceJudge.result,
            isAuto: surfaceJudge.auto,
            autoMessage: surfaceJudge.message || '',
            reason: surfaceJudge.result === '불만족' ? (items.surfaceTemp.reason || '') : '',
          };
        }
        
        onChange({ ...report, items: newItems });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.dryBulb.value, items.wetBulb.value]);
  
  const updateItem = (key, item) => {
    onChange({ ...report, items: { ...report.items, [key]: item } });
  };
  
  const updateBulb = (key, value) => {
    onChange({
      ...report,
      items: { ...report.items, [key]: { ...report.items[key], value } },
    });
  };
  
  const rh = items.relHumidity.value;
  const dp = items.dewPoint.value;
  const hasCalc = rh !== '' && dp !== '';
  const rhOk = items.relHumidity.result === '만족';
  
  return (
    <div>
      <h3 className="step-title">환경 조건</h3>
      <p className="step-desc">건구·습구 입력 → 습도·이슬점 자동계산</p>
      
      {/* 건구/습구 나란히 */}
      <div className="dual-input">
        <div className="dual-card">
          <div className="label">건구온도</div>
          <div className="label-en">Dry Bulb</div>
          <input
            className="input-big"
            type="number"
            step="0.1"
            value={items.dryBulb.value}
            onChange={(e) => updateBulb('dryBulb', e.target.value)}
            placeholder="0.0"
          />
          <div className="unit">℃</div>
        </div>
        <div className="dual-card">
          <div className="label">습구온도</div>
          <div className="label-en">Wet Bulb</div>
          <input
            className="input-big"
            type="number"
            step="0.1"
            value={items.wetBulb.value}
            onChange={(e) => updateBulb('wetBulb', e.target.value)}
            placeholder="0.0"
          />
          <div className="unit">℃</div>
        </div>
      </div>
      
      {/* 자동계산 결과 */}
      {hasCalc ? (
        <div className="calc-box">
          <div className="calc-box-title">🔢 자동 계산 결과</div>
          <div className="calc-grid">
            <div className="calc-cell">
              <div className="k">상대습도 (RH)</div>
              <div className="v">{rh}</div>
              <div className="vu">%</div>
            </div>
            <div className="calc-cell">
              <div className="k">이슬점 (DP)</div>
              <div className="v">{dp}</div>
              <div className="vu">℃</div>
            </div>
          </div>
          {items.relHumidity.result && (
            <div className="judge-row">
              <span className={`judge-badge ${rhOk ? 'ok' : 'ng'} auto`}>
                습도 {items.relHumidity.result} (표준: {STANDARDS.relHumidity.standard} %)
              </span>
            </div>
          )}
          <div className="calc-note">* Magnus 공식 기반 자동 계산</div>
        </div>
      ) : (
        <div className="calc-box" style={{ background: '#f5f5f5', borderColor: '#ddd' }}>
          <div className="calc-box-title" style={{ color: '#999' }}>🔢 자동 계산 결과</div>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12, padding: '12px 0' }}>
            건구·습구 온도를 입력하면 자동 계산됩니다
          </div>
        </div>
      )}
      
      {/* 철판온도 */}
      <InputField
        itemKey="surfaceTemp"
        item={items.surfaceTemp}
        onChange={updateItem}
        allItems={items}
      />
    </div>
  );
}
