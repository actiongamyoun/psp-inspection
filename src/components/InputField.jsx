import { useState } from 'react';
import { STANDARDS, ISO_PROCEDURES, judgeAuto } from '../constants/standards';

// ISO 프로시저 팝업
function IsoPopup({ itemKey, onClose }) {
  const info = ISO_PROCEDURES[itemKey];
  if (!info) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: 'white',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 36px',
        maxHeight: '75vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ fontSize: 13, fontWeight: 800, color: '#1B6B3A', marginBottom: 4 }}>
          {info.standard && info.standard !== '-' && (
            <span style={{ background: '#e8f3ec', padding: '2px 8px', borderRadius: 6, fontSize: 11, marginRight: 8 }}>
              {info.standard}
            </span>
          )}
          {info.title}
        </div>
        <div style={{ height: 1, background: '#e0e0e0', margin: '10px 0' }} />
        <pre style={{
          fontSize: 12.5, lineHeight: 1.7, color: '#333',
          whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit',
        }}>{info.procedure}</pre>
        <button onClick={onClose} style={{
          width: '100%', marginTop: 16, padding: 12,
          background: '#f5f5f5', border: 'none', borderRadius: 10,
          fontSize: 13, fontWeight: 600, color: '#666', cursor: 'pointer',
        }}>닫기</button>
      </div>
    </div>
  );
}

