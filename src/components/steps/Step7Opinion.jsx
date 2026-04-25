export default function Step7Opinion({ report, onChange }) {
  const update = (value) => {
    onChange({ ...report, opinion: value });
  };
  
  const insertTemplate = () => {
    const tpl = `1) 전반적인 공장 및 도료/자재 관리 양호
2) 자재관리
   - 야적장 및 옥내 전처리 대기중인 강재 상태 B-Grade 유지중임
   - 도료 보관 및 혼합비율 준수 관련 특이사항 없음
3) 표면처리
   - 평균 B-Grade 이상 원자재 사용 지속, Cleaning 및 표면 조도 상태 양호
4) 강판 Salt Level 체크 결과 PSPC 허용기준(50mg/㎡) 만족
   강판 DFT 측정시 평균값 기준(Aver. 8㎛ ± 2㎛) 만족`;
    update(tpl);
  };
  
  return (
    <div>
      <h3 className="step-title">종합 의견</h3>
      <p className="step-desc">Integrate Opinion of Inspection · HHI YARD</p>
      
      <div className="field-card">
        <div className="field-label">
          종합 검사 의견
          <button
            type="button"
            onClick={insertTemplate}
            style={{
              background: '#e8f3ec',
              color: '#1B6B3A',
              border: 'none',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📋 템플릿 삽입
          </button>
        </div>
        <textarea
          className="textarea-field"
          value={report.opinion || ''}
          onChange={(e) => update(e.target.value)}
          placeholder="종합 의견을 작성하세요"
          rows={12}
          style={{ minHeight: 220 }}
        />
      </div>
    </div>
  );
}
