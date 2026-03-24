# Google Drive 수동 저장형 구현 작업 목록

작성일: 2026-03-12

## 1. 목적

이 문서는 `Google Drive 수동 저장형 설계안`을 실제 구현 작업으로 쪼갠 목록이다.

구현 목표:

- 기본 저장은 계속 `localStorage`
- 사용자가 원할 때만 Google Drive에 JSON 저장
- 사용자가 원할 때만 Google Drive에서 JSON 불러오기
- 저장 직전 원격 변경 여부를 검사해 충돌을 줄이기

## 2. 작업 범위

이번 작업에서 포함하는 범위:

- Google 로그인
- Drive 파일 검색/생성/업로드/다운로드
- 클라우드 저장/불러오기 UI
- 충돌 검사
- 상태 표시

이번 작업에서 제외하는 범위:

- 실시간 자동 동기화
- JSON 병합
- 다중 사용자 협업
- 서버 백엔드

## 3. 선행 결정사항

구현 전에 아래를 확정해야 한다.

1. 저장 위치: `appDataFolder`
2. 파일 운영 방식: 백업 JSON 1개 기본
3. 충돌 처리: `modifiedTime` 비교 + 사용자 선택
4. 저장 방식: 수동 버튼 실행만 허용

## 4. 작업 단계 요약

### Phase 0. 준비

- Google Cloud 프로젝트 생성
- Drive API 활성화
- OAuth 동의 화면 설정
- 웹 클라이언트 ID 발급
- 허용 origin 설정

### Phase 1. 공용 백업 계층 분리

- 현재 export/import 로직을 재사용 가능한 serializer로 분리
- 클라우드 상태 store 추가

### Phase 2. 인증 및 Drive API 연결

- Google 로그인 버튼 연결
- 액세스 토큰 요청
- 백업 파일 검색/생성 구현

### Phase 3. 수동 저장 구현

- 현재 store 상태를 JSON으로 직렬화
- 원격 메타데이터 조회
- 충돌 없으면 업로드

### Phase 4. 수동 불러오기 구현

- 원격 JSON 다운로드
- 로컬 덮어쓰기 확인
- store 반영

### Phase 5. 충돌 UX와 예외 처리

- 저장 전 충돌 검사
- 경고 모달
- 덮어쓰기 / 불러오기 / 새 파일 저장 선택지 제공

### Phase 6. 테스트 및 안정화

- 데스크탑/모바일 확인
- 인증 만료 처리
- 실패 메시지 점검

## 5. 파일별 작업 목록

### 신규 파일

#### `src/lib/cloudSerializer.ts`

할 일:

- 현재 `App.tsx`의 export JSON 생성 로직 이동
- 현재 import JSON 파싱 및 검증 로직 이동
- `toCloudBackup()`
- `applyCloudBackup()`
- `isValidCloudBackup()`

완료 기준:

- 수동 JSON 내보내기/가져오기가 기존과 같은 결과를 낸다
- `App.tsx`가 serializer를 사용하도록 바뀐다

#### `src/lib/googleDriveAuth.ts`

할 일:

- Google Identity Services 초기화
- 로그인 시작 함수
- 액세스 토큰 요청 함수
- 토큰 오류 처리

완료 기준:

- 버튼 클릭으로 로그인 가능
- 성공 시 access token 획득 가능
- 실패 시 UI에서 오류 표시 가능

#### `src/lib/googleDriveClient.ts`

할 일:

- 백업 파일 검색
- 백업 파일 생성
- 파일 메타데이터 조회
- 파일 다운로드
- 파일 업데이트
- 선택적으로 새 파일 저장

필요 메서드 예시:

- `findBackupFile()`
- `createBackupFile()`
- `getFileMetadata(fileId)`
- `downloadBackup(fileId)`
- `updateBackup(fileId, backup)`
- `createBackupSnapshot(backup)`

완료 기준:

- Drive에 JSON 파일을 만들고 다시 읽을 수 있다
- 같은 파일을 재업로드할 수 있다

#### `src/stores/useCloudStore.ts`

할 일:

- 연결 상태 저장
- 현재 연결된 `fileId` 저장
- 마지막 원격 `modifiedTime` 저장
- 마지막 클라우드 저장 시각 저장
- 로컬 변경 여부 저장
- 에러 메시지 저장

완료 기준:

