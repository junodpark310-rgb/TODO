# 타임박싱 Todo 앱 — 기획 및 구현 계획

---

## 프로젝트 개요

**목적**: 단순한 체크리스트 형태의 투두 리스트가 가진 한계(결정 피로, 시간 개념 부재)를 극복하고, 일론 머스크의 타임박싱 기법과 뇌과학적 원리를 적용한 '시간 설계 및 피드백 중심의 Todo App' 개발.

### 해결하고자 하는 문제

- 할 일이 많아질수록 무엇을 먼저 할지 고민하다 실행력이 떨어지는 문제 (전전두엽의 결정 피로)
- 시간 마감이 없어 일이 계속 늘어지는 문제 (파킨슨 법칙)
- 시간을 과하게 낙관적으로 예측하여 계획이 틀어지는 문제 (계획 오류)

---

## 핵심 기능

### 1. 브레인 덤프 (Brain Dump / Inbox)

**기능**: 머릿속에 있는 모든 할 일을 순서나 조건에 상관없이 빠르게 쏟아내어 기록하는 기본 입력 창.
**목적**: 미완성된 일을 계속 떠올리느라 에너지를 소모하는 '자이가르닉 효과'를 방지하여 뇌의 부담을 줄인다.

### 2. 빅 3 (The Big 3) 선정

**기능**: 브레인 덤프에 적어둔 전체 목록 중, **오늘 반드시 끝내야 하는 가장 중요한 3가지**만 별도로 선택(Drag & Drop)하여 화면 메인에 강조해 보여주는 기능.
**목적**: 동시에 너무 많은 목표를 추구할 때 성과가 감소하는 것을 막고, 한 번에 하나씩 핵심에 에너지를 집중하도록 유도한다.

### 3. 타임박싱 (Time-Boxing / 스케줄링 캘린더)

**기능**: 선택한 항목들에 대해 명확한 시작 시간과 종료 시간을 배정하여 타임라인에 배치. (예: '새벽 5시 30분 ~ 7시까지 원고 작성')
**목적**: 시간에 명확한 경계를 만들어 뇌가 고민 없이 즉각적으로 실행하게 만들며, 인위적인 마감 효과를 통해 긴장감과 집중력을 끌어올린다.

### 4. 계획 오류 교정 시스템 (예상 시간 vs 실제 시간 트래킹)

**기능**:
- 작업 전: 태스크의 **예상 소요 시간** 입력
- 작업 후: 타이머 또는 수동 입력으로 **실제 시작/종료 시간** 기록
- 결과 브리핑: 예상 vs 실제 시간 비교 통계 UI 제공

**목적**: 사용자의 인지 편향(낙관적 시간 예측)을 교정하고, 지속적인 기록을 통해 소요 시간 예측 정확도를 높인다.

### 5. 태스크 쪼개기 (Sub-task 분해)

**기능**: 규모가 큰 작업(예: '영상 제작')을 세분화된 작은 작업('썸네일 제작 1시간', '도입부 작성' 등)으로 쪼개어 입력하도록 유도하는 UI.
**목적**: 작업의 크기가 작아질수록 시간 예측이 정확해지므로 계획 오류를 줄인다.

### 6. 유연한 계획 수정 및 여유 시간 (Buffer) 블록

**기능**:
- 계획은 반드시 틀어질 수 있다는 전제하에, 일정을 쉽게 드래그하여 수정 가능
- 일정 사이에 예상치 못한 일 처리나 창의적 작업을 위한 '여유 시간(30분~1시간)' 블록 추가

**블록 조작 방식**:

1. **블록 이동 (드래그)** — @dnd-kit 사용
   - 블록 전체를 잡고 위아래로 드래그 → 15분 단위로 스냅되며 시간 이동
   - 다른 날짜로도 이동 가능 (향후 확장)

2. **시간 조절 (리사이즈)** — 마우스 이벤트 직접 구현
   - 블록 하단 핸들 드래그 → 종료 시간 조절 (블록 길이 변경)
   - 블록 상단 핸들 드래그 → 시작 시간 조절
   - 15분 단위 스냅 적용

3. **겹침 처리**
   - 블록이 겹치려 하면 이동/리사이즈 차단
   - "뒤로 밀기" 모드: 블록을 늘리면 뒤쪽 블록들이 자동으로 밀림

---

## 기술 방향 결정

### 아키텍처: 프론트엔드 전용 (백엔드 없음)

백엔드 서버 없이 **프론트엔드만으로** 구현한다.
데이터는 사용자 브라우저의 **localStorage**에 저장한다.

**선택 이유**:
- 개인 사용 목적의 MVP에 서버 인프라 불필요
- 설정/배포 복잡도 최소화
- Zustand persist 미들웨어로 로컬 저장이 코드 몇 줄로 가능
- 정적 파일만으로 Vercel/GitHub Pages에 즉시 배포 가능

