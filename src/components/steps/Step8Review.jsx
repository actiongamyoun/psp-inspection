import { useState } from 'react';
import { STANDARDS, SECTION_ITEMS, PHOTO_SECTIONS } from '../../constants/standards';
import { uploadReport, getAppsScriptUrl } from '../../utils/sheets';
import { generatePDF } from '../../utils/pdf';
import { saveReport } from '../../utils/storage';

export default function Step8Review({ report, onChange, onSubmitted }) {
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // 모든 섹션 항목 평가
  const allKeys = [
    ...SECTION_ITEMS.surfacePrep,
    ...SECTION_ITEMS.abrasives,
    ...SECTION_ITEMS.environmental,
    ...SECTION_ITEMS.others,
  ];
  
  // 결과 통계
  const stats = allKeys.reduce((acc, key) => {
    const r = report.items[key]?.result;
    if (r === '만족') acc.ok++;
    else if (r === '불만족') acc.ng++;
    else acc.empty++;
    return acc;
  }, { ok: 0, ng: 0, empty: 0 });
  
  const totalPhotos = Object.values(report.photos).flat().length;
  const overallOk = stats.ng === 0 && stats.empty === 0;
  
  // PDF 생성
  const handlePDF = async () => {
    setGenerating(true);
    try {
      await generatePDF(report);
    } catch (err) {
      alert('PDF 생성 실패: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };
  
  // 제출 (구글시트 업로드 + 상태 변경)
  const handleSubmit = async () => {
    if (stats.empty > 0) {
      if (!confirm(`아직 입력하지 않은 항목이 ${stats.empty}개 있습니다. 그래도 제출할까요?`)) return;
    }
    
    setSubmitting(true);
    try {
      const finalReport = { ...report, status: 'completed', submittedAt: new Date().toISOString() };
      
      // localStorage에 먼저 저장
      saveReport(finalReport);
      
      // 구글시트에 업로드 (URL이 설정되어 있을 때만)
      const url = getAppsScriptUrl();
      if (url) {
        try {
          await uploadReport(finalReport);
          alert('✓ 제출 완료\n구글시트에 업로드되었습니다.');
        } catch (err) {
          alert('✓ 로컬 저장 완료\n⚠ 구글시트 업로드 실패: ' + err.message + '\n\n관리자 모드에서 Apps Script URL을 확인하세요.');
        }
      } else {
        alert('✓ 제출 완료\n(구글시트 연동이 설정되지 않아 로컬에만 저장됩니다)');
      }
      
      onChange(finalReport);
      if (onSubmitted) onSubmitted(finalReport);
    } catch (err) {
      alert('제출 실패: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <h3 className="step-title">최종 검토</h3>
      <p className="step-desc">제출 전 입력 내용을 확인하세요</p>
      
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
        <div className="review-row" style={{ background: '#f9fbf9', padding: 10, borderRadius: 8, border: '1px solid #e0e0e0', marginBottom: 10 }}>
          <span className="k">전체</span>
          <span className="v">
            <span style={{ color: '#2e7d32' }}>만족 {stats.ok}</span>
            {' · '}
            <span style={{ color: '#c62828' }}>불만족 {stats.ng}</span>
            {' · '}
            <span style={{ color: '#999' }}>미입력 {stats.empty}</span>
          </span>
        </div>
        {allKeys.map(key => {
          const item = report.items[key];
          const std = STANDARDS[key];
          if (!item || !std) return null;
          const r = item.result;
          return (
            <div key={key} className="review-row">
              <span className="k">{std.label}</span>
              <span className={`v ${r === '만족' ? 'ok' : r === '불만족' ? 'ng' : ''}`}>
                {r ? `${r}${item.value !== '' && std.unit ? ` (${item.value} ${std.unit})` : item.value !== '' ? ` (${item.value})` : ''}` : '미입력'}
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
      
      {/* 종합 결과 */}
      <div style={{
        background: overallOk ? '#e8f5e9' : stats.ng > 0 ? '#ffebee' : '#fff8e1',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        textAlign: 'center',
        border: `2px solid ${overallOk ? '#2e7d32' : stats.ng > 0 ? '#c62828' : '#ffa726'}`,
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: overallOk ? '#2e7d32' : stats.ng > 0 ? '#c62828' : '#ef6c00' }}>
          {overallOk ? '✓ 종합 양호' : stats.ng > 0 ? `✕ ${stats.ng}개 항목 불만족` : '⚠ 입력 미완료'}
        </div>
      </div>
      
      <div className="submit-row">
        <button
          type="button"
          className="btn btn-pdf"
          onClick={handlePDF}
          disabled={generating}
        >
          {generating ? '생성중...' : '📄 PDF 다운로드'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? '제출중...' : '✓ 제출'}
        </button>
      </div>
    </div>
  );
}
