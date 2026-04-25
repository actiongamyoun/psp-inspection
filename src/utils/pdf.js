// PDF 생성 - 원본 엑셀 양식 재현
// 새 창에 HTML 렌더링 후 print → 사용자가 "PDF로 저장" 선택

import { STANDARDS, PHOTO_SECTIONS } from '../constants/standards';

const styleCSS = `
* { box-sizing: border-box; }
body {
  font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, sans-serif;
  margin: 0;
  padding: 0;
  color: #000;
  background: white;
  font-size: 10pt;
}
@page {
  size: A4;
  margin: 12mm 10mm;
}
.page {
  width: 100%;
  page-break-after: always;
  padding: 0;
}
.page:last-child { page-break-after: auto; }

.title-bar {
  font-size: 14pt;
  font-weight: 800;
  margin-bottom: 6pt;
  color: #000;
}

.subtitle-bar {
  display: flex;
  justify-content: space-between;
  font-size: 9pt;
  color: #444;
  margin-bottom: 8pt;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8pt;
}

th, td {
  border: 1px solid #333;
  padding: 5pt 6pt;
  font-size: 9pt;
  vertical-align: middle;
  word-break: keep-all;
}

th {
  background: #C5E0B4;
  font-weight: 700;
  text-align: center;
}

th.dark { background: #92D050; }

.section-cell {
  background: #E2EFDA;
  font-weight: 700;
  text-align: center;
  vertical-align: middle;
  width: 90pt;
}

.label-cell {
  font-weight: 600;
  background: #fafafa;
  width: 130pt;
}

.std-cell {
  text-align: center;
  background: #f5f5f5;
  width: 110pt;
  font-size: 8.5pt;
}

.value-cell {
  text-align: center;
  font-weight: 700;
  color: #c00;
  width: 80pt;
}

.value-cell.ok { color: #2e7d32; }
.value-cell.ng { color: #c00; }

.remark-cell {
  font-size: 8.5pt;
  color: #c00;
}

.opinion-table td {
  background: #DEEBF7;
  vertical-align: top;
  white-space: pre-wrap;
  font-size: 9pt;
  line-height: 1.55;
}

.photo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8pt;
  margin-bottom: 8pt;
}

.photo-item {
  border: 1px solid #333;
  padding: 4pt;
}

.photo-item .ph-label {
  font-size: 9pt;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4pt;
}

.photo-item .ph-imgs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3pt;
}

.photo-item img {
  width: 100%;
  height: 90pt;
  object-fit: cover;
  border: 1px solid #999;
}

.photo-item .ph-remark {
  font-size: 8.5pt;
  color: #c00;
  text-align: center;
  margin-top: 4pt;
  font-weight: 700;
}

.no-photo {
  width: 100%;
  height: 90pt;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8pt;
  color: #999;
  border: 1px dashed #999;
}

.summary-row {
  background: #DEEBF7;
  font-weight: 700;
}

.print-controls {
  position: fixed;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 9999;
}

.print-controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
}

.print-controls .print {
  background: #1B6B3A;
  color: white;
}

.print-controls .close {
  background: #777;
  color: white;
}

@media print {
  .print-controls { display: none !important; }
  body { background: white; }
}
`;

// 항목별 row 렌더링
const renderItemRow = (key, item) => {
  const std = STANDARDS[key];
  if (!std) return '';
  const ok = item?.result === '만족';
  const ng = item?.result === '불만족';
  const cls = ok ? 'ok' : ng ? 'ng' : '';
  const valueText = item?.value !== '' && item?.value != null
    ? `${item.value}${std.unit ? ` ${std.unit}` : ''}`
    : '-';
  const stdText = std.standard && std.standard !== '-'
    ? `${std.standard}${std.unit ? ` ${std.unit}` : ''}`
    : '-';
  const resultText = item?.result || '미입력';
  const reasonText = item?.reason || (ok ? '만족' : '');
  
  return `
    <tr>
      <td class="label-cell">${std.label}<br/><span style="font-size: 8pt; color: #666; font-weight: 400;">(${std.labelEn})</span></td>
      <td class="std-cell">${stdText}</td>
      <td class="value-cell ${cls}">${valueText}</td>
      <td class="value-cell ${cls}">${resultText}</td>
      <td class="remark-cell">${reasonText}</td>
    </tr>
  `;
};

// 사진 섹션 렌더링
const renderPhotoSection = (section, photos) => {
  const imgs = photos.length > 0
    ? photos.map(src => `<img src="${src}" />`).join('')
    : `<div class="no-photo">사진 없음</div>`;
  
  return `
    <div class="photo-item">
      <div class="ph-label">${section.label} (${section.en})</div>
      <div class="ph-imgs">${imgs}</div>
    </div>
  `;
};

