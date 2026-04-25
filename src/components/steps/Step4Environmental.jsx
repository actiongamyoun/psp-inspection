import { useEffect } from 'react';
import { calcHumidity, judgeAuto, STANDARDS } from '../../constants/standards';

export default function Step4Environmental({ report, onChange }) {
  const items = report.items;

  // 건구/습구 변경 시 → RH + DP 자동계산 + 철판온도 재판정
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

  // 철판온도 입력 시 → 현재 DP 기준으로 즉시 판정 ⭐ 버그 수정
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
    onChange({
      ...report,
      items: { ...items, [key]: { ...items[key], value } },
    });
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

      {/* 철판온도 - 직접 렌더링 (allItems 즉시 반영) */}
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
        <div className="input-row">
          <input
            className={`input-field ${stOk ? 'auto-ok' : stNg ? 'auto-ng' : ''}`}
            type="number"
            step="0.1"
            value={items.surfaceTemp.value}
            onChange={(e) => updateSurfaceTemp(e.target.value)}
            placeholder="값 입력"
          />
          <span className="input-unit">℃</span>
        </div>
        {items.surfaceTemp.result && (
          <span className={`judge-badge ${stOk ? 'ok' : 'ng'} auto`}>
            자동: {items.surfaceTemp.result}
            {items.surfaceTemp.autoMessage && ` (${items.surfaceTemp.autoMessage})`}
          </span>
        )}
        {items.surfaceTemp.result === '불만족' && (
          <textarea
            className="reason-input"
            value={items.surfaceTemp.reason || ''}
            onChange={(e) => onChange({
              ...report,
              items: { ...items, surfaceTemp: { ...items.surfaceTemp, reason: e.target.value } },
            })}
            placeholder="불만족 사유를 입력하세요"
            rows={2}
          />
        )}
      </div>
    </div>
  );
}
