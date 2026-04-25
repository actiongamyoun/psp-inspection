import { STANDARDS, judgeAuto } from '../constants/standards';

// 단일 검사 항목 입력 카드
export default function InputField({ itemKey, item, onChange, allItems = {} }) {
  const std = STANDARDS[itemKey];
  if (!std) return null;
  
  const updateValue = (value) => {
    const judgement = judgeAuto(itemKey, value, allItems);
    onChange(itemKey, {
      ...item,
      value,
      result: judgement.result,
      reason: judgement.result === '불만족' ? (item.reason || '') : '',
      autoMessage: judgement.message || '',
      isAuto: judgement.auto,
    });
  };
  
  const updateReason = (reason) => {
    onChange(itemKey, { ...item, reason });
  };
  
  const handleManualSelect = (selected) => {
    onChange(itemKey, {
      ...item,
      value: selected,
      result: selected,
      reason: selected === '불만족' ? (item.reason || '') : '',
      isAuto: false,
    });
  };
  
  // 입력 타입별 렌더링
  const renderInput = () => {
    switch (std.type) {
      case 'numeric_range':
      case 'numeric_target':
      case 'numeric_max': {
        const isOk = item.result === '만족';
        const isNg = item.result === '불만족';
        const cls = isOk ? 'auto-ok' : isNg ? 'auto-ng' : '';
        return (
          <>
            <div className="input-row">
              <input
                className={`input-field ${cls}`}
                type="number"
                step="0.1"
                value={item.value}
                onChange={(e) => updateValue(e.target.value)}
                placeholder="값 입력"
              />
              {std.unit && <span className="input-unit">{std.unit}</span>}
            </div>
            {item.result && (
              <span className={`judge-badge ${isOk ? 'ok' : 'ng'} auto`}>
                자동: {item.result}
                {item.autoMessage && ` (${item.autoMessage})`}
              </span>
            )}
          </>
        );
      }
      
      case 'numeric_dewpoint_check': {
        const isOk = item.result === '만족';
        const isNg = item.result === '불만족';
        const cls = isOk ? 'auto-ok' : isNg ? 'auto-ng' : '';
        return (
          <>
            <div className="input-row">
              <input
                className={`input-field ${cls}`}
                type="number"
                step="0.1"
                value={item.value}
                onChange={(e) => updateValue(e.target.value)}
                placeholder="값 입력"
              />
              {std.unit && <span className="input-unit">{std.unit}</span>}
            </div>
            {item.result && (
              <span className={`judge-badge ${isOk ? 'ok' : 'ng'} auto`}>
                자동: {item.result}
                {item.autoMessage && ` (${item.autoMessage})`}
              </span>
            )}
          </>
        );
      }
      
      case 'manual_pass_fail': {
        return (
          <div className="select-row">
            <button
              type="button"
              className={`select-btn ${item.value === '만족' ? 'selected-ok' : ''}`}
              onClick={() => handleManualSelect('만족')}
            >
              만족
            </button>
            <button
              type="button"
              className={`select-btn ${item.value === '불만족' ? 'selected-ng' : ''}`}
              onClick={() => handleManualSelect('불만족')}
            >
              불만족
            </button>
          </div>
        );
      }
      
      case 'manual_select': {
        return (
          <div className="select-row">
            {std.options.map(opt => (
              <button
                key={opt}
                type="button"
                className={`select-btn ${item.value === opt ? 'selected-ok' : ''}`}
                onClick={() => handleManualSelect(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }
      
      default:
        return null;
    }
  };
  
  return (
    <div className="field-card">
      <div className="field-label">
        {std.label}
        <span className="field-label-en">{std.labelEn}</span>
      </div>
      {std.standard && std.standard !== '-' && (
        <div className="field-standard">
          표준: <span className="tag">{std.standard} {std.unit}</span>
        </div>
      )}
      {renderInput()}
      {item.result === '불만족' && (
        <textarea
          className="reason-input"
          value={item.reason || ''}
          onChange={(e) => updateReason(e.target.value)}
          placeholder="불만족 사유를 입력하세요"
          rows={2}
        />
      )}
    </div>
  );
}