export default function InputField({ itemKey, item, onChange, allItems = {} }) {
  const std = STANDARDS[itemKey];
  const [showIso, setShowIso] = useState(false);
  if (!std) return null;

  const hasIso = !!ISO_PROCEDURES[itemKey];

  const updateValue = (value) => {
    const judgement = judgeAuto(itemKey, value, allItems);
    onChange(itemKey, {
      ...item, value,
      result: judgement.result,
      reason: judgement.result === '불만족' ? (item.reason || '') : '',
      autoMessage: judgement.message || '',
      isAuto: judgement.auto,
    });
  };

  const updateReason = (reason) => onChange(itemKey, { ...item, reason });

  const handleManualSelect = (selected) => {
    onChange(itemKey, {
      ...item, value: selected, result: selected,
      reason: selected === '불만족' ? (item.reason || '') : '',
      isAuto: false,
    });
  };

  const handleRatingSelect = (rating) => {
    const judgement = judgeAuto(itemKey, String(rating), allItems);
    onChange(itemKey, {
      ...item, value: String(rating), result: judgement.result,
      reason: judgement.result === '불만족' ? (item.reason || '') : '',
      isAuto: false,
    });
  };

  // ISO 8502-3 표면오염 - 입자크기 + 먼지양 분리
  const handleDustChange = (field, val) => {
    const current = item.dustDetail || { size: '', quantity: '' };
    const updated = { ...current, [field]: val };
    // 둘 다 입력됐을 때 판정
    let result = null;
    if (updated.size !== '' && updated.quantity !== '') {
      const sizeOk = parseInt(updated.size) <= 2;
      const qtyOk = parseInt(updated.quantity) <= 2;
      result = (sizeOk && qtyOk) ? '만족' : '불만족';
    }
    onChange(itemKey, {
      ...item,
      value: updated.size !== '' && updated.quantity !== ''
        ? `Size:${updated.size} / Qty:${updated.quantity}` : '',
      dustDetail: updated,
      result,
      reason: result === '불만족' ? (item.reason || '') : '',
      isAuto: false,
    });
  };

  const renderInput = () => {
    switch (std.type) {
      case 'numeric_range':
      case 'numeric_target':
      case 'numeric_max':
      case 'numeric_dewpoint_check': {
        const isOk = item.result === '만족';
        const isNg = item.result === '불만족';
        const cls = isOk ? 'auto-ok' : isNg ? 'auto-ng' : '';
        return (
          <>
            <div className="input-row">
              <input
                className={`input-field ${cls}`}
                type="number" step="0.1"
                value={item.value}
                onChange={e => updateValue(e.target.value)}
                placeholder="값 입력"
              />
              {std.unit && <span className="input-unit">{std.unit}</span>}
            </div>
            {item.result && (
              <span className={`judge-badge ${isOk ? 'ok' : 'ng'} auto`}>
                자동: {item.result}{item.autoMessage && ` (${item.autoMessage})`}
              </span>
            )}
          </>
        );
      }

      // ISO 8502-3 표면오염
      case 'iso_dust': {
        const detail = item.dustDetail || { size: '', quantity: '' };
        const isOk = item.result === '만족';
        const isNg = item.result === '불만족';
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              {/* 입자 크기 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6, textAlign: 'center' }}>
                  입자크기 등급
                </div>
                <div className="rating-row" style={{ gap: 5 }}>
                  {[0,1,2,3,4,5].map(r => (
                    <button key={r} type="button"
                      className={`rating-btn ${detail.size === String(r)
                        ? (r <= 2 ? 'selected-ok' : 'selected-ng') : ''}`}
                      style={{ width: 38, height: 38, fontSize: 15 }}
                      onClick={() => handleDustChange('size', String(r))}
                    >{r}</button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 4 }}>
                  ≤ 2등급 합격
                </div>
              </div>
              {/* 먼지 양 */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#555', marginBottom: 6, textAlign: 'center' }}>
                  먼지양 등급
                </div>
                <div className="rating-row" style={{ gap: 5 }}>
                  {[1,2,3,4,5].map(r => (
                    <button key={r} type="button"
                      className={`rating-btn ${detail.quantity === String(r)
                        ? (r <= 2 ? 'selected-ok' : 'selected-ng') : ''}`}
                      style={{ width: 38, height: 38, fontSize: 15 }}
                      onClick={() => handleDustChange('quantity', String(r))}
                    >{r}</button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 4 }}>
                  ≤ 2등급 합격
                </div>
              </div>
            </div>
            {item.result && (
              <span className={`judge-badge ${isOk ? 'ok' : 'ng'} manual`} style={{ marginTop: 10 }}>
                {isOk ? '만족' : '불만족'}
                {detail.size !== '' && ` (입자: ${detail.size}등급 / 먼지: ${detail.quantity}등급)`}
              </span>
            )}
          </>
        );
      }

      case 'rating_1to5': {
        const selectedRating = item.value ? parseInt(item.value) : null;
        const passRating = std.passRating || 1;
        return (
          <>
            <div className="rating-row">
              {[1,2,3,4,5].map(r => {
                const isSelected = selectedRating === r;
                const isPass = r <= passRating;
                return (
                  <button key={r} type="button"
                    className={`rating-btn ${isSelected ? (isPass ? 'selected-ok' : 'selected-ng') : ''}`}
                    onClick={() => handleRatingSelect(r)}
                  >{r}</button>
                );
              })}
            </div>
            {selectedRating && (
              <span className={`judge-badge ${selectedRating <= passRating ? 'ok' : 'ng'} manual`}>
                Rating {selectedRating}: {selectedRating <= passRating ? '만족' : '불만족'}
              </span>
            )}
          </>
        );
      }

      case 'manual_pass_fail':
        return (
          <div className="select-row">
            <button type="button"
              className={`select-btn ${item.value === '만족' ? 'selected-ok' : ''}`}
              onClick={() => handleManualSelect('만족')}>만족</button>
            <button type="button"
              className={`select-btn ${item.value === '불만족' ? 'selected-ng' : ''}`}
              onClick={() => handleManualSelect('불만족')}>불만족</button>
          </div>
        );

      case 'manual_select':
        return (
          <div className="select-row">
            {std.options.map(opt => (
              <button key={opt} type="button"
                className={`select-btn ${item.value === opt ? 'selected-ok' : ''}`}
                onClick={() => handleManualSelect(opt)}>{opt}</button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="field-card">
        <div className="field-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {std.label}
            <span className="field-label-en">{std.labelEn}</span>
          </div>
          {hasIso && (
            <button type="button" onClick={() => setShowIso(true)}
              style={{
                background: '#e8f3ec', border: 'none', borderRadius: '50%',
                width: 22, height: 22, fontSize: 12, cursor: 'pointer',
                color: '#1B6B3A', fontWeight: 700, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>ℹ</button>
          )}
        </div>
        {std.standard && std.standard !== '-' && (
          <div className="field-standard">
            표준: <span className="tag">{std.standard}</span>
          </div>
        )}
        {renderInput()}
        {item.result === '불만족' && (
          <textarea className="reason-input"
            value={item.reason || ''}
            onChange={e => updateReason(e.target.value)}
            placeholder="불만족 사유를 입력하세요"
            rows={2}
          />
        )}
      </div>
      {showIso && <IsoPopup itemKey={itemKey} onClose={() => setShowIso(false)} />}
    </>
  );
}
