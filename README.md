# PSP REPORT

Primary Surface Preparation 강재전처리 검사 레포트 앱

## 기술 스택

- **Frontend**: Vite + React + React Router
- **배포**: GitHub → Vercel 자동배포
- **저장**: localStorage (클라이언트) + Google Sheets (구글시트)
- **PDF**: 브라우저 Print → PDF 저장

---

## 로컬 실행

```bash
npm install --legacy-peer-deps
npm run dev
```

## 배포 방법 (GitHub + Vercel)

### 1. GitHub 레포 생성
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/[username]/psp-inspection.git
git push -u origin main
```

### 2. Vercel 연동
1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. "Add New Project" → `psp-inspection` 레포 선택
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy 클릭

→ 이후 `main` 브랜치에 push하면 자동 배포됩니다.

---

## Google Sheets 연동

### 1. 구글시트 준비
1. [sheets.google.com](https://sheets.google.com) → 새 스프레드시트 생성
2. 확장 프로그램 → Apps Script 클릭

### 2. Apps Script 코드 등록
1. `apps-script/Code.gs` 내용 전체 복사
2. Apps Script 에디터에 붙여넣기
3. 저장 (Ctrl+S)

### 3. 웹앱 배포
1. 배포 → 새 배포
2. 유형: **웹앱**
3. 다음 사용자로 실행: **나**
4. 액세스 권한: **모든 사용자**
5. 배포 → URL 복사

### 4. 앱에 URL 등록
1. 앱 로그인 → 로그인 화면 하단 **🔒 관리자 모드**
2. PIN: `admin0000`
3. **Google Apps Script 연동** 섹션에 URL 붙여넣기
4. **URL 저장** 클릭

---

## 관리자 모드 (PIN: admin0000)

- 검사위치 추가/삭제
- Google Apps Script URL 등록
- 레포트 삭제

---

## 앱 구조

```
소속 선택 → 이름 입력 → 홈
                            ↓
                     새 레포트 작성
                            ↓
            Step 1: 기본정보 (검사일, 호선, 강재번호, 검사위치)
            Step 2: 표면처리 (7개 항목, 자동판정)
            Step 3: 연마재 (전기전도도, 자동판정)
            Step 4: 환경 (건구+습구 입력 → RH+DP 자동계산)
            Step 5: 기타사항 (5개 항목)
            Step 6: 사진 업로드 (8개 항목, 각 3장)
            Step 7: 종합의견
            Step 8: 검토 → PDF 다운로드 / 제출
```

---

## 환경조건 자동계산

건구온도(DB) + 습구온도(WB) → Magnus 공식 적용

- **상대습도 (RH)** 자동계산 + 만족/불만족 자동판정 (기준: < 85%)
- **이슬점 (DP)** 자동계산
- **철판온도 판정**: 철판온도 > 이슬점 + 3℃ 이면 만족

---

## 파일 구조

```
src/
├── constants/
│   ├── affiliations.js   # 소속 목록 (QM + 협력사 4곳)
│   ├── config.js         # 앱 설정, localStorage 키
│   ├── locations.js      # 검사위치 (관리자 추가/삭제)
│   └── standards.js      # 표준값 + 자동판정 로직 + Magnus 공식
├── utils/
│   ├── storage.js        # localStorage CRUD + 레포트 ID 생성
│   ├── sheets.js         # Google Apps Script 연동
│   ├── pdf.js            # PDF 생성 (엑셀 양식 재현)
│   └── reportModel.js    # 새 레포트 객체 생성
├── pages/
│   ├── Login.jsx         # 소속 선택 + 이름 입력
│   ├── Home.jsx          # 홈 대시보드
│   ├── ReportForm.jsx    # 8단계 입력 폼 컨테이너
│   └── Admin.jsx         # 관리자 모드
└── components/
    ├── InputField.jsx    # 공통 입력 + 자동판정
    ├── PhotoUploader.jsx # 사진 업로드 (Base64)
    └── steps/
        ├── Step1Basic.jsx
        ├── Step2SurfacePrep.jsx
        ├── Step3Abrasives.jsx
        ├── Step4Environmental.jsx
        ├── Step5Others.jsx
        ├── Step6Photos.jsx
        ├── Step7Opinion.jsx
        └── Step8Review.jsx

apps-script/
└── Code.gs               # Google Sheets 연동 스크립트
```
