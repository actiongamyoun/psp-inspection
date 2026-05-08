import { useEffect } from 'react';
import { calcHumidity, judgeAuto, STANDARDS } from '../../constants/standards';
import TempPicker from '../TempPicker';

export default function Step4Environmental({ report, onChange }) {
  const items = report.items;

  // 건구/습구 변경 시 RH + DP 자동계산
  useEffect(() => {
    const tdb = items.dryBulb.value;
    const twb = items.wetBulb.value;
    if (tdb === '' || twb === '' || isNaN(parseFloat(tdb)) || isNaN(parseFloat(twb))) return;

    const { rh, dp } = calcHumidity(tdb, twb);
    if (rh === null || dp === null) return;

    const rhJudge = judgeAuto('relHumidity', rh);
    const stJudge = items.surfaceTemp.value !== ''
      ? judgeAuto('surfaceTemp', items.surfaceTemp.value, { dewPoint: dp })
      : { result: null, auto: false, message: '' };

    onChange({
      ...report,
      items: {
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
          result: null,
          calculated: true,
        },
        ...(items.surfaceTemp.value !== '' ? {
          surfaceTemp: {
            ...items.surfaceTemp,
            result: stJudge.result,
            isAuto: stJudge.auto,
            autoMessage: stJudge.message || '',
            reason: stJudge.result === '불만족' ? (items.surfaceTemp.reason || '') : '',
          },
        } : {}),
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.dryBulb.value, items.wetBulb.value]);

  // 철판온도 입력 시 즉시 판정
  const updateSurfaceTemp = (value) => {
    const dp = items.dewPoint.value;
    const judge = dp !== ''
      ? judgeAuto('surfaceTemp', value, { dewPoint: parseFloat(dp) })
      : { result: null, auto: false, message: '' };
    onChange({
      ...report,
      items: {
        ...items,
        surfaceTemp: {
          ...items.surfaceTemp,
          value,
          result: judge.result,
          isAuto: judge.auto,
          autoMessage: judge.message || '',
          reason: judge.result === '불만족' ? (items.surfaceTemp.reason || '') : '',
        },
      },
    });
  };

  const updateBulb = (key, value) => {
    onChange({ ...report, items: { ...items, [key]: { ...items[key], value } } });
  };

  const rh = items.relHumidity.value;
  const dp = items.dewPoint.value;
  const hasCalc = rh !== '' && dp !== '';
  const rhOk = items.relHumidity.result === '만족';
  const stOk = items.surfaceTemp.result === '만족';
  const stNg = items.surfaceTemp.result === '불만족';

  return (
    <div>
      <h3 className="step-title">환경 조건</h3>
      <p className="step-desc">숫자를 위/아래 스크롤하여 입력</p>

      {/* 건구/습구 인라인 드럼 */}
      <div className="dual-input">
        <div className="dual-card">
          <div className="label">건구온도</div>
          <div className="label-en">Dry Bulb</div>
          <TempPicker
            value={items.dryBulb.value}
            onChange={(v) => updateBulb('dryBulb', v)}
            min={-20}
            max={60}
          />
          <div className="hint" style={{ fontSize: 10, color: '#888', marginTop: 8 }}>↕ 숫자 스크롤</div>
        </div>
        <div className="dual-card">
          <div className="label">습구온도</div>
          <div className="label-en">Wet Bulb</div>
          <TempPicker
            value={items.wetBulb.value}
            onChange={(v) => updateBulb('wetBulb', v)}
            min={-20}
            max={60}
          />
          <div className="hint" style={{ fontSize: 10, color: '#888', marginTop: 8 }}>↕ 숫자 스크롤</div>
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
      <div className="field-card">
        <div className="field-label">
          철판온도
          <span className="field-label-en">Surface Temp.</span>
        </div>
        <div className="field-standard">
          표준: <span className="tag">
            {dp !== '' ? `이슬점(${dp}℃) + 3℃ = ${(parseFloat(dp) + 3).toFixed(1)}℃ 초과` : '이슬점 + 3℃ 초과'}
          </span>
        </div>
        <div style={{
          padding: 8,
          border: `2px solid ${stOk ? '#2e7d32' : stNg ? '#c62828' : '#e0e0e0'}`,
          borderRadius: 9,
          background: stOk ? '#f1f8f3' : stNg ? '#fef1f1' : 'white',
        }}>
          <TempPicker
            value={items.surfaceTemp.value}
            onChange={(v) => updateSurfaceTemp(v)}
            min={-20}
            max={80}
          />
        </div>
        {items.surfaceTemp.result && (
          <span className={`judge-badge ${stOk ? 'ok' : 'ng'} auto`}>
            자동: {items.surfaceTemp.result}
            {items.surfaceTemp.autoMessage && ` (${items.surfaceTemp.autoMessage})`}
          </span>
        )}
        {items.surfaceTemp.result === '불만족' && (
          <textarea className="reason-input"
            value={items.surfaceTemp.reason || ''}
            onChange={e => onChange({
              ...report,
              items: { ...items, surfaceTemp: { ...items.surfaceTemp, reason: e.target.value } },
            })}
            placeholder="불만족 사유를 입력하세요" rows={2}
          />
        )}
      </div>
    </div>
  );
}
