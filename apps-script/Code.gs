/**
 * PSP REPORT - Google Apps Script
 * 
 * 설정 방법:
 * 1. 구글시트 열기 → 확장 프로그램 → Apps Script
 * 2. 이 코드를 붙여넣기
 * 3. SHEET_NAME을 원하는 시트 이름으로 변경
 * 4. 배포 → 새 배포 → 웹앱 선택
 *    - 다음 사용자로 실행: 나
 *    - 액세스 권한: 모든 사용자
 * 5. 배포 URL을 앱 관리자 모드에 입력
 */

const SHEET_NAME = 'PSP_REPORTS';

// ====== 시트 초기화 ======
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    
    // 헤더 설정
    const headers = [
      'ID', '상태', '제출일시', '검사일',
      '호선번호', '강재번호', '검사위치',
      '검사자', '소속',
      // 표면처리
      '작업속도(값)', '작업속도(판정)',
      '예열상태',
      '표면오염(판정)',
      'Mill Scale(판정)',
      '표면조도(값)', '표면조도(판정)',
      'DFT평균(값)', 'DFT평균(판정)',
      '염분도(값)', '염분도(판정)',
      // 연마재
      '전기전도도(값)', '전기전도도(판정)',
      // 환경
      '건구온도', '습구온도',
      '상대습도(값)', '상대습도(판정)',
      '이슬점',
      '철판온도(값)', '철판온도(판정)',
      // 기타
      '공장설비관리', '자재관리', '도료관리', '전처리일지', 'MEK Test',
      // 사진수
      '첨부사진수',
      // 종합의견
      '종합의견',
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1B6B3A')
      .setFontColor('white')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // 열 너비 자동 조정
    sheet.autoResizeColumns(1, headers.length);
  }
  
  return sheet;
}

// ====== GET 요청 처리 ======
function doGet(e) {
  const action = e?.parameter?.action;
  
  if (action === 'list') {
    return listReports();
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'PSP REPORT API Ready' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====== POST 요청 처리 ======
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, report } = body;
    
    if (action === 'upload') {
      return uploadReport(report);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: '알 수 없는 액션' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== 레포트 업로드 ======
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
      // 표면처리
      items.workSpeed?.value || '',
      items.workSpeed?.result || '',
      items.heatingState?.value || '',
      items.dust?.result || '',
      items.millScale?.result || '',
      items.profile?.value || '',
      items.profile?.result || '',
      items.dft?.value || '',
      items.dft?.result || '',
      items.waterSolubleSalts?.value || '',
      items.waterSolubleSalts?.result || '',
      // 연마재
      items.abrasivesConductivity?.value || '',
      items.abrasivesConductivity?.result || '',
      // 환경
      items.dryBulb?.value || '',
      items.wetBulb?.value || '',
      items.relHumidity?.value || '',
      items.relHumidity?.result || '',
      items.dewPoint?.value || '',
      items.surfaceTemp?.value || '',
      items.surfaceTemp?.result || '',
      // 기타
      items.facilityManagement?.result || '',
      items.materialManagement?.result || '',
      items.paintManagement?.result || '',
      items.reportManagement?.result || '',
      items.mekTest?.result || '',
      // 사진
      totalPhotos,
      // 종합의견
      r.opinion || '',
    ];
    
    // 기존 ID가 있으면 업데이트, 없으면 추가
    const data = sheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === r.id) {
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        // 불만족 항목 빨간색 표시
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
    
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: '업로드 완료' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ====== 불만족 항목 색상 표시 ======
function highlightRow(sheet, rowNum, row) {
  // 판정 컬럼들의 인덱스 (0-based)
  const judgeIndices = [10, 12, 13, 15, 17, 19, 21, 25, 28, 29, 30, 31, 32, 33];
  
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
}

// ====== 레포트 목록 조회 ======
function listReports() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, reports: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const reports = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, reports }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
