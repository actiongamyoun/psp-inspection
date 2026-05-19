import ExcelJS from 'exceljs';
import { STANDARDS, PHOTO_SECTIONS } from '../constants/standards';

const ORG = '시스템품질경영부';

// Base64 → ArrayBuffer (사진 임베드용)
const base64ToArrayBuffer = (base64) => {
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

// 결과 색상
const getResultColor = (res) =>
  res === '만족' ? 'FF2E7D32' : res === '불만족' ? 'FFCC0000' : 'FF888888';

// 측정값 텍스트
const getValueText = (item, std) => {
  if (!item) return '-';
  if (std?.type === 'iso_dust' && item.dustDetail) {
    const d = item.dustDetail;
    if (d.size !== '' && d.quantity !== '') {
      return `입자:${d.size} / 먼지:${d.quantity}`;
    }
    return '-';
  }
  if (item.value === '' || item.value == null) return '-';
  return `${item.value}${std?.unit ? ' ' + std.unit : ''}`;
};

// 보더 공통
const BORDER = {
  top: { style: 'thin' },
  bottom: { style: 'thin' },
  left: { style: 'thin' },
  right: { style: 'thin' },
};

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5E0B4' } };
const SUB_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } };
const LABEL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F7F3' } };
const SECTION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
const STD_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
const LABEL_BG = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } };
const OPINION_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDEEBF7' } };

