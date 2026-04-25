// PDF 생성
// 페이지 순서: 1(검사표) → 1-1(사진) → 종합의견

import { STANDARDS, PHOTO_SECTIONS } from '../constants/standards';

const styleCSS = `
* { box-sizing: border-box; }
body {
  font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, sans-serif;
  margin: 0; padding: 0; color: #000; background: white; font-size: 10pt;
}
@page { size: A4; margin: 12mm 10mm; }
.page { width: 100%; page-break-after: always; }
.page:last-child { page-break-after: auto; }

.title-bar { font-size: 13pt; font-weight: 800; margin-bottom: 5pt; }
.subtitle-bar {
  display: flex; justify-content: space-between;
  font-size: 9pt; color: #444; margin-bottom: 7pt;
}

table { width: 100%; border-collapse: collapse; margin-bottom: 6pt; }
th, td {
  border: 1px solid #555; padding: 4pt 5pt;
  font-size: 8.5pt; vertical-align: middle; word-break: keep-all;
}
th { background: #C5E0B4; font-weight: 700; text-align: center; }
th.dark { background: #92D050; }

.section-cell {
  background: #E2EFDA; font-weight: 700;
  text-align: center; vertical-align: middle; width: 68pt;
}
.label-cell { font-weight: 600; background: #fafafa; width: 118pt; }
.std-cell { text-align: center; background: #f5f5f5; width: 98pt; font-size: 8pt; }
.value-cell { text-align: center; font-weight: 700; color: #c00; width: 68pt; }
.value-cell.ok { color: #2e7d32; }
.value-cell.ng { color: #c00; }
.value-cell.na { color: #888; }
.remark-cell { font-size: 8pt; color: #c00; }

/* 검사자 정보 행 */
.info-row td { background: #f0f7f3; font-size: 8.5pt; padding: 4pt 6pt; }
.info-label { font-weight: 700; color: #1B6B3A; width: 90pt; }
.info-value { font-weight: 600; color: #000; }

/* 종합의견 */
.opinion-table td {
  background: #DEEBF7; vertical-align: top;
  white-space: pre-wrap; font-size: 9pt; line-height: 1.6;
}

/* 사진 */
.photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6pt; }
.photo-item { border: 1px solid #555; padding: 4pt; }
.ph-label {
  font-size: 8.5pt; font-weight: 700; text-align: center;
  margin-bottom: 3pt; padding-bottom: 3pt; border-bottom: 1px solid #ddd;
}
.ph-imgs { display: grid; grid-template-columns: 1fr 1fr; gap: 3pt; }
.ph-imgs img { width: 100%; height: 78pt; object-fit: cover; border: 1px solid #aaa; display: block; }
.no-photo {
  width: 100%; height: 78pt; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 8pt; color: #aaa; border: 1px dashed #bbb; grid-column: 1/-1;
}

.print-controls {
  position: fixed; top: 10px; right: 10px;
  display: flex; gap: 8px; z-index: 9999;
}
.print-controls button {
  padding: 8px 16px; border: none; border-radius: 6px;
  font-weight: 700; cursor: pointer; font-size: 13px;
}
.btn-print { background: #1B6B3A; color: white; }
.btn-close { background: #777; color: white; }
@media print { .print-controls { display: none !important; } }
`;

const vcls = (result) => result === '만족' ? 'ok' : result === '불만족' ? 'ng' : 'na';
const vtext = (item, std) => {
  if (!item || item.value === '' || item.value == null) return '-';
  return `${item.value}${std?.unit ? ' ' + std.unit : ''}`;
};
const rtext = (item) => item?.result || '미입력';
const rmtext = (item) => item?.reason || (item?.result === '만족' ? '만족' : '');

const renderPhotoSection = (section, photos) => {
  const imgHTML = photos.length > 0
    ? photos.map(src => `<img src="${src}" alt="${section.label}" />`).join('')
    : `<div class="no-photo">사진 없음</div>`;
  return `
    <div class="photo-item">
      <div class="ph-label">${section.label} (${section.en})</div>
      <div class="ph-imgs">${imgHTML}</div>
    </div>`;
};