- 클라우드 관련 UI 상태를 이 store 하나에서 읽을 수 있다

#### `src/components/layout/CloudControls.tsx`

할 일:

- `Google Drive 연결`
- `클라우드 저장`
- `클라우드 불러오기`
- 상태 텍스트
- 마지막 저장 시각
- 충돌/오류 메시지 표시 진입점

완료 기준:

- 헤더에 버튼 묶음으로 표시된다
- 로그인 전/후 상태가 명확히 구분된다

### 수정 파일

#### `src/App.tsx`

할 일:

- 기존 `handleExport`, `handleImport`를 serializer 기반으로 정리
- `CloudControls` 연결
- import/export 버튼과 cloud 버튼 역할 정리
- 충돌 모달 상태 연결

완료 기준:

- 헤더에서 로컬 백업과 클라우드 백업이 구분된다
- `App.tsx`가 과도한 Drive 로직을 직접 갖지 않는다

#### `src/stores/useTaskStore.ts`

할 일:

- task 변경 시 `hasLocalChangesSinceCloudSave`를 올리는 연결점 검토
- 가능하면 직접 의존 대신 상위 계층에서 감지

권장 방향:

- store 내부를 많이 건드리기보다 상위 subscribe 방식 우선 검토

완료 기준:

- 태스크 수정 후 저장 필요 상태가 반영된다

#### `src/stores/useCalendarStore.ts`

할 일:

- timebox 변경 시 `hasLocalChangesSinceCloudSave` 반영 방식 연결

완료 기준:

- 타임박스 수정 후 저장 필요 상태가 반영된다

#### `src/main.tsx` 또는 `index.html`

할 일:

- Google Identity Services 로드 방식 연결
- 환경 변수 주입 경로 정리

완료 기준:

- 로컬 및 배포 환경에서 GIS 초기화 가능

#### `package.json`

할 일:

- 필요 시 보조 유틸 패키지 추가 여부 검토
- 가능하면 외부 의존 최소화

완료 기준:

- 구현에 꼭 필요한 의존만 추가된다

## 6. 세부 작업 순서

### 작업 1. 백업 직렬화 분리

대상 파일:

- `src/App.tsx`
- `src/lib/cloudSerializer.ts`

작업 내용:

- 기존 JSON 내보내기 구조를 함수로 추출
- 기존 JSON 가져오기 검증을 함수로 추출

산출물:

- store 상태 ↔ JSON 변환 함수

완료 기준:

- 기존 로컬 export/import 기능이 그대로 유지된다

### 작업 2. 클라우드 상태 store 추가

대상 파일:

- `src/stores/useCloudStore.ts`

작업 내용:

- 연결 상태
- 저장 상태
- 마지막 저장 정보
- 충돌 확인용 메타데이터

산출물:

- 클라우드 전용 상태 store

완료 기준:

- UI에서 연결 여부와 저장 필요 여부를 읽을 수 있다

### 작업 3. 로컬 변경 감지 연결

대상 파일:

- `src/App.tsx`
- `src/stores/useTaskStore.ts`
- `src/stores/useCalendarStore.ts`

작업 내용:

- `tasks`, `timeboxes` 변경 시 클라우드 dirty 상태 반영

권장 구현:

- 우선 `App.tsx`에서 두 store 값을 관찰해 dirty 상태 갱신
- store 간 직접 결합은 최소화

완료 기준:

- 사용자가 뭔가 수정하면 `로컬 변경 있음` 상태가 켜진다

### 작업 4. Google 로그인 연결

대상 파일:

- `src/lib/googleDriveAuth.ts`
- `src/components/layout/CloudControls.tsx`
- `src/main.tsx` 또는 `index.html`

작업 내용:

- GIS 초기화
- 로그인 버튼 클릭
- access token 저장

완료 기준:

- 로그인 성공 시 클라우드 버튼 활성화

### 작업 5. Drive 파일 검색/생성

대상 파일:

- `src/lib/googleDriveClient.ts`

작업 내용:

- 백업 파일 검색
- 없으면 생성
- `fileId` 저장

완료 기준:

- 처음 로그인한 사용자도 즉시 백업 파일을 만들 수 있다

### 작업 6. 수동 클라우드 저장

대상 파일:

- `src/lib/cloudSerializer.ts`
- `src/lib/googleDriveClient.ts`
- `src/components/layout/CloudControls.tsx`

