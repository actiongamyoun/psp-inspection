/**
 * PSP REPORT - Google Apps Script
 * - 구글시트 데이터 저장
 * - Excel 파일 → 구글드라이브 PSP_REPORT(NO DELETE) 폴더 업로드
 * - 같은 ID 재출력 시 덮어쓰기
 * - 대시보드 데이터
 */

const SHEET_NAME = 'PSP_REPORTS';
const DRIVE_FOLDER_NAME = 'PSP_REPORT(NO DELETE)';

// ====== 시트 초기화 ======
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'ID', '상태', '제출일시', '검사일',
      '호선번호', '강재번호', '검사위치',
      '검사자', '소속',
      '작업속도(값)', '작업속도(판정)',
      '예열상태',
      '표면오염(판정)',
      'Mill Scale(판정)',
      '표면조도(값)', '표면조도(판정)',
      'DFT평균(값)', 'DFT평균(판정)',
      '염분도(값)', '염분도(판정)',
      '전기전도도(값)', '전기전도도(판정)',
      '건구온도', '습구온도',
      '상대습도(값)', '상대습도(판정)',
      '이슬점',
      '철판온도(값)', '철판온도(판정)',
      '공장설비관리', '자재관리', '도료관리', '전처리일지', 'MEK Test',
      '첨부사진수',
      '종합의견',
      'Excel 링크',
      '삭제일시', '삭제자',
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1B6B3A')
      .setFontColor('white')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

// ====== 드라이브 폴더 ======
function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

// ====== 응답 헬퍼 ======
function makeResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====== GET ======
function doGet(e) {
  const action = e?.parameter?.action;
  if (action === 'list') return makeResponse(listReports());
  if (action === 'dashboard') return makeResponse(dashboardData());
  return makeResponse({ ok: true, message: 'PSP REPORT API Ready' });
}

// ====== POST ======
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, report, excelBase64, fileName } = body;
    if (action === 'upload') return makeResponse(uploadReport(report));
    if (action === 'upload-excel') return makeResponse(uploadExcelToDrive(report, excelBase64, fileName));
    return makeResponse({ ok: false, error: '알 수 없는 액션' });
  } catch (err) {
    return makeResponse({ ok: false, error: err.message });
  }
}

// ====== 레포트 데이터 업로드 ======
function uploadReport(r) {
  try {
    const sheet = getOrCreateSheet();
    const items = r.items || {};
    const basic = r.basic || {};
    const inspector = r.inspector || {};
    const totalPhotos = Object.values(r.photos || {}).flat().length;

    const row = [
      r.id || '',
      r.status || '',
      r.submittedAt || new Date().toISOString(),
      basic.inspectionDate || '',
      basic.hullNo || '',
      basic.steelPlateNo || '',
      basic.inspectionLocation || '',
      inspector.name || '',
      inspector.affiliation || '',
      items.workSpeed?.value || '',
      items.workSpeed?.result || '',
      items.heatingState?.value || '',
      items.dust?.value || '',
      items.millScale?.result || '',
      items.profile?.value || '',
      items.profile?.result || '',
      items.dft?.value || '',
      items.dft?.result || '',
      items.waterSolubleSalts?.value || '',
      items.waterSolubleSalts?.result || '',
      items.abrasivesConductivity?.value || '',
      items.abrasivesConductivity?.result || '',
      items.dryBulb?.value || '',
      items.wetBulb?.value || '',
      items.relHumidity?.value || '',
      items.relHumidity?.result || '',
      items.dewPoint?.value || '',
      items.surfaceTemp?.value || '',
      items.surfaceTemp?.result || '',
      items.facilityManagement?.result || '',
      items.materialManagement?.result || '',
      items.paintManagement?.result || '',
      items.reportManagement?.result || '',
      items.mekTest?.result || '',
      totalPhotos,
      r.opinion || '',
      '', // Excel 링크 자리 (기존 보존)
      r.deletedAt || '',
      r.deletedBy || '',
    ];

    // 기존 ID 찾기
    const data = sheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === r.id) {
        // Excel 링크 보존
        const existingLink = data[i][36] || '';
        row[36] = existingLink;
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        highlightRow(sheet, i + 1, row);
        found = true;
        break;
      }
    }
    if (!found) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
      highlightRow(sheet, lastRow + 1, row);
    }

    return { ok: true, message: '업로드 완료' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ====== Excel 파일 드라이브 업로드 ======
function uploadExcelToDrive(report, excelBase64, fileName) {
  try {
    const folder = getOrCreateFolder();
    const finalFileName = fileName || `${report.id}.xlsx`;

    // 같은 이름 파일이 있으면 삭제 (덮어쓰기)
    const existing = folder.getFilesByName(finalFileName);
    while (existing.hasNext()) {
      existing.next().setTrashed(true);
    }

    // Base64 → Blob
    const cleanedBase64 = excelBase64.replace(/^data:.*;base64,/, '');
    const decoded = Utilities.base64Decode(cleanedBase64);
    const blob = Utilities.newBlob(
      decoded,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      finalFileName
    );

    const file = folder.createFile(blob);
    const url = file.getUrl();

    // 시트에 링크 업데이트
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === report.id) {
        sheet.getRange(i + 1, 37).setValue(url);
        sheet.getRange(i + 1, 37).setFontColor('#1976d2');
        break;
      }
    }

    return { ok: true, url, fileName: finalFileName };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ====== 불만족 강조 ======
function highlightRow(sheet, rowNum, row) {
  const judgeIndices = [10, 13, 15, 17, 19, 21, 25, 28, 29, 30, 31, 32, 33];
  judgeIndices.forEach(idx => {
    const cell = sheet.getRange(rowNum, idx + 1);
    const val = row[idx];
    if (val === '불만족') {
      cell.setBackground('#ffcdd2').setFontColor('#c62828');
    } else if (val === '만족') {
      cell.setBackground('#e8f5e9').setFontColor('#2e7d32');
    } else {
      cell.setBackground(null).setFontColor(null);
    }
  });

  if (row[1] === '삭제됨') {
    sheet.getRange(rowNum, 1, 1, row.length)
      .setBackground('#f5f5f5')
      .setFontColor('#999999');
  }
}

// ====== 레포트 목록 ======
function listReports() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, reports: [] };
    const headers = data[0];
    const reports = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    return { ok: true, reports };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ====== 대시보드 ======
