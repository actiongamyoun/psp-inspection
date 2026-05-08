import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportById, saveReport } from '../utils/storage';
import { createNewReport } from '../utils/reportModel';
import { SECTION_ITEMS } from '../constants/standards';

import Step1Basic from '../components/steps/Step1Basic';
import Step2SurfacePrep from '../components/steps/Step2SurfacePrep';
import Step3Abrasives from '../components/steps/Step3Abrasives';
import Step4Environmental from '../components/steps/Step4Environmental';
import Step5Others from '../components/steps/Step5Others';
import Step6Photos from '../components/steps/Step6Photos';
import Step7Opinion from '../components/steps/Step7Opinion';
import Step8Review from '../components/steps/Step8Review';

const STEPS = [
  { num: 1, name: '기본정보' },
  { num: 2, name: '표면처리' },
  { num: 3, name: '연마재' },
  { num: 4, name: '환경' },
  { num: 5, name: '기타' },
  { num: 6, name: '사진' },
  { num: 7, name: '종합의견' },
  { num: 8, name: '검토' },
];

// 각 단계 완료 여부 판단
const isStepDone = (step, report) => {
  if (!report) return false;
  switch (step) {
    case 1:
      return !!(report.basic.hullNo && report.basic.steelPlateNo && report.basic.inspectionLocation && report.basic.inspectionDate);
    case 2:
      return SECTION_ITEMS.surfacePrep.every(k => report.items[k].value !== '' || report.items[k].result);
    case 3:
      return SECTION_ITEMS.abrasives.every(k => report.items[k].value !== '');
    case 4:
      return report.items.dryBulb.value !== '' && report.items.wetBulb.value !== '' && report.items.surfaceTemp.value !== '';
    case 5:
      return SECTION_ITEMS.others.every(k => report.items[k].result);
    case 6:
      return Object.values(report.photos).flat().length > 0;
    case 7:
      return !!report.opinion;
    case 8:
      return report.status === 'completed';
    default:
      return false;
  }
};

export default function ReportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  // 초기 로드
  useEffect(() => {
    if (id === 'new') {
      const newReport = createNewReport();
      saveReport(newReport);
      // url을 새 ID로 교체
      navigate(`/report/${newReport.id}`, { replace: true });
    } else {
      const loaded = getReportById(id);
      if (loaded) {
        setReport(loaded);
      } else {
        alert('레포트를 찾을 수 없습니다');
        navigate('/');
      }
    }
  }, [id, navigate]);
  
  // 자동저장 (3초 디바운스)
  useEffect(() => {
    if (!report) return;
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    const timer = setTimeout(() => {
      saveReport(report);
    }, 1000);
    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);
  
  if (!report) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>로딩중...</div>;
  }
  
  const handleSave = () => {
    saveReport(report);
    alert('💾 임시 저장되었습니다');
  };
  
  const handleBack = () => {
    saveReport(report);
    navigate('/');
  };
  
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  
  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };
  
  const renderStep = () => {
    const props = { report, onChange: setReport };
    switch (currentStep) {
      case 1: return <Step1Basic {...props} />;
      case 2: return <Step2SurfacePrep {...props} />;
      case 3: return <Step3Abrasives {...props} />;
      case 4: return <Step4Environmental {...props} />;
      case 5: return <Step5Others {...props} />;
      case 6: return <Step6Photos {...props} />;
      case 7: return <Step7Opinion {...props} />;
      case 8: return <Step8Review {...props} onSubmitted={() => navigate('/')} />;
      default: return null;
    }
  };
  
  const progress = (currentStep / 8) * 100;
  
  return (
    <div className="app-container">
      <header className="form-header">
        <div className="form-header-top">
          <button className="back-btn" onClick={handleBack}>←</button>
          <div className="form-title">
            <div className="id">{report.id}</div>
            <div className="name">
              {report.basic.hullNo && report.basic.steelPlateNo
                ? `${report.basic.hullNo} · ${report.basic.steelPlateNo}`
                : '새 레포트'}
            </div>
          </div>
          <button className="save-btn" onClick={handleSave}>💾 저장</button>
        </div>
        
        <div style={{ position: 'relative' }}>
          <div className="step-tabs" id="step-tabs-scroll">
            {STEPS.map(s => {
              const done = isStepDone(s.num, report);
              const active = s.num === currentStep;
              return (
                <button
                  key={s.num}
                  className={`step-tab ${active ? 'active' : done ? 'done' : ''}`}
                  onClick={() => {
                    setCurrentStep(s.num);
                    // 활성 탭을 스크롤 중앙으로
                    setTimeout(() => {
                      const el = document.getElementById('step-tabs-scroll');
                      const btn = el?.children[s.num - 1];
                      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }, 50);
                  }}
                >
                  <span className="num">
                    {!done || active ? <span className="num-text">{s.num}</span> : null}
                  </span>
                  {s.name}
                </button>
              );
            })}
          </div>
          {/* PC 화살표 */}
          <button
            onClick={() => {
              const el = document.getElementById('step-tabs-scroll');
              if (el) el.scrollLeft -= 120;
            }}
            style={{
              position: 'absolute', left: -14, top: 0, bottom: 10,
              background: 'linear-gradient(to right, rgba(27,107,58,1) 60%, transparent)',
              border: 'none', color: 'white', fontSize: 16, cursor: 'pointer',
              paddingRight: 8, display: 'flex', alignItems: 'center',
            }}
          >‹</button>
          <button
            onClick={() => {
              const el = document.getElementById('step-tabs-scroll');
              if (el) el.scrollLeft += 120;
            }}
            style={{
              position: 'absolute', right: -14, top: 0, bottom: 10,
              background: 'linear-gradient(to left, rgba(27,107,58,1) 60%, transparent)',
              border: 'none', color: 'white', fontSize: 16, cursor: 'pointer',
              paddingLeft: 8, display: 'flex', alignItems: 'center',
            }}
          >›</button>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      </header>
      
      <div className="content">
        {renderStep()}
      </div>
      
      {currentStep < 8 && (
        <div className="bottom-actions">
          {currentStep > 1 && (
            <button className="btn btn-secondary" onClick={handlePrev}>←</button>
          )}
          <button className="btn btn-primary" onClick={handleNext}>다음 →</button>
        </div>
      )}
    </div>
  );
}