**향후 확장 시 백엔드 추가가 필요한 시점**:
- 여러 기기 간 동기화 (폰 ↔ PC)
- 다른 사람과 데이터 공유
- 서버 사이드 통계/분석

### 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | React 18 + TypeScript + Vite |
| 상태관리 + 로컬 저장 | Zustand + persist 미들웨어 (localStorage) |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| 날짜/시간 처리 | date-fns |
| 스타일링 | Tailwind CSS |
| 배포 | Vercel 또는 GitHub Pages (정적 파일) |

### 로컬 저장 방식

```
localStorage 키 구조:
  timebox-tasks       → 전체 태스크 목록 (브레인 덤프 포함)
  timebox-big-three   → 날짜별 빅3 선정 데이터
  timebox-timeboxes   → 날짜별 타임블록 데이터
  timebox-settings    → 사용자 설정
```

Zustand persist 미들웨어가 상태 변경 시 자동으로 저장/복원한다.

---

## 데이터 구조

### Task (태스크)

```typescript
interface Task {
  id: string;                          // 고유 ID
  title: string;                       // 할 일 제목
  status: 'inbox' | 'active' | 'done'; // inbox = 브레인 덤프
  estimatedMin: number | null;         // 예상 소요 시간 (분)
  actualMin: number | null;            // 실제 소요 시간 (분)
  isBigThree: boolean;                 // 빅3 선정 여부
  bigThreeOrder: number | null;        // 빅3 순서 (0, 1, 2)
  subtasks: Subtask[];                 // 서브태스크 목록
  date: string;                        // 할당된 날짜 (YYYY-MM-DD)
  createdAt: string;
}
```

### Timebox (타임블록)

```typescript
interface Timebox {
  id: string;
  taskId: string | null;    // null이면 버퍼 블록
  date: string;             // YYYY-MM-DD
  startTime: string;        // HH:mm
  endTime: string;          // HH:mm
  actualStart: string | null;
  actualEnd: string | null;
  isBuffer: boolean;
  bufferLabel: string | null;
}
```

---

## 프로젝트 구조

