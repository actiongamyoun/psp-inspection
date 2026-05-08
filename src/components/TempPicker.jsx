import { useState, useRef, useEffect } from 'react';

// 드럼 롤 방식 온도 픽커
// 정수부(-20~80) + 소수부(0~9) 분리 스크롤

const ITEM_H = 44;

function Drum({ items, selected, onChange }) {
  const ref = useRef(null);
  const idx = Math.max(0, items.indexOf(selected));

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    const i = Math.round(ref.current.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(i, items.length - 1));
    if (items[clamped] !== selected) onChange(items[clamped]);
  };

  return (
    <div style={{ position: 'relative', width: 72, height: ITEM_H * 3, overflow: 'hidden' }}>
      {/* 선택 하이라이트 */}
      <div style={{
        position: 'absolute', top: ITEM_H, left: 0, right: 0, height: ITEM_H,
        background: '#e8f3ec', borderRadius: 8, pointerEvents: 'none', zIndex: 1,
        border: '2px solid #1B6B3A',
      }} />
      {/* 상하 페이드 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 0.8,
        background: 'linear-gradient(white, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 0.8,
        background: 'linear-gradient(transparent, white)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div
        ref={ref}
        onScroll={handleScroll}
        style={{
          height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {/* 상하 패딩 */}
        <div style={{ height: ITEM_H }} />
        {items.map(v => (
          <div key={v} style={{
            height: ITEM_H, display: 'flex', alignItems: 'center',
            justifyContent: 'center', scrollSnapAlign: 'center',
            fontSize: 22, fontWeight: 700,
            color: v === selected ? '#1B6B3A' : '#999',
          }}>{v}</div>
        ))}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

// 정수 목록 생성
const makeIntegers = (min, max) => {
  const arr = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
};
const DECIMALS = [0,1,2,3,4,5,6,7,8,9];

export default function TempPicker({ label, labelEn, value, onChange, min = -20, max = 80, onClose }) {
  const parsed = value !== '' && value != null ? parseFloat(value) : 0;
  const initInt = Math.trunc(parsed);
  const initDec = Math.round(Math.abs(parsed % 1) * 10);

  const [intVal, setIntVal] = useState(
    Math.max(min, Math.min(max, initInt))
  );
  const [decVal, setDecVal] = useState(initDec);

  const integers = makeIntegers(min, max);

  const handleConfirm = () => {
    const sign = intVal < 0 ? -1 : 1;
    const result = (Math.abs(intVal) + decVal / 10) * sign;
    onChange(String(result.toFixed(1)));
    onClose();
  };

  const displayValue = `${intVal >= 0 ? '+' : ''}${intVal}.${decVal} ℃`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', background: 'white',
        borderRadius: '20px 20px 0 0',
        padding: '16px 20px 36px',
      }}>
        <div style={{ width: 40, height: 4, background: '#ddd', borderRadius: 2, margin: '0 auto 14px' }} />
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{label}</span>
          <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>({labelEn})</span>
        </div>
        <div style={{
          textAlign: 'center', fontSize: 28, fontWeight: 800,
          color: '#1B6B3A', marginBottom: 16,
        }}>{displayValue}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Drum items={integers} selected={intVal} onChange={setIntVal} />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#555', marginBottom: 4 }}>.</div>
          <Drum items={DECIMALS} selected={decVal} onChange={setDecVal} />
          <div style={{ fontSize: 18, color: '#555', marginLeft: 4 }}>℃</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, borderRadius: 12, border: '1.5px solid #e0e0e0',
            background: 'white', fontSize: 14, fontWeight: 600, color: '#666', cursor: 'pointer',
          }}>취소</button>
          <button onClick={handleConfirm} style={{
            flex: 2, padding: 14, borderRadius: 12, border: 'none',
            background: '#1B6B3A', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer',
          }}>확인</button>
        </div>
      </div>
    </div>
  );
}
