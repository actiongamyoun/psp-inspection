import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentAffiliation,
  getInspectorName,
  clearCurrentAffiliation,
  APP_CONFIG,
} from '../constants/config';
import { getAffiliation } from '../constants/affiliations';
import { getAllReports, deleteReport } from '../utils/storage';
import { generatePDF } from '../utils/pdf';
import { uploadReport } from '../utils/sheets';

export default function Home() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('all');
  const [menuOpen, setMenuOpen] = useState(null);

  const affId = getCurrentAffiliation();
  const aff = getAffiliation(affId);
  const inspectorName = getInspectorName();

  const refresh = () => {
    setReports(
      getAllReports().sort((a, b) =>
        (b.updatedAt || '').localeCompare(a.updatedAt || '')
      )
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleLogout = () => {
    if (confirm('로그아웃하고 소속/이름을 다시 입력할까요?')) {
      clearCurrentAffiliation();
      navigate('/login', { replace: true });
    }
  };

  const filtered = reports.filter(r => {
    if (tab === 'all') return true;
    return r.status === tab;
  });

  const stats = {
    total: reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    completed: reports.filter(r => r.status === 'completed').length,
  };

  const handleNewReport = () => {
    navigate('/report/new');
  };

  const handleOpenReport = (id) => {
    setMenuOpen(null);
    navigate(`/report/${id}`);
  };

  const handlePDFReport = async (e, report) => {
    e.stopPropagation();
    setMenuOpen(null);
    try {
      await generatePDF(report);
    } catch (err) {
      alert('PDF 생성 실패: ' + err.message);
    }
  };

  const handleDeleteReport = (e, report) => {
    e.stopPropagation();
    e.preventDefault();
    const msg =
      `⚠️ 삭제 후 본 기기에서는 이 레포트를 다시 볼 수 없습니다.\n` +
      `PDF/Excel을 미리 다운로드 받았는지 확인하세요.\n\n` +
      `레포트 "${report.id}"를 삭제하시겠습니까?\n\n` +
      `• 본 기기에서 삭제됩니다\n` +
      `• 구글시트에는 "삭제됨"으로 표시됩니다`;
    if (!confirm(msg)) {
      setMenuOpen(null);
      return;
    }
    // 구글시트에 삭제 표시 (조용히)
    uploadReport({
      ...report,
      status: '삭제됨',
      deletedAt: new Date().toISOString(),
      deletedBy: `${inspectorName} (${aff?.name})`,
    }).catch(err => console.warn('시트 업데이트 실패:', err));

    // 로컬 삭제
    deleteReport(report.id);
    setMenuOpen(null);
    refresh();
  };

  const handleDeleteAll = () => {
    if (reports.length === 0) {
      alert('삭제할 레포트가 없습니다');
      return;
    }
    const msg1 =
      `⚠️ 삭제 후 본 기기에서는 이 레포트들을 다시 볼 수 없습니다.\n` +
      `필요한 PDF/Excel을 미리 다운로드 받았는지 확인하세요.\n\n` +
      `본 기기의 모든 레포트 ${reports.length}건을 삭제하시겠습니까?\n\n` +
      `• 본 기기에서만 삭제됩니다\n` +
      `• 구글시트의 기록은 그대로 보존됩니다\n` +
      `• 이 작업은 되돌릴 수 없습니다`;
    if (!confirm(msg1)) return;
    if (!confirm(`정말 ${reports.length}건 전부 삭제할까요?`)) return;
    try {
      localStorage.removeItem('psp_reports');
      refresh();
      alert(`✓ ${reports.length}건이 삭제되었습니다`);
    } catch (err) {
      alert('삭제 실패: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-top">
          <div>
            <h1>{APP_CONFIG.APP_NAME}</h1>
            <div className="subtitle">{APP_CONFIG.APP_SUBTITLE}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            {inspectorName ? `${inspectorName} · ${aff?.name}` : aff?.name || '로그아웃'} ↻
          </button>
        </div>
      </header>

      <div className="content">
        <h2 className="section-title">검사 현황</h2>
        <div className="stats-row">
          <div className="stat-card">
            <div className="num">{stats.total}</div>
            <div className="label">전체</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: '#ef6c00' }}>{stats.draft}</div>
            <div className="label">작성중</div>
          </div>
          <div className="stat-card">
            <div className="num" style={{ color: '#2e7d32' }}>{stats.completed}</div>
            <div className="label">완료</div>
          </div>
        </div>

        {/* 안내 박스 */}
        <div style={{
          background: '#fffbea',
          border: '1px solid #fde68a',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 18,
          fontSize: 12,
          lineHeight: 1.6,
          color: '#78350f',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>⚠️</span>
            <span>중요 안내</span>
          </div>
          <div>
            해당 자료는 본 기기에 저장/관리되니, 작성 완료 후 필히 <b>엑셀/PDF 레포트</b>를 담당자와 공유 바랍니다.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 className="section-title" style={{ margin: 0 }}>레포트 목록</h2>
          {reports.length > 0 && (
            <button
              onClick={handleDeleteAll}
              style={{
                background: 'transparent',
                color: '#c62828',
                border: '1px solid #ffcdd2',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🗑 전체삭제
            </button>
          )}
        </div>
        <div className="tab-bar">
          <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>전체</button>
          <button className={`tab ${tab === 'draft' ? 'active' : ''}`} onClick={() => setTab('draft')}>작성중</button>
          <button className={`tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>완료</button>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ico">📋</div>
            <div className="msg">
              {tab === 'all'
                ? '아직 작성된 레포트가 없습니다'
                : tab === 'draft'
                ? '작성중인 레포트가 없습니다'
                : '완료된 레포트가 없습니다'}
              <br />
              하단 버튼을 눌러 시작해보세요
            </div>
          </div>
        ) : (
          <div className="report-list">
            {filtered.map(r => (
              <div
                key={r.id}
                className="report-item"
                onClick={() => handleOpenReport(r.id)}
                style={{ position: 'relative' }}
              >
                <div className="report-item-top">
                  <div className="report-item-id">{r.id}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className={`status-badge ${r.status}`}>
                      {r.status === 'draft' ? '작성중' : '완료'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === r.id ? null : r.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        fontSize: 16,
                        color: '#999',
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                </div>
                <div className="report-item-meta">
                  {r.basic?.hullNo || '호선미정'} · {r.basic?.steelPlateNo || '강재번호 미정'}
                </div>
                <div className="report-item-sub">
                  {r.inspector?.name} ({r.inspector?.affiliation}) · {r.basic?.inspectionDate || '-'}
                </div>

                {menuOpen === r.id && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 36,
                      right: 14,
                      background: 'white',
                      borderRadius: 10,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      border: '1px solid #e0e0e0',
                      zIndex: 10,
                      minWidth: 140,
                      overflow: 'hidden',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => handleOpenReport(r.id)} style={menuItemStyle}>📝 열기/수정</button>
                    <button onClick={(e) => handlePDFReport(e, r)} style={menuItemStyle}>📄 PDF 출력</button>
                    <button
                      onClick={(e) => handleDeleteReport(e, r)}
                      style={{ ...menuItemStyle, color: '#c62828', borderBottom: 'none' }}
                    >
                      🗑 삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={handleNewReport}>
        + 새 레포트 작성
      </button>

      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 5 }}
          onClick={() => setMenuOpen(null)}
        />
      )}

      {/* 하단 크레딧 */}
      <div style={{
        textAlign: 'center',
        padding: '10px 0 100px 0',
        fontSize: 10,
        color: '#bbb',
        letterSpacing: 0.3,
      }}>
        developed by JNR · a508704@hd.com
      </div>
    </div>
  );
}

const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  background: 'white',
  border: 'none',
  textAlign: 'left',
  fontSize: 13,
  fontWeight: 600,
  color: '#333',
  cursor: 'pointer',
  borderBottom: '1px solid #f0f0f0',
};