const buildHTML = (report) => {
  const r = report;
  const inspector = `${r.inspector?.name || ''} (${r.inspector?.affiliation || ''})`;
  
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${r.id}</title>
<style>${styleCSS}</style>
</head>
<body>
<div class="print-controls">
  <button class="print" onclick="window.print()">🖨 인쇄 / PDF 저장</button>
  <button class="close" onclick="window.close()">닫기</button>
</div>

<!-- ====== 1페이지 ====== -->
<div class="page">
  <div class="title-bar">1. Inspection Report for Primary Surface Preparation</div>
  <div class="subtitle-bar">
    <span>시스템품질경영1부 - 도장품질보증과</span>
    <span>${r.basic.inspectionDate || ''}</span>
  </div>
  
  <table>
    <thead>
      <tr>
        <th rowspan="2" style="width: 90pt;">관리항목<br/>(Management Item)</th>
        <th colspan="2">표준 (Standard)</th>
        <th>${r.basic.inspectionLocation || 'HHI Yard'}</th>
        <th>판정</th>
        <th>Remarks</th>
      </tr>
      <tr>
        <th class="dark" colspan="2" style="font-size: 8.5pt;">검사 기준</th>
        <th class="dark" style="color: #c00; font-size: 8.5pt;">측정값</th>
        <th class="dark" style="font-size: 8.5pt;">결과</th>
        <th class="dark" style="font-size: 8.5pt;">비고</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="section-cell" rowspan="7">Surface<br/>Preparation</td>
      </tr>
      ${['workSpeed', 'heatingState', 'dust', 'millScale', 'profile', 'dft', 'waterSolubleSalts'].map(k => renderItemRow(k, r.items[k])).join('')}
      
      <tr>
        <td class="section-cell">Abrasives</td>
        ${(() => {
          const item = r.items.abrasivesConductivity;
          const std = STANDARDS.abrasivesConductivity;
          const ok = item?.result === '만족';
          const cls = ok ? 'ok' : item?.result === '불만족' ? 'ng' : '';
          return `
            <td class="std-cell">${std.standard} ${std.unit}</td>
            <td class="value-cell ${cls}">${item?.value || '-'}</td>
            <td class="value-cell ${cls}">${item?.result || '미입력'}</td>
            <td class="remark-cell">${item?.reason || (ok ? '만족' : '')}</td>
          `;
        })()}
      </tr>
      
      <tr>
        <td class="section-cell" rowspan="6">Environmental<br/>Condition</td>
      </tr>
      <tr>
        <td class="label-cell">건구온도 (Dry Bulb)</td>
        <td class="std-cell">-</td>
        <td class="value-cell">${r.items.dryBulb.value || '-'} ℃</td>
        <td class="value-cell">${r.items.wetBulb.value !== '' ? `Wet: ${r.items.wetBulb.value}℃` : '-'}</td>
        <td class="remark-cell">습구온도 ${r.items.wetBulb.value || '-'}℃</td>
      </tr>
      <tr>
        <td class="label-cell">상대습도 (Relative Humidity)</td>
        <td class="std-cell">${STANDARDS.relHumidity.standard} ${STANDARDS.relHumidity.unit}</td>
        <td class="value-cell ${r.items.relHumidity.result === '만족' ? 'ok' : r.items.relHumidity.result === '불만족' ? 'ng' : ''}">${r.items.relHumidity.value || '-'} %</td>
        <td class="value-cell ${r.items.relHumidity.result === '만족' ? 'ok' : r.items.relHumidity.result === '불만족' ? 'ng' : ''}">${r.items.relHumidity.result || '미입력'}</td>
        <td class="remark-cell">자동계산 (Magnus)</td>
      </tr>
      <tr>
        <td class="label-cell">이슬점 (Dew Point)</td>
        <td class="std-cell">철판온도 &gt; DP+3℃</td>
        <td class="value-cell">${r.items.dewPoint.value || '-'} ℃</td>
        <td class="value-cell">-</td>
        <td class="remark-cell">자동계산 (Magnus)</td>
      </tr>
      ${renderItemRow('surfaceTemp', r.items.surfaceTemp)}
      
      <tr>
        <td class="section-cell" rowspan="6">기타사항<br/>(The others)</td>
      </tr>
      ${['facilityManagement', 'materialManagement', 'paintManagement', 'reportManagement', 'mekTest'].map(k => renderItemRow(k, r.items[k])).join('')}
    </tbody>
  </table>
  
  <div class="title-bar" style="margin-top: 14pt; font-size: 11pt;">※ 종합 의견 (Integrate Opinion of Inspection)</div>
  <table class="opinion-table">
    <thead>
      <tr>
        <th style="width: 70%;">${r.basic.inspectionLocation || 'HHI YARD'}</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${(r.opinion || '').replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</td>
        <td style="text-align: center; vertical-align: top; padding-top: 8pt; color: #c00; font-weight: 700; font-size: 9pt;">
          ${r.basic.hullNo || '-'}<br/>
          ${r.basic.steelPlateNo || '-'}
        </td>
      </tr>
    </tbody>
  </table>
  
  <div style="margin-top: 12pt; font-size: 9pt;">
    <strong>Inspection Date:</strong> <span style="color: #c00; font-weight: 700;">${r.basic.inspectionDate || '-'}</span>
    &nbsp;&nbsp;&nbsp;
    <strong>Inspector:</strong> <span style="font-weight: 700;">${inspector}</span>
    &nbsp;&nbsp;&nbsp;
    <strong>Report ID:</strong> <span style="font-family: monospace;">${r.id}</span>
  </div>
</div>

<!-- ====== 2페이지 - 사진 ====== -->
<div class="page">
  <div class="title-bar">1-1. Inspection Report for Primary Surface Preparation</div>
  <div class="subtitle-bar">
    <span>시스템품질경영1부 - 도장품질보증과</span>
    <span>Inspection Area : ${r.basic.inspectionLocation || 'HHI YARD'}</span>
  </div>
  
  <div class="photo-grid">
    ${PHOTO_SECTIONS.map(s => renderPhotoSection(s, r.photos[s.key] || [])).join('')}
  </div>
  
  <div style="margin-top: 12pt; font-size: 9pt; text-align: right;">
    Report ID: <span style="font-family: monospace;">${r.id}</span>
  </div>
</div>

<script>
  // 자동으로 인쇄 다이얼로그 띄우기 (선택)
  // window.addEventListener('load', () => setTimeout(() => window.print(), 500));
</script>
</body>
</html>
  `;
};

export const generatePDF = async (report) => {
  const html = buildHTML(report);
  const win = window.open('', '_blank');
  if (!win) {
    throw new Error('팝업이 차단되었습니다. 팝업을 허용해주세요.');
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
};