function dashboardData() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { ok: true, total: 0, thisMonth: 0, byAffiliation: {}, recent: [], lastSubmittedBy: {} };
    }
    const headers = data[0];
    const idx = {
      id: headers.indexOf('ID'),
      status: headers.indexOf('상태'),
      submitted: headers.indexOf('제출일시'),
      date: headers.indexOf('검사일'),
      hull: headers.indexOf('호선번호'),
      location: headers.indexOf('검사위치'),
      inspector: headers.indexOf('검사자'),
      aff: headers.indexOf('소속'),
    };

    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;

    const byAffiliation = {};
    const lastSubmittedBy = {};
    let thisMonthCount = 0;
    const validReports = [];

    data.slice(1).forEach(row => {
      const status = row[idx.status];
      if (status === '삭제됨') return;

      const aff = row[idx.aff] || '미상';
      const submittedAt = row[idx.submitted];
      const inspectionDate = row[idx.date];

      let isThisMonth = false;
      if (inspectionDate) {
        const d = new Date(inspectionDate);
        if (!isNaN(d.getTime()) && d.getFullYear() === thisYear && d.getMonth() + 1 === thisMonth) {
          isThisMonth = true;
          thisMonthCount++;
        }
      }

      if (!byAffiliation[aff]) byAffiliation[aff] = { total: 0, thisMonth: 0 };
      byAffiliation[aff].total++;
      if (isThisMonth) byAffiliation[aff].thisMonth++;

      if (submittedAt) {
        const subStr = submittedAt.toString();
        if (!lastSubmittedBy[aff] || subStr > lastSubmittedBy[aff]) {
          lastSubmittedBy[aff] = subStr;
        }
      }

      validReports.push({
        id: row[idx.id],
        status: status,
        submittedAt: submittedAt ? submittedAt.toString() : '',
        inspectionDate: inspectionDate ? inspectionDate.toString() : '',
        hullNo: row[idx.hull],
        location: row[idx.location],
        inspector: row[idx.inspector],
        affiliation: aff,
      });
    });

    const recent = validReports
      .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
      .slice(0, 10);

    return {
      ok: true,
      total: validReports.length,
      thisMonth: thisMonthCount,
      byAffiliation,
      lastSubmittedBy,
      recent,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
