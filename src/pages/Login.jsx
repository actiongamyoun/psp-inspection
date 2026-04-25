import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AFFILIATIONS } from '../constants/affiliations';
import {
  setCurrentAffiliation,
  setInspectorName,
  getInspectorName,
  APP_CONFIG,
} from '../constants/config';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAff, setSelectedAff] = useState(null);
  const [name, setName] = useState(getInspectorName());

  const qm = AFFILIATIONS.find(a => a.type === 'qm');
  const partners = AFFILIATIONS.filter(a => a.type === 'partner');

  const handleSelect = (aff) => {
    setSelectedAff(aff);
    setStep(2);
  };

  const handleStart = () => {
    if (!name.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    setCurrentAffiliation(selectedAff.id);
    setInspectorName(name.trim());
    navigate('/', { replace: true });
  };

  if (step === 1) {
    return (
      <div className="login-screen">
        {/* 현대중공업 로고 */}
        <div className="login-logo">
          <img
            src="/hd_logo.png"
            alt="HD현대중공업"
            style={{ width: 180, marginBottom: 18, filter: 'brightness(0) invert(1)' }}
          />
          <h1 className="title">{APP_CONFIG.APP_NAME}</h1>
          <div className="sub">{APP_CONFIG.APP_SUBTITLE}</div>
        </div>

        <div className="login-prompt">소속을 선택해주세요</div>

        <div className="affiliation-grid">
          <button className="affiliation-card qm" onClick={() => handleSelect(qm)}>
            <div className="label">QUALITY MANAGEMENT</div>
            <div className="name">{qm.name}</div>
          </button>
          {partners.map(p => (
            <button key={p.id} className="affiliation-card" onClick={() => handleSelect(p)}>
              <div className="label">PARTNER</div>
              <div className="name">{p.name}</div>
              {p.subtitle && <div className="subname">{p.subtitle}</div>}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.8)',
              padding: '8px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔒 관리자 모드
          </button>
          <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.5 }}>
            v0.2.2 · Primary Surface Preparation
          </div>
        </div>
      </div>
    );
  }

  // Step 2: 이름 입력
  return (
    <div className="login-screen">
      <div className="login-logo" style={{ margin: '20px 0 30px' }}>
        <img
          src="/hd_logo.png"
          alt="HD현대중공업"
          style={{ width: 140, marginBottom: 14, filter: 'brightness(0) invert(1)' }}
        />
        <h1 className="title" style={{ fontSize: 28 }}>{APP_CONFIG.APP_NAME}</h1>
        <div className="sub">{APP_CONFIG.APP_SUBTITLE}</div>
      </div>

      <div className="login-prompt">선택하신 소속</div>

      <div style={{ background: 'white', borderRadius: 12, padding: 14, textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
          {selectedAff.type === 'qm' ? 'QUALITY MANAGEMENT' : 'PARTNER'}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1B6B3A' }}>
          {selectedAff.name}
          {selectedAff.subtitle && (
            <span style={{ fontSize: 12, color: '#666', fontWeight: 500, marginLeft: 6 }}>
              ({selectedAff.subtitle})
            </span>
          )}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 12, color: '#666', fontWeight: 700, marginBottom: 8 }}>
          검사자 이름
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="이름을 입력하세요"
          autoFocus
          style={{
            width: '100%', padding: 14,
            border: '2px solid #e8f3ec', borderRadius: 10,
            fontSize: 16, fontWeight: 600,
            background: '#f9fbf9', outline: 'none',
          }}
        />
        <button
          onClick={handleStart}
          style={{
            width: '100%', padding: 16, marginTop: 12,
            background: '#1B6B3A', color: 'white',
            borderRadius: 12, fontSize: 15, fontWeight: 700,
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            border: 'none', cursor: 'pointer',
          }}
        >
          시작하기
        </button>
        <button
          onClick={() => setStep(1)}
          style={{
            width: '100%', padding: 10, marginTop: 8,
            background: 'transparent', color: '#666',
            fontSize: 12, border: 'none', cursor: 'pointer',
          }}
        >
          ← 소속 다시 선택
        </button>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center', fontSize: 11, opacity: 0.5 }}>
        이름은 저장되어 다음부터 자동 입력됩니다
      </div>
    </div>
  );
}
