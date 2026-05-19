import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../constants/config';
import { fetchDashboard } from '../utils/sheets';

export default function Admin() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchDashboard();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) loadData();
  }, [unlocked]);

  const tryUnlock = () => {
    if (pin === APP_CONFIG.ADMIN_PIN) {
      setUnlocked(true);
    } else {
      alert('PIN이 올바르지 않습니다');
      setPin('');
    }
  };

  // 날짜 포맷
  const formatDate = (str) => {
    if (!str) return '-';
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 며칠 전인지
  const daysAgo = (str) => {
    if (!str) return null;
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 24, background: '#424242', color: 'white',
      }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🔒</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22 }}>관리자 대시보드</h2>
        <p style={{ margin: '0 0 20px', opacity: 0.7, fontSize: 13 }}>PIN을 입력하세요</p>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          placeholder="••••••••"
          autoFocus
          style={{
            padding: '14px 16px', border: 'none', borderRadius: 10,
            fontSize: 18, fontWeight: 700, textAlign: 'center',
            width: 240, letterSpacing: 4, marginBottom: 12,
          }}
        />
        <button
          onClick={tryUnlock}
          style={{
            background: '#1B6B3A', color: 'white', border: 'none',
            padding: '12px 36px', borderRadius: 10, fontSize: 14,
            fontWeight: 700, cursor: 'pointer', width: 240,
          }}
        >
          진입
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent', color: 'rgba(255,255,255,0.6)',
            border: 'none', padding: 12, marginTop: 14, fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7f5', paddingBottom: 30 }}>
      <header style={{
        background: '#424242', color: 'white', padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.2)', color: 'white',
            width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
          }}
        >←</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, flex: 1 }}>
          📊 관리자 대시보드
        </h2>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            background: 'rgba(255,255,255,0.2)', color: 'white',
            border: 'none', borderRadius: 6, padding: '6px 12px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {loading ? '...' : '↻ 새로고침'}
        </button>
      </header>

      {loading && !data && (
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          데이터 로딩중...
        </div>
      )}

      {error && (
        <div style={{
          margin: 14, padding: 14,
          background: '#ffebee', border: '1px solid #ef9a9a',
          borderRadius: 10, fontSize: 13, color: '#c62828',
        }}>
          오류: {error}
        </div>
      )}

      {data && (
        <>
          {/* 전체 요약 */}
          <div style={sectionStyle}>
            <div style={titleStyle}>📈 전체 현황</div>
            <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={summaryCard('#1B6B3A')}>
                <div style={summaryLabel}>이번 달 등록</div>
                <div style={summaryNum}>{data.thisMonth}건</div>
              </div>
              <div style={summaryCard('#666')}>
                <div style={summaryLabel}>전체 누적</div>
                <div style={summaryNum}>{data.total}건</div>
              </div>
            </div>
          </div>

          {/* 협력사별 현황 */}
          <div style={sectionStyle}>
            <div style={titleStyle}>🏢 협력사별 등록 현황 (이번 달)</div>
            <div>
              {Object.keys(data.byAffiliation).length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#999' }}>
                  등록된 데이터가 없습니다
                </div>
              ) : (
                Object.entries(data.byAffiliation).map(([aff, count]) => {
                  const lastDate = data.lastSubmittedBy[aff];
                  const days = daysAgo(lastDate);
                  const isStale = days !== null && days > 14;
                  return (
                    <div key={aff} style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#1a1a1a' }}>{aff}</div>
                        <div style={{ fontSize: 11, color: isStale ? '#c62828' : '#888', marginTop: 2 }}>
                          마지막 등록: {formatDate(lastDate)}
                          {days !== null && (
                            <span style={{ marginLeft: 6, fontWeight: 600 }}>
                              ({days === 0 ? '오늘' : `${days}일 전`})
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: count.thisMonth > 0 ? '#1B6B3A' : '#bbb' }}>
                          {count.thisMonth}
                        </div>
                        <div style={{ fontSize: 10, color: '#888' }}>
                          누적 {count.total}건
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 최근 등록 */}
          <div style={sectionStyle}>
            <div style={titleStyle}>📋 최근 등록 ({data.recent.length}건)</div>
            <div>
              {data.recent.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#999' }}>
                  등록된 레포트가 없습니다
                </div>
              ) : (
                data.recent.map((r, idx) => (
                  <div key={idx} style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: 12,
                  }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1B6B3A', fontSize: 11 }}>
                      {r.id}
                    </div>
                    <div style={{ marginTop: 3, color: '#333' }}>
                      <b>{r.affiliation}</b> · {r.location || '-'} · {r.hullNo || '-'}
                    </div>
                    <div style={{ marginTop: 2, color: '#888', fontSize: 11 }}>
                      검사일 {formatDate(r.inspectionDate)} · 검사자 {r.inspector || '-'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: 11, color: '#999', marginTop: 20 }}>
        PSP REPORT
      </div>
    </div>
  );
}

const sectionStyle = {
  background: 'white',
  margin: '14px',
  borderRadius: 12,
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
};

const titleStyle = {
  padding: '12px 14px',
  background: '#f9f9f9',
  fontSize: 13,
  fontWeight: 700,
  color: '#333',
  borderBottom: '1px solid #e0e0e0',
};

const summaryCard = (color) => ({
  background: '#fff',
  border: `2px solid ${color}`,
  borderRadius: 10,
  padding: '12px 14px',
  textAlign: 'center',
});

const summaryLabel = {
  fontSize: 11,
  color: '#666',
  fontWeight: 600,
  marginBottom: 4,
};

const summaryNum = {
  fontSize: 26,
  fontWeight: 800,
  color: '#1a1a1a',
};
