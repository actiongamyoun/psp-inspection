import { useRef, useEffect } from 'react';

// 인라인 드럼 - 큰 숫자가 직접 스크롤
const ITEM_H = 60;

function Drum({ items, selected, onChange, wide = false }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const idx = items.indexOf(selected);
      ref.current.scrollTop = Math.max(0, idx) * ITEM_H;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 외부에서 selected가 바뀌면 스크롤 위치 동기화 (초기화 등)
  useEffect(() => {
    if (ref.current) {
      const idx = items.indexOf(selected);
      const expected = Math.max(0, idx) * ITEM_H;
      if (Math.abs(ref.current.scrollTop - expected) > ITEM_H / 2) {
        ref.current.scrollTop = expected;
      }
    }
  }, [selected, items]);

  let scrollTimer = null;
  const handleScroll = () => {
    if (!ref.current) return;
    if (scrollTimer) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const i = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(i, items.length - 1));
      // 정확한 위치로 스냅
      ref.current.scrollTop = clamped * ITEM_H;
      if (items[clamped] !== selected) onChange(items[clamped]);
    }, 80);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      style={{
        width: wide ? 56 : 36,
        height: ITEM_H,
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
      }}
      className="temp-drum"
    >
      {items.map(v => (
        <div
          key={v}
          style={{
            height: ITEM_H,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
            fontWeight: 800,
            color: '#1B6B3A',
            scrollSnapAlign: 'center',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

const makeIntegers = (min, max) => {
  const arr = [];
  for (let i = min; i <= max; i++) arr.push(i);
  return arr;
};
const DECIMALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function TempPicker({ value, onChange, min = -20, max = 80 }) {
  const parsed = value !== '' && value != null ? parseFloat(value) : 0;
  const initInt = Math.trunc(parsed) || 0;
  const initDec = Math.round(Math.abs(parsed % 1) * 10) || 0;

  const intVal = Math.max(min, Math.min(max, initInt));
  const decVal = Math.max(0, Math.min(9, initDec));

  const integers = makeIntegers(min, max);

  const update = (newInt, newDec) => {
    const sign = newInt < 0 ? -1 : 1;
    const result = (Math.abs(newInt) + newDec / 10) * sign;
    onChange(String(result.toFixed(1)));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      height: ITEM_H,
      borderBottom: '2px solid #1B6B3A',
      paddingBottom: 4,
    }}>
      <Drum
        items={integers}
        selected={intVal}
        onChange={(v) => update(v, decVal)}
        wide={true}
      />
      <div style={{
        fontSize: 32, fontWeight: 800, color: '#1B6B3A',
        margin: '0 2px', lineHeight: 1,
        alignSelf: 'flex-end', paddingBottom: 8,
      }}>.</div>
      <Drum
        items={DECIMALS}
        selected={decVal}
        onChange={(v) => update(intVal, v)}
      />
      <div style={{
        fontSize: 18, color: '#1B6B3A', fontWeight: 700,
        marginLeft: 6, alignSelf: 'flex-start', paddingTop: 14,
      }}>℃</div>
    </div>
  );
}