작업 내용:

- 현재 로컬 데이터를 JSON으로 생성
- 저장 전 메타데이터 조회
- 충돌 없으면 업로드
- 저장 성공 후 상태 갱신

완료 기준:

- 버튼 클릭 한 번으로 원격 백업이 갱신된다

### 작업 7. 수동 클라우드 불러오기

대상 파일:

- `src/lib/cloudSerializer.ts`
- `src/lib/googleDriveClient.ts`
- `src/components/layout/CloudControls.tsx`

작업 내용:

- 원격 JSON 다운로드
- 로컬 덮어쓰기 확인
- store 반영

완료 기준:

- 다른 기기에서 저장한 데이터를 현재 기기로 가져올 수 있다

### 작업 8. 충돌 검사

대상 파일:

- `src/lib/googleDriveClient.ts`
- `src/stores/useCloudStore.ts`
- `src/components/layout/CloudControls.tsx`

작업 내용:

- 마지막으로 본 `modifiedTime` 저장
- 저장 시 현재 원격 `modifiedTime` 재조회
- 다르면 충돌 상태로 전환

완료 기준:

- 원격 파일이 바뀐 상태에서 저장하려고 하면 경고가 뜬다

### 작업 9. 충돌 대응 UI

대상 파일:

- `src/components/layout/CloudControls.tsx`
- 필요 시 `src/components/layout/CloudConflictDialog.tsx`

작업 내용:

- `최신본 불러오기`
- `덮어쓰기`
- `새 파일로 저장`

완료 기준:

- 충돌 시 사용자가 안전하게 선택할 수 있다

### 작업 10. 헤더 UX 정리

대상 파일:

- `src/App.tsx`
- `src/components/layout/CloudControls.tsx`

작업 내용:

- 기존 `내보내기/가져오기`와 새 `클라우드 저장/불러오기` 구분
- 버튼 라벨 정리
- 상태 메시지 정리

권장 표현:

- `로컬 백업 내보내기`
- `로컬 백업 가져오기`
- `클라우드 저장`
- `클라우드 불러오기`

완료 기준:

- 사용자가 로컬 백업과 Drive 백업을 헷갈리지 않는다

## 7. 테스트 항목

### 기능 테스트

- 로그인 성공
- 로그인 취소
- 첫 백업 파일 생성
- 기존 백업 파일 재사용
- 저장 성공
- 불러오기 성공
- 로컬 덮어쓰기 확인 동작

### 충돌 테스트

- 기기 A에서 불러오기
- 기기 B에서 저장
- 기기 A에서 저장 시 충돌 감지 확인

### 예외 테스트

- 토큰 만료
- 네트워크 실패
- 손상된 JSON
- Drive 파일 없음

### UX 테스트

- 모바일에서 버튼 영역 가독성
- 긴 에러 메시지 처리
- 저장 성공/실패 피드백 명확성

## 8. 완료 기준

이번 기능은 아래를 만족하면 완료로 본다.

1. Google 계정 연결 가능
2. Drive 백업 파일 1개 생성 가능
3. `클라우드 저장` 가능
4. `클라우드 불러오기` 가능
5. 저장 전 원격 변경 여부 검사 가능
6. 충돌 시 안전한 선택지 제공
7. 기존 로컬 export/import 기능 유지

## 9. 예상 소요

작업량 기준 예상:

- Phase 0: 0.5일
- Phase 1: 0.5일
- Phase 2: 0.5일
- Phase 3: 0.5일
- Phase 4: 0.5일
- Phase 5~6: 0.5~1일

총합:

- **빠르면 2.5일**
- **보통 3일 내외**

## 10. 바로 착수 순서

실행 우선순위는 아래 순서가 가장 좋다.

1. `cloudSerializer.ts` 만들기
2. `useCloudStore.ts` 만들기
3. `googleDriveAuth.ts` 연결
4. `googleDriveClient.ts`에서 파일 검색/생성/업데이트 구현
5. `CloudControls.tsx` 붙이기
6. 저장/불러오기 구현
7. 충돌 모달 구현

한 줄 요약:

**이 작업은 새 시스템을 만드는 일이 아니라, 기존 JSON 백업 기능을 Google Drive 버튼으로 확장하는 일로 보면 된다.**
