import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../constants/config';
import { getLocations, addLocation, removeLocation, resetLocations } from '../constants/locations';
import { getAllReports, deleteReport } from '../utils/storage';
import { getAppsScriptUrl, setAppsScriptUrl } from '../utils/sheets';

export default function Admin() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  
  const [locations, setLocations] = useState([]);
  const [newLoc, setNewLoc] = useState('');
  const [reports, setReports] = useState([]);
  const [scriptUrl, setScriptUrl] = useState('');
  
  useEffect(() => {
    if (unlocked) {
      setLocations(getLocations());
      setReports(getAllReports().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
      setScriptUrl(getAppsScriptUrl());
    }
  }, [unlocked]);
  
  const tryUnlock = () => {
    if (pin === APP_CONFIG.ADMIN_PIN) {
      setUnlocked(true);
    } else {
      alert('PIN이 올바르지 않습니다');
      setPin('');
    }
  };
  
  const handleAddLocation = () => {
    const ok = addLocation(newLoc);
    if (!ok) {
      alert('이미 존재하거나 빈 값입니다');
      return;
    }
    setLocations(getLocations());
    setNewLoc('');
  };
  
  const handleRemoveLocation = (name) => {
    if (!confirm(`"${name}" 위치를 삭제할까요?`)) return;
    removeLocation(name);
    setLocations(getLocations());
  };
  
  const handleResetLocations = () => {
    if (!confirm('검사위치를 기본값으로 초기화할까요?')) return;
    resetLocations();
    setLocations(getLocations());
  };
  
  const handleDeleteReport = (id) => {
    if (!confirm(`"${id}" 레포트를 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`)) return;
    deleteReport(id);
    setReports(getAllReports());
  };
  
  const handleSaveScriptUrl = () => {
    setAppsScriptUrl(scriptUrl.trim());
    alert('Apps Script URL이 저장되었습니다');
  };
  
  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        background: '#424242',
        color: 'white',
      }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🔒</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>관리자 모드</h2>
        <p style={{ margin: '0 0 20px', opacity: 0.7, fontSize: 13 }}>PIN을 입력하세요</p>
        
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          placeholder="••••••••"
          autoFocus
          style={{
            padding: '14px 16px',
            border: 'none',
            borderRadius: 10,
            fontSize: 18,
            fontWeight: 700,
            textAlign: 'center',
            width: 240,
            letterSpacing: 4,
            marginBottom: 12,
          }}
        />
        
        <button
          onClick={tryUnlock}
          style={{
            background: '#1B6B3A',
            color: 'white',
            border: 'none',
            padding: '12px 36px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            width: 240,
          }}
        >
          진입
        </button>
        
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: 'none',
            padding: 12,
            marginTop: 14,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: 30 }}>
      <header style={{
        background: '#424242',
        color: 'white',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>관리자 모드</h2>
        <span style={{ fontSize: 13, opacity: 0.7 }}>🔒 admin0000</span>
      </header>
      
      {/* 검사위치 관리 */}
      <div style={adminSectionStyle}>
        <div style={adminTitleStyle}>
          🏭 검사위치 관리
          <button onClick={handleResetLocations} style={resetBtnStyle}>기본값으로 초기화</button>
        </div>
        <div>
          {locations.map(loc => (
            <div key={loc} style={locItemStyle}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{loc}</span>
              <button onClick={() => handleRemoveLocation(loc)} style={delBtnStyle}>삭제</button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, padding: 12, borderTop: '1px solid #e0e0e0', background: '#f9f9f9' }}>
          <input
            value={newLoc}
            onChange={(e) => setNewLoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()}
            placeholder="새 위치 이름 입력"
            style={{
              flex: 1,
              padding: '9px 11px',
              border: '1.5px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <button
            onClick={handleAddLocation}
            style={{
              background: '#1B6B3A',
              color: 'white',
              padding: '9px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            + 추가
          </button>
        </div>
      </div>
      
      {/* Apps Script URL */}
      <div style={adminSectionStyle}>
        <div style={adminTitleStyle}>🔗 Google Apps Script 연동</div>
        <div style={{ padding: 14 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 1.5 }}>
            구글시트에 연결된 Apps Script 웹앱 URL을 입력하세요.<br/>
            <span style={{ color: '#1B6B3A', fontWeight: 600 }}>비워두면 로컬에만 저장됩니다.</span>
          </div>
          <input
            value={scriptUrl}
            onChange={(e) => setScriptUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/..../exec"
            style={{
              width: '100%',
              padding: 10,
              border: '1.5px solid #e0e0e0',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'monospace',
              marginBottom: 8,
            }}
          />
          <button
            onClick={handleSaveScriptUrl}
            style={{
              background: '#1B6B3A',
              color: 'white',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            URL 저장
          </button>
        </div>
      </div>
      
      {/* 레포트 관리 */}
      <div style={adminSectionStyle}>
        <div style={adminTitleStyle}>🗑 레포트 관리 ({reports.length}건)</div>
        {reports.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#999' }}>
            저장된 레포트가 없습니다
          </div>
        ) : (
          <div>
            {reports.map(r => (
              <div key={r.id} style={locItemStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1B6B3A' }}>{r.id}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                    {r.basic?.hullNo || '-'} · {r.basic?.steelPlateNo || '-'} · {r.inspector?.name || '-'}
                  </div>
                </div>
                <button onClick={() => handleDeleteReport(r.id)} style={delBtnStyle}>삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ textAlign: 'center', fontSize: 11, color: '#999', marginTop: 20 }}>
        PSP REPORT v0.2.0
      </div>
    </div>
  );
}

const adminSectionStyle = {
  background: 'white',
  margin: '14px',
  borderRadius: 12,
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
};

const adminTitleStyle = {
  padding: '12px 14px',
  background: '#f9f9f9',
  fontSize: 13,
  fontWeight: 700,
  color: '#333',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const resetBtnStyle = {
  background: 'transparent',
  color: '#666',
  border: '1px solid #ccc',
  padding: '4px 10px',
  borderRadius: 6,
  fontSize: 11,
  cursor: 'pointer',
};

const locItemStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 14px',
  borderBottom: '1px solid #f0f0f0',
};

const delBtnStyle = {
  background: '#ffebee',
  color: '#c62828',
  border: 'none',
  padding: '5px 11px',
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
};
