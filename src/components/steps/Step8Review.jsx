import { useState } from 'react';
import { STANDARDS, SECTION_ITEMS, PHOTO_SECTIONS } from '../../constants/standards';
import { uploadReport } from '../../utils/sheets';
import { generatePDF } from '../../utils/pdf';
import { generateExcel } from '../../utils/excel';
import { saveReport } from '../../utils/storage';

const DISPLAY_KEYS = [
  ...SECTION_ITEMS.surfacePrep,
  ...SECTION_ITEMS.abrasives,
  'dryBulb', 'wetBulb', 'relHumidity', 'dewPoint', 'surfaceTemp',
  ...SECTION_ITEMS.others,
];

const JUDGE_KEYS = [
  ...SECTION_ITEMS.surfacePrep,
  ...SECTION_ITEMS.abrasives,
  'relHumidity', 'surfaceTemp',
  ...SECTION_ITEMS.others,
];

export default function Step8Review({ report, onChange, onSubmitted }) {
  const [loading, setLoading] = useState(null); // 'pdf' | 'excel'

  const stats = JUDGE_KEYS.reduce((acc, key) => {
    const r = report.items[key]?.result;
    if (r === '만족') acc.ok++;
    else if (r === '불만족') acc.ng++;
    else acc.empty++;
    return acc;
  }, { ok: 0, ng: 0, empty: 0 });

  const totalPhotos = Object.values(report.photos).flat().length;
  const overallOk = stats.ng === 0 && stats.empty === 0;

  // 공통: 저장 + 구글시트 업로드 + 출력
  const handleOutput = async (type) => {
    if (stats.empty > 0) {
      if (!confirm(`아직 입력하지 않은 항목이 ${stats.empty}개 있습니다. 그래도 진행할까요?`)) return;
    }
    setLoading(type);
    try {
      const finalReport = { ...report, status: 'completed', submittedAt: new Date().toISOString() };
      saveReport(finalReport);
      onChange(finalReport);

      // 구글시트 자동 저장 (조용히)
      uploadReport(finalReport).catch(e => console.warn('시트 업로드 실패:', e));

      // 출력
      if (type === 'pdf') {
        await generatePDF(finalReport);
      } else {
        await generateExcel(finalReport);
      }

      if (onSubmitted) onSubmitted(finalReport);
    } catch (err) {
      alert('오류: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  const getItemDisplay = (key) => {
    const item = report.items[key];
    const std = STANDARDS[key];
    if (!item || !std) return null;
    const noJudge = ['dryBulb', 'wetBulb', 'dewPoint'].includes(key);

    let valueStr = '';
    if (key === 'dust') {
      const d = item.dustDetail;
      if (d && d.size !== '' && d.size != null && d.quantity !== '' && d.quantity != null) {
        valueStr = `입자: ${d.size}등급 / 먼지: ${d.quantity}등급`;
      } else {
        valueStr = item.value || '';
      }
    } else {
      valueStr = item.value !== '' && item.value != null
        ? `${item.value}${std.unit ? ' ' + std.unit : ''}` : '';
    }

    const r = noJudge ? null : item.result;
    return { std, valueStr, result: r };
  };

  return (
    <div>
      <h3 className="step-title">최종 검토</h3>
      <p className="step-desc">아래 출력 버튼을 누르면 자동 저장됩니다</p>

      <div className="review-section">
        <div className="review-section-title">📋 기본 정보</div>
        <div className="review-row"><span className="k">레포트 번호</span><span className="v">{report.id}</span></div>
        <div className="review-row"><span className="k">검사일</span><span className="v">{report.basic.inspectionDate || '-'}</span></div>
        <div className="review-row"><span className="k">호선번호</span><span className="v">{report.basic.hullNo || '-'}</span></div>
        <div className="review-row"><span className="k">강재번호</span><span className="v">{report.basic.steelPlateNo || '-'}</span></div>
        <div className="review-row"><span className="k">검사위치</span><span className="v">{report.basic.inspectionLocation || '-'}</span></div>
        <div className="review-row"><span className="k">검사자</span><span className="v">{report.inspector.name} ({report.inspector.affiliation})</span></div>
      </div>

      <div className="review-section">
        <div className="review-section-title">✅ 판정 요약</div>
        <div style={{
          display: 'flex', gap: 8, marginBottom: 10,
          background: '#f9fbf9', padding: 10, borderRadius: 8,
          border: '1px solid #e0e0e0',
        }}>
          <span style={{ flex: 1, textAlign: 'center', color: '#2e7d32', fontWeight: 800 }}>만족 {stats.ok}</span>
          <span style={{ flex: 1, textAlign: 'center', color: '#c62828', fontWeight: 800 }}>불만족 {stats.ng}</span>
          <span style={{ flex: 1, textAlign: 'center', color: '#999', fontWeight: 800 }}>미입력 {stats.empty}</span>
        </div>
        {DISPLAY_KEYS.map(key => {
          const info = getItemDisplay(key);
          if (!info) return null;
          const { std, valueStr, result } = info;
          const noJudge = ['dryBulb', 'wetBulb', 'dewPoint'].includes(key);
          return (
            <div key={key} className="review-row">
              <span className="k">{std.label}</span>
              <span className={`v ${result === '만족' ? 'ok' : result === '불만족' ? 'ng' : ''}`}>
                {noJudge
                  ? (valueStr || '-')
                  : result
                    ? `${result}${valueStr ? ` (${valueStr})` : ''}`
                    : (valueStr || '미입력')
                }
              </span>
            </div>
          );
        })}
      </div>

      <div className="review-section">
        <div className="review-section-title">📷 첨부 자료</div>
        <div className="review-row"><span className="k">업로드된 사진</span><span className="v">총 {totalPhotos}장</span></div>
        {PHOTO_SECTIONS.map(s => {
          const cnt = (report.photos[s.key] || []).length;
          if (cnt === 0) return null;
          return (
            <div key={s.key} className="review-row">
              <span className="k" style={{ paddingLeft: 12 }}>· {s.label}</span>
              <span className="v">{cnt}장</span>
            </div>
          );
        })}
      </div>

      <div className="review-section">
        <div className="review-section-title">📝 종합 의견</div>
        <div style={{ fontSize: 12, color: '#555', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {report.opinion || <span style={{ color: '#999' }}>입력되지 않음</span>}
        </div>
      </div>

      <div style={{
        background: overallOk ? '#e8f5e9' : stats.ng > 0 ? '#ffebee' : '#fff8e1',
        borderRadius: 12, padding: 14, marginBottom: 12, textAlign: 'center',
        border: `2px solid ${overallOk ? '#2e7d32' : stats.ng > 0 ? '#c62828' : '#ffa726'}`,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: overallOk ? '#2e7d32' : stats.ng > 0 ? '#c62828' : '#ef6c00' }}>
          {overallOk ? '✓ 종합 양호' : stats.ng > 0 ? `✕ ${stats.ng}개 항목 불만족` : '⚠ 입력 미완료'}
        </div>
      </div>

      {/* 출력 버튼 2개 */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="btn btn-pdf"
          style={{ flex: 1, padding: 16, fontSize: 14 }}
          onClick={() => handleOutput('pdf')}
          disabled={loading !== null}
        >
          {loading === 'pdf' ? '생성중...' : '📄 PDF 다운로드'}
        </button>
        <button
          type="button"
          className="btn"
          style={{
            flex: 1, padding: 16, fontSize: 14,
            background: '#107C41',
            color: 'white',
            boxShadow: '0 6px 16px rgba(16,124,65,0.3)',
          }}
          onClick={() => handleOutput('excel')}
          disabled={loading !== null}
        >
          {loading === 'excel' ? '생성중...' : '📊 Excel 다운로드'}
        </button>
      </div>
    </div>
  );
}