export const generateExcel = async (report, options = {}) => {
  const r = report;
  const it = r.items || {};
  const basic = r.basic || {};
  const inspector = `${r.inspector?.name || ''} (${r.inspector?.affiliation || ''})`;
  const location = basic.inspectionLocation || 'HHI YARD';

  const wb = new ExcelJS.Workbook();
  wb.creator = 'PSP REPORT';
  wb.created = new Date();

  // ============ 시트 1: 검사표 ============
  const s1 = wb.addWorksheet('1. 검사표', {
    pageSetup: {
      paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1,
      margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });

  s1.columns = [
    { width: 13 }, { width: 22 }, { width: 18 }, { width: 16 }, { width: 10 }, { width: 24 },
  ];

  // 제목
  s1.mergeCells('A1:F1');
  const t = s1.getCell('A1');
  t.value = '1. Inspection Report for Primary Surface Preparation';
  t.font = { size: 14, bold: true };
  t.alignment = { vertical: 'middle' };
  s1.getRow(1).height = 22;

  // 부제
  s1.mergeCells('A2:D2');
  s1.getCell('A2').value = `${ORG} - 도장품질보증과`;
  s1.getCell('A2').font = { size: 10, color: { argb: 'FF555555' } };
  s1.mergeCells('E2:F2');
  s1.getCell('E2').value = basic.inspectionDate || '';
  s1.getCell('E2').font = { size: 10, color: { argb: 'FF555555' } };
  s1.getCell('E2').alignment = { horizontal: 'right' };
  s1.getRow(3).height = 6;

  // 검사정보 박스
  const setLabel = (cell, text) => {
    const c = s1.getCell(cell);
    c.value = text;
    c.fill = LABEL_FILL;
    c.font = { bold: true, color: { argb: 'FF1B6B3A' }, size: 10 };
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = BORDER;
  };

  setLabel('A4', 'Inspection Date');
  s1.mergeCells('B4:C4');
  s1.getCell('B4').value = basic.inspectionDate || '-';
  s1.getCell('B4').font = { bold: true, color: { argb: 'FFCC0000' }, size: 11 };
  s1.getCell('B4').alignment = { vertical: 'middle', indent: 1 };
  ['B4', 'C4'].forEach(c => (s1.getCell(c).border = BORDER));

  setLabel('D4', 'Inspector');
  s1.mergeCells('E4:F4');
  s1.getCell('E4').value = inspector;
  s1.getCell('E4').font = { bold: true, size: 10 };
  s1.getCell('E4').alignment = { vertical: 'middle', indent: 1 };
  ['E4', 'F4'].forEach(c => (s1.getCell(c).border = BORDER));

  setLabel('A5', 'Report ID');
  s1.mergeCells('B5:F5');
  s1.getCell('B5').value = r.id || '';
  s1.getCell('B5').font = { bold: true, name: 'Consolas', size: 10 };
  s1.getCell('B5').alignment = { vertical: 'middle', indent: 1 };
  ['B5', 'C5', 'D5', 'E5', 'F5'].forEach(c => (s1.getCell(c).border = BORDER));

  s1.getRow(4).height = 22;
  s1.getRow(5).height = 22;
  s1.getRow(6).height = 6;

  // 검사표 헤더
  let row = 7;
  s1.mergeCells(`A${row}:A${row + 1}`);
  s1.getCell(`A${row}`).value = '관리항목\n(Management Item)';
  s1.mergeCells(`B${row}:C${row}`);
  s1.getCell(`B${row}`).value = '표준 (Standard)';
  s1.getCell(`D${row}`).value = location;
  s1.getCell(`E${row}`).value = '판정';
  s1.getCell(`F${row}`).value = 'Remarks';
  s1.getCell(`B${row + 1}`).value = '검사 기준';
  s1.getCell(`C${row + 1}`).value = '표준값';
  s1.getCell(`D${row + 1}`).value = '측정값';
  s1.getCell(`E${row + 1}`).value = '결과';
  s1.getCell(`F${row + 1}`).value = '비고';

  [`A${row}`, `B${row}`, `C${row}`, `D${row}`, `E${row}`, `F${row}`].forEach(c => {
    const cell = s1.getCell(c);
    cell.fill = HEADER_FILL;
    cell.font = { bold: true, size: 10 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = BORDER;
  });
  [`B${row + 1}`, `C${row + 1}`, `D${row + 1}`, `E${row + 1}`, `F${row + 1}`].forEach(c => {
    const cell = s1.getCell(c);
    cell.fill = SUB_HEADER_FILL;
    cell.font = { bold: true, size: 9 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER;
  });
  s1.getRow(row).height = 26;
  s1.getRow(row + 1).height = 18;

  // 검사 항목 데이터
  const sections = [
    {
      name: 'Surface\nPreparation',
      keys: ['workSpeed', 'heatingState', 'dust', 'millScale', 'profile', 'dft', 'waterSolubleSalts'],
    },
    {
      name: 'Abrasives',
      keys: ['abrasivesConductivity'],
    },
    {
      name: 'Environmental\nCondition',
      keys: ['dryBulb_wetBulb', 'relHumidity', 'dewPoint', 'surfaceTemp'],
    },
    {
      name: '기타사항\n(The others)',
      keys: ['facilityManagement', 'materialManagement', 'paintManagement', 'reportManagement', 'mekTest'],
    },
  ];

  let curRow = 9;
  sections.forEach(sec => {
    const startRow = curRow;
    sec.keys.forEach(key => {
      let label, std, val, res, rem;

      if (key === 'dryBulb_wetBulb') {
        label = '건구 / 습구온도\n(Dry / Wet Bulb)';
        std = '-';
        val = `${it.dryBulb?.value || '-'} / ${it.wetBulb?.value || '-'} ℃`;
        res = '-';
        rem = `Wet bulb : ${it.wetBulb?.value || '-'}℃`;
      } else {
        const stdDef = STANDARDS[key];
        const item = it[key];
        label = stdDef ? `${stdDef.label}\n(${stdDef.labelEn})` : key;
        std = stdDef?.standard && stdDef.standard !== '-'
          ? `${stdDef.standard}${stdDef.unit ? ' ' + stdDef.unit : ''}`
          : '-';
        val = getValueText(item, stdDef);
        res = item?.result || '미입력';
        rem = item?.reason || (item?.result === '만족' ? '만족' : '');
      }

      s1.getCell(`B${curRow}`).value = label;
      s1.getCell(`B${curRow}`).font = { size: 9 };
      s1.getCell(`B${curRow}`).alignment = { vertical: 'middle', wrapText: true, indent: 1 };
      s1.getCell(`B${curRow}`).fill = LABEL_BG;

      s1.getCell(`C${curRow}`).value = std;
      s1.getCell(`C${curRow}`).font = { size: 9 };
      s1.getCell(`C${curRow}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      s1.getCell(`C${curRow}`).fill = STD_FILL;

      const okColor = getResultColor(res);
      s1.getCell(`D${curRow}`).value = val;
      s1.getCell(`D${curRow}`).font = { bold: true, color: { argb: okColor }, size: 10 };
      s1.getCell(`D${curRow}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      s1.getCell(`E${curRow}`).value = res;
      s1.getCell(`E${curRow}`).font = { bold: true, color: { argb: okColor }, size: 10 };
      s1.getCell(`E${curRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

      s1.getCell(`F${curRow}`).value = rem;
      s1.getCell(`F${curRow}`).font = { size: 9, color: { argb: 'FFCC0000' } };
      s1.getCell(`F${curRow}`).alignment = { vertical: 'middle', wrapText: true, indent: 1 };

      ['A', 'B', 'C', 'D', 'E', 'F'].forEach(col => {
        s1.getCell(`${col}${curRow}`).border = BORDER;
      });
      s1.getRow(curRow).height = 30;

      curRow++;
    });

    // 섹션 셀 병합
    const endRow = curRow - 1;
    if (endRow > startRow) {
      s1.mergeCells(`A${startRow}:A${endRow}`);
    }
    s1.getCell(`A${startRow}`).value = sec.name;
    s1.getCell(`A${startRow}`).fill = SECTION_FILL;
    s1.getCell(`A${startRow}`).font = { bold: true, size: 10 };
    s1.getCell(`A${startRow}`).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    s1.getCell(`A${startRow}`).border = BORDER;
  });

  // ============ 시트 2: 사진 + 종합의견 ============
  const s2 = wb.addWorksheet('2. 사진 & 종합의견', {
    pageSetup: {
      paperSize: 9, orientation: 'portrait', fitToPage: true,
      margins: { left: 0.4, right: 0.4, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 },
    },
  });
  s2.columns = [{ width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];

  // 제목
  s2.mergeCells('A1:D1');
  s2.getCell('A1').value = '2. Inspection Report for Primary Surface Preparation (Photos)';
  s2.getCell('A1').font = { size: 13, bold: true };
  s2.getRow(1).height = 22;

  s2.mergeCells('A2:D2');
  s2.getCell('A2').value = `Inspection Area : ${location} | ${basic.hullNo || '-'} / ${basic.steelPlateNo || '-'}`;
  s2.getCell('A2').font = { size: 9, color: { argb: 'FF555555' } };
  s2.getRow(3).height = 4;

  // 사진 8섹션, 2장씩 (2x4 배치)
  let pRow = 4;
  PHOTO_SECTIONS.forEach((section, i) => {
    const isLeft = i % 2 === 0;
    const cols = isLeft ? ['A', 'B'] : ['C', 'D'];
    if (i % 2 === 0 && i > 0) pRow += 9;

    // 라벨
    s2.mergeCells(`${cols[0]}${pRow}:${cols[1]}${pRow}`);
    s2.getCell(`${cols[0]}${pRow}`).value = `${section.label} (${section.en})`;
    s2.getCell(`${cols[0]}${pRow}`).fill = LABEL_FILL;
    s2.getCell(`${cols[0]}${pRow}`).font = { bold: true, size: 9 };
    s2.getCell(`${cols[0]}${pRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
    s2.getCell(`${cols[0]}${pRow}`).border = BORDER;
    s2.getCell(`${cols[1]}${pRow}`).border = BORDER;
    s2.getRow(pRow).height = 18;

    // 사진 영역 (8행)
    for (let r = pRow + 1; r <= pRow + 8; r++) {
      cols.forEach(col => {
        s2.getCell(`${col}${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        s2.getCell(`${col}${r}`).border = BORDER;
      });
      s2.getRow(r).height = 16;
    }

    // 사진 임베드
    const photos = (report.photos[section.key] || []).slice(0, 2);
    photos.forEach((src, idx) => {
      try {
        const imageId = wb.addImage({
          buffer: base64ToArrayBuffer(src),
          extension: 'jpeg',
        });
        // 왼쪽 사진 → cols[0] 칸, 오른쪽 사진 → cols[1] 칸
        const colIdx = isLeft ? idx : (idx + 2);
        const colLetter = ['A', 'B', 'C', 'D'][colIdx];
        s2.addImage(imageId, `${colLetter}${pRow + 1}:${colLetter}${pRow + 8}`);
      } catch (e) {
        console.error('사진 임베드 실패:', e);
      }
    });
  });

  // 종합의견 - 사진 아래
  let opRow = pRow + 10;
  s2.mergeCells(`A${opRow}:D${opRow}`);
  s2.getCell(`A${opRow}`).value = '3. 종합 의견 (Integrate Opinion of Inspection)';
  s2.getCell(`A${opRow}`).font = { size: 12, bold: true };
  s2.getRow(opRow).height = 22;
  opRow++;

  s2.mergeCells(`A${opRow}:C${opRow}`);
  s2.getCell(`A${opRow}`).value = location;
  s2.getCell(`A${opRow}`).fill = HEADER_FILL;
  s2.getCell(`A${opRow}`).font = { bold: true, size: 10 };
  s2.getCell(`A${opRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  s2.getCell(`D${opRow}`).value = 'Remarks';
  s2.getCell(`D${opRow}`).fill = HEADER_FILL;
  s2.getCell(`D${opRow}`).font = { bold: true, size: 10 };
  s2.getCell(`D${opRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
  ['A', 'B', 'C', 'D'].forEach(col => (s2.getCell(`${col}${opRow}`).border = BORDER));
  opRow++;

  const opEnd = opRow + 5;
  s2.mergeCells(`A${opRow}:C${opEnd}`);
  s2.getCell(`A${opRow}`).value = r.opinion || '';
  s2.getCell(`A${opRow}`).font = { size: 9 };
  s2.getCell(`A${opRow}`).alignment = { vertical: 'top', wrapText: true, indent: 1 };
  s2.getCell(`A${opRow}`).fill = OPINION_FILL;

  s2.mergeCells(`D${opRow}:D${opEnd}`);
  s2.getCell(`D${opRow}`).value = '';
  s2.getCell(`D${opRow}`).alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
  s2.getCell(`D${opRow}`).fill = OPINION_FILL;

  for (let rr = opRow; rr <= opEnd; rr++) {
    ['A', 'B', 'C', 'D'].forEach(col => (s2.getCell(`${col}${rr}`).border = BORDER));
    s2.getRow(rr).height = 20;
  }

  // 하단 정보
  const botRow = opEnd + 2;
  s2.mergeCells(`A${botRow}:D${botRow}`);
  s2.getCell(`A${botRow}`).value =
    `Inspection Date: ${basic.inspectionDate || '-'}    Inspector: ${inspector}    Report ID: ${r.id || ''}`;
  s2.getCell(`A${botRow}`).font = { size: 9 };

  // Blob 생성
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // 다운로드 (옵션)
  if (options.download !== false) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.id || 'PSP_REPORT'}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Blob 반환 (드라이브 업로드용)
  return blob;
};