const buildHTML = (report) => {
  const r = report;
  const it = r.items || {};
  const basic = r.basic || {};
  const inspector = `${r.inspector?.name || ''} (${r.inspector?.affiliation || ''})`;
  const location = basic.inspectionLocation || 'HHI YARD';

  const spKeys = ['workSpeed', 'heatingState', 'dust', 'millScale', 'profile', 'dft', 'waterSolubleSalts'];
  const othKeys = ['facilityManagement', 'materialManagement', 'paintManagement', 'reportManagement', 'mekTest'];

  const spRows = spKeys.map((k, idx) => {
    const std = STANDARDS[k];
    const item = it[k];
    const cls = vcls(item?.result);
    const stdTxt = std.standard && std.standard !== '-'
      ? `${std.standard}${std.unit ? ' ' + std.unit : ''}` : '-';
    if (idx === 0) {
      return `
      <tr>
        <td class="section-cell" rowspan="${spKeys.length}">Surface<br/>Preparation</td>
        <td class="label-cell">${std.label}<br/><span style="font-size:7.5pt;color:#666;">(${std.labelEn})</span></td>
        <td class="std-cell">${stdTxt}</td>
        <td class="value-cell ${cls}">${vtext(item, std)}</td>
        <td class="value-cell ${cls}">${rtext(item)}</td>
        <td class="remark-cell">${rmtext(item)}</td>
      </tr>`;
    }
    return `
      <tr>
        <td class="label-cell">${std.label}<br/><span style="font-size:7.5pt;color:#666;">(${std.labelEn})</span></td>
        <td class="std-cell">${stdTxt}</td>
        <td class="value-cell ${cls}">${vtext(item, std)}</td>
        <td class="value-cell ${cls}">${rtext(item)}</td>
        <td class="remark-cell">${rmtext(item)}</td>
      </tr>`;
  }).join('');

  const ab = it.abrasivesConductivity;
  const abCls = vcls(ab?.result);

  const rhCls = vcls(it.relHumidity?.result);
  const stCls = vcls(it.surfaceTemp?.result);

  const othRows = othKeys.map((k, idx) => {
    const std = STANDARDS[k];
    const item = it[k];
    const cls = vcls(item?.result);
    const stdTxt = std.standard && std.standard !== '-' ? std.standard : '-';
    if (idx === 0) {
      return `
      <tr>
        <td class="section-cell" rowspan="${othKeys.length}">기타사항<br/>(The others)</td>
        <td class="label-cell">${std.label}<br/><span style="font-size:7.5pt;color:#666;">(${std.labelEn})</span></td>
        <td class="std-cell">${stdTxt}</td>
        <td class="value-cell ${cls}">${rtext(item)}</td>
        <td class="value-cell ${cls}">${rtext(item)}</td>
        <td class="remark-cell">${rmtext(item)}</td>
      </tr>`;
    }
    return `
      <tr>
        <td class="label-cell">${std.label}<br/><span style="font-size:7.5pt;color:#666;">(${std.labelEn})</span></td>
        <td class="std-cell">${stdTxt}</td>
        <td class="value-cell ${cls}">${rtext(item)}</td>
        <td class="value-cell ${cls}">${rtext(item)}</td>
        <td class="remark-cell">${rmtext(item)}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<title>${r.id}</title>
<style>${styleCSS}</style>
</head>
<body>
<div class="print-controls">
  <button class="btn-print" onclick="window.print()">🖨 인쇄 / PDF 저장</button>
  <button class="btn-close" onclick="window.close()">닫기</button>
</div>

<!-- ====== 1페이지: 검사표 ====== -->
<div class="page">
  <div class="title-bar">1. Inspection Report for Primary Surface Preparation</div>
  <div class="subtitle-bar">
    <span>시스템품질경영1부 - 도장품질보증과</span>
    <span>${basic.inspectionDate || ''}</span>
  </div>

  <!-- 검사정보 (표 위에) -->
  <table style="margin-bottom:4pt;">
    <tbody>
      <tr>
        <td style="background:#f0f7f3;font-weight:700;color:#1B6B3A;width:100pt;font-size:8.5pt;">Inspection Date</td>
        <td style="font-weight:700;color:#c00;font-size:8.5pt;width:120pt;">${basic.inspectionDate || '-'}</td>
        <td style="background:#f0f7f3;font-weight:700;color:#1B6B3A;width:80pt;font-size:8.5pt;">Inspector</td>
        <td style="font-weight:700;font-size:8.5pt;">${inspector}</td>
      </tr>
      <tr>
        <td style="background:#f0f7f3;font-weight:700;color:#1B6B3A;font-size:8.5pt;">Report ID</td>
        <td colspan="3" style="font-family:monospace;font-size:8.5pt;font-weight:700;">${r.id}</td>
      </tr>
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th rowspan="2" style="width:68pt;">관리항목<br/>(Management Item)</th>
        <th colspan="2">표준 (Standard)</th>
        <th style="width:68pt;">${location}</th>
        <th style="width:52pt;">판정</th>
        <th>Remarks</th>
      </tr>
      <tr>
        <th class="dark" colspan="2" style="font-size:8pt;">검사 기준</th>
        <th class="dark" style="color:#c00;font-size:8pt;">측정값</th>
        <th class="dark" style="font-size:8pt;">결과</th>
        <th class="dark" style="font-size:8pt;">비고</th>
      </tr>
    </thead>
    <tbody>
      ${spRows}

      <!-- Abrasives -->
      <tr>
        <td class="section-cell">Abrasives</td>
        <td class="label-cell">연마재 전기전도도<br/><span style="font-size:7.5pt;color:#666;">(Abrasives Conductivity)</span></td>
        <td class="std-cell">≤ 250 uS/cm</td>
        <td class="value-cell ${abCls}">${ab?.value || '-'} uS/cm</td>
        <td class="value-cell ${abCls}">${rtext(ab)}</td>
        <td class="remark-cell">${rmtext(ab)}</td>
      </tr>

      <!-- Environmental -->
      <tr>
        <td class="section-cell" rowspan="4">Environmental<br/>Condition</td>
        <td class="label-cell">건구온도 / 습구온도<br/><span style="font-size:7.5pt;color:#666;">(Dry Bulb / Wet Bulb)</span></td>
        <td class="std-cell">-</td>
        <td class="value-cell">${it.dryBulb?.value || '-'} / ${it.wetBulb?.value || '-'} ℃</td>
        <td class="value-cell na">-</td>
        <td class="remark-cell">Wet bulb : ${it.wetBulb?.value || '-'}℃</td>
      </tr>
      <tr>
        <td class="label-cell">상대습도<br/><span style="font-size:7.5pt;color:#666;">(Relative Humidity)</span></td>
        <td class="std-cell">&lt; 85 %</td>
        <td class="value-cell ${rhCls}">${it.relHumidity?.value || '-'} %</td>
        <td class="value-cell ${rhCls}">${rtext(it.relHumidity)}</td>
        <td class="remark-cell">자동계산 (Magnus)</td>
      </tr>
      <tr>
        <td class="label-cell">이슬점<br/><span style="font-size:7.5pt;color:#666;">(Dew Point)</span></td>
        <td class="std-cell">철판온도 &gt; DP+3℃</td>
        <td class="value-cell">${it.dewPoint?.value || '-'} ℃</td>
        <td class="value-cell na">-</td>
        <td class="remark-cell">자동계산 (Magnus)</td>
      </tr>
      <tr>
        <td class="label-cell">철판온도<br/><span style="font-size:7.5pt;color:#666;">(Surface Temp.)</span></td>
        <td class="std-cell">&gt; 이슬점 + 3℃</td>
        <td class="value-cell ${stCls}">${it.surfaceTemp?.value || '-'} ℃</td>
        <td class="value-cell ${stCls}">${rtext(it.surfaceTemp)}</td>
        <td class="remark-cell">${rmtext(it.surfaceTemp)}</td>
      </tr>

      ${othRows}


    </tbody>
  </table>
</div>

<!-- ====== 2페이지: 사진 (1-1) ====== -->
<div class="page">
  <div class="title-bar">1. Inspection Report for Primary Surface Preparation (Photos)</div>
  <div class="subtitle-bar">
    <span>시스템품질경영1부 - 도장품질보증과</span>
    <span>Inspection Area : ${location} &nbsp;|&nbsp; ${basic.hullNo || '-'} / ${basic.steelPlateNo || '-'}</span>
  </div>
  <div class="photo-grid">
    ${PHOTO_SECTIONS.map(s => renderPhotoSection(s, r.photos[s.key] || [])).join('')}
  </div>
</div>

<!-- ====== 3페이지: 종합의견 ====== -->
<div class="page">
  <div class="title-bar" style="font-size:12pt;">
    ※ 종합 의견 (Integrate Opinion of Inspection)
  </div>
  <div class="subtitle-bar">
    <span>시스템품질경영1부 - 도장품질보증과</span>
    <span>${basic.inspectionDate || ''}</span>
  </div>
  <table class="opinion-table">
    <thead>
      <tr>
        <th style="width:70%;">${location}</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="min-height:80pt; padding: 10pt;">
          ${(r.opinion || '').replace(/</g, '&lt;').replace(/\n/g, '<br/>')}
        </td>
        <td style="text-align:center;vertical-align:top;padding-top:10pt;color:#c00;font-weight:700;font-size:9.5pt;">
          ${basic.hullNo || '-'}<br/><br/>
          ${basic.steelPlateNo || '-'}
        </td>
      </tr>
    </tbody>
  </table>
  <div style="margin-top:14pt;font-size:9pt;">
    <strong>Inspection Date:</strong>
    <span style="color:#c00;font-weight:700;"> ${basic.inspectionDate || '-'}</span>
    &emsp;
    <strong>Inspector:</strong>
    <span style="font-weight:700;"> ${inspector}</span>
    &emsp;
    <strong>Report ID:</strong>
    <span style="font-family:monospace;"> ${r.id}</span>
  </div>
</div>

</body>
</html>`;
};

export const generatePDF = async (report) => {
  const html = buildHTML(report);
  const win = window.open('', '_blank');
  if (!win) throw new Error('팝업이 차단되었습니다. 팝업을 허용해주세요.');
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
};