```
To_do_AppbyTime/
├── plan.md                        ← 현재 파일
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types/
│   │   ├── task.ts
│   │   └── timebox.ts
│   ├── contexts/
│   │   └── CalendarContext.tsx    ← 줌 레벨, 뷰모드 (day/week) 관리
│   ├── stores/
│   │   ├── useTaskStore.ts        ← 태스크 + localStorage persist
│   │   └── useCalendarStore.ts   ← 타임블록 + localStorage persist
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DateNav.tsx        ← 날짜 네비게이션 + 달력 피커
│   │   │   └── DatePicker.tsx     ← 월간 달력 팝오버
│   │   ├── brain-dump/
│   │   │   ├── BrainDumpInput.tsx
│   │   │   └── TaskList.tsx
│   │   ├── big-three/
│   │   │   ├── BigThreePanel.tsx
│   │   │   └── BigThreeSlot.tsx
│   │   ├── calendar/
│   │   │   ├── TimelineView.tsx   ← CSS Grid 기반 타임라인
│   │   │   ├── TimeBlock.tsx
│   │   │   └── BufferBlock.tsx
│   │   ├── tracking/
│   │   │   └── TimeComparison.tsx
│   │   └── subtask/
│   │       └── SubtaskList.tsx
│   ├── hooks/
│   │   ├── useDragAndDrop.ts
│   │   └── useTimeUtils.ts
│   └── utils/
│       ├── timeUtils.ts
│       └── constants.ts
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 3단계 MVP 구현 계획

### Phase 1 — 브레인 덤프 + 빅 3 선정 (3~4일)

**목표**: 할 일을 빠르게 입력하고, 오늘의 빅 3를 D&D로 선정할 수 있다.

| 단계 | 작업 |
|------|------|
| 1-1 | Vite + React + TypeScript 프로젝트 초기화, 패키지 설치 |
| 1-2 | 타입 정의 (`Task`, `Timebox`) |
| 1-3 | Zustand 스토어 + persist 설정 |
| 1-4 | 브레인 덤프 입력 UI (Enter 연속 입력) |
| 1-5 | 태스크 목록 표시 + 완료/삭제 |
| 1-6 | 빅 3 패널 D&D 구현 (브레인덤프 → 빅3 슬롯) |
| 1-7 | 레이아웃 통합, 날짜 이동 |

**완료 기준**:
- Enter로 빠른 연속 입력 가능
- D&D로 빅 3 선정 및 순서 변경
- 브라우저 재시작 후에도 데이터 유지

### Phase 2 — 타임박싱 캘린더 + 시간 트래킹 ✅ 완료

**목표**: 태스크를 타임라인에 배치하고, 실제 소요 시간을 기록한다.

| 단계 | 작업 | 상태 |
|------|------|------|
| 2-1 | 타임블록 Zustand 스토어 (localStorage 저장) | ✅ |
| 2-2 | CSS Grid 기반 타임라인 UI (30분 단위 슬롯) | ✅ |
| 2-3 | 브레인덤프/빅3 → 타임슬롯 D&D | ✅ |
| 2-4 | 타임블록 하단 핸들 리사이즈 | ✅ |
| 2-5 | 타임블록 드래그 이동 (30분 스냅) | ✅ |
| 2-6 | 시간 트래킹 (▶ 시작 / ✓ 완료 버튼) | ✅ |
| 2-7 | 캘린더 줌 인/아웃 (+/- 버튼, 6단계) | ✅ |
| 2-8 | Big3 항목 → 캘린더 드래그 (Big3 유지) | ✅ |
| 2-9 | 날짜 피커 (달력 팝오버, 월 이동) | ✅ |
| 2-10 | 일간/주간 뷰 전환 | ✅ |

**구현 방식**:
- 타임라인: `position: absolute` 기반 (CSS Grid 아님), 30분 = `SLOT_HEIGHT`px
- 줌: `CalendarContext`로 `slotHeight = BASE_SLOT_HEIGHT × zoomLevel` 관리
- 리사이즈/이동: 마우스 이벤트 직접 구현 (@dnd-kit 미사용), 슬롯 단위 스냅
- 주간뷰: 7컬럼 레이아웃, 각 컬럼이 독립 드롭존 (날짜 포함 슬롯 ID)
- Big3 드래그: `useDraggable` 추가, 드롭 후 Big3 상태 유지

**완료 기준**:
- ✅ 태스크를 캘린더에 드래그하여 시간 배정
- ✅ 블록 리사이즈/이동으로 시간 조절
- ✅ 줌 인/아웃으로 타임라인 밀도 조절
- ✅ Big3 항목도 캘린더에 배치 가능 (Big3 유지)
- ✅ 날짜 클릭 → 달력 팝오버로 날짜 점프
- ✅ 일간/주간 뷰 전환

### Phase 3 — 서브태스크 + 버퍼 블록 + 통계 ✅ 완료

**목표**: 큰 태스크를 잘게 쪼개고, 버퍼를 추가하며, 누적 통계로 계획 정확도를 확인한다.

| 단계 | 작업 | 상태 |
|------|------|------|
| 3-1 | 서브태스크 추가/완료/삭제 UI (TaskCard 확장) | ✅ |
| 3-2 | 서브태스크 진행률 바 표시 | ✅ |
| 3-3 | 버퍼 블록 수동 추가 (캘린더 헤더 "+ 버퍼" 버튼) | ✅ |
| 3-4 | 리사이즈 시 후속 블록 자동 밀기 (연쇄 재배치) | ✅ |
| 3-5 | 통계 모달 (7일 차트, 계획 정확도, 완료율) | ✅ |
| 3-6 | JSON 내보내기/가져오기 (헤더 버튼) | ✅ |

**구현 방식**:
- 서브태스크: TaskCard에서 ▸ 버튼으로 확장, Enter로 빠른 추가
- 버퍼 블록: `isBuffer: true` Timebox, 마지막 블록 뒤에 자동 배치
- 자동 밀기: `useCalendarStore.updateTimebox(id, updates, pushSubsequent=true)` 리사이즈 시 호출
- 통계: tasks + timeboxes에서 파생 계산, CSS 바 차트 (라이브러리 미사용)
- Export: `JSON.stringify` → `.json` 파일 다운로드
- Import: `FileReader` → `JSON.parse` → Zustand setState

**완료 기준**:
- ✅ TaskCard에서 ▸ 클릭 → 서브태스크 추가/완료/삭제 + 진행률 바
- ✅ "버퍼" 버튼으로 여유 시간 블록 추가
- ✅ 블록 리사이즈 시 겹치는 뒤 블록들 자동으로 밀림
- ✅ 헤더 "통계" 버튼 → 7일 차트 모달
- ✅ "내보내기" → JSON 파일 다운로드
- ✅ "가져오기" → JSON 파일로 복원

---

## 주요 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| 캘린더 타임라인 구현 복잡도 | 높음 | 리사이즈 없이 클릭으로 시간 설정하는 폴백 UX 준비 |
| D&D 다중 컨테이너 (3곳 간 이동) | 중간 | @dnd-kit의 다중 컨테이너 공식 예제 참고 |
| localStorage 용량 한계 | 낮음 | 통상 5~10MB. 수년 치 데이터도 충분. 초과 시 오래된 날짜 자동 아카이브 |
| 기기 간 동기화 불가 | 낮음 (MVP 범위 외) | Phase 3에서 export/import로 수동 백업 제공 |
