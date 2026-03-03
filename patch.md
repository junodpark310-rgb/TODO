# Timebox Todo — 패치 내역

---

## v0.4.0 — 모바일 대응 Phase 4 ✅

**목표**: PWA 설치 + Safe area + 진동 피드백 + 롱프레스 드래그 타임라인 자동 전환

| # | 작업 | 상태 |
|---|------|------|
| 1 | `vite-plugin-pwa` — manifest, icon, SW 자동 등록 | ✅ |
| 2 | `index.html` — `viewport-fit=cover`, theme-color, iOS PWA 메타태그 | ✅ |
| 3 | `index.css` — `.safe-top` / `.safe-bottom` 유틸리티 (env safe-area-inset) | ✅ |
| 4 | `useHaptic.ts` — `hapticLight` (50ms) / `hapticSuccess` ([30,20,30]) | ✅ |
| 5 | 롱프레스 → 타임라인 자동 전환: `mobileTab` App.tsx로 lift, `source:'brain-dump'` 구분 | ✅ |
| 6 | 드래그 시작 시 진동 + 현재 시각으로 타임라인 자동 스크롤 | ✅ |
| 7 | 타임박스 배치 성공 시 진동 피드백 | ✅ |

---

## v0.3.0 — 모바일 대응 Phase 3 ✅

**목표**: 터치 인터랙션 완성 — PointerEvent 기반 드래그/리사이즈 + Tap-to-Assign UX

| # | 작업 | 상태 |
|---|------|------|
| 1 | `TimeBlock.tsx` — MouseEvent → PointerEvent (`setPointerCapture`) 전환 | ✅ |
| 2 | `TimeBlock.tsx` — 리사이즈 핸들 터치 영역 확대 (`h-2` → `h-4`) | ✅ |
| 3 | `TaskCard.tsx` — `onAssign` prop + ⏱ 탭-투-어사인 버튼 (터치 기기 전용) | ✅ |
| 4 | `BrainDumpPanel.tsx` — `handleAssign`: 마지막 블록 이후에 자동 배치 | ✅ |

---

## v0.2.0 — 모바일 대응 Phase 2 ✅

**목표**: 하단 탭 네비게이션으로 네이티브 앱 수준의 모바일 UX

| # | 작업 | 상태 |
|---|------|------|
| 1 | `useMediaQuery` 훅 — 브레이크포인트 감지 | ✅ |
| 2 | `DesktopLayout` — 기존 3컬럼 분리 | ✅ |
| 3 | `MobileLayout` — 하단 탭 바 + 풀스크린 패널 | ✅ |
| 4 | `App.tsx` — isMobile 분기로 레이아웃 교체 | ✅ |

---

## v0.1.3 — 모바일 대응 Phase 1 ✅

**목표**: 최소 코드 변경으로 모바일에서 기본 동작 가능

| # | 작업 | 상태 |
|---|------|------|
| 1 | @dnd-kit TouchSensor 추가 | ✅ |
| 2 | hover 버튼 모바일 상시 표시 (TaskCard, TimeBlock) | ✅ |
| 3 | 반응형 레이아웃 — 모바일 세로 스택 + 패널 접기/펼치기 | ✅ |

---

## v0.1.2 — 버그 수정 ✅

| # | 내용 |
|---|------|
| 1 | 맥 한글 IME Enter 중복 입력 방지 (`isComposing` 체크) — BrainDumpInput, SubtaskList |
| 2 | 미완료 태스크 자동 롤오버 — 앱 시작 시 이전 날짜 미완료 항목을 오늘로 이전 |

---

## v0.1.1 — Brain Dump UX 개선 ✅

| # | 내용 |
|---|------|
| 1 | 캘린더에 배치된 태스크 카드에 📅 배지 + opacity 표시 |
| 2 | 완료 태스크 하단 "완료됨 (N개)" 섹션으로 분리 (접기/펼치기) |
| 3 | 완료 태스크 체크 해제 시 inbox로 복원 |
| 4 | 태스크 제목 더블클릭 인라인 편집 (Enter 저장 / Escape 취소) |

---

## v0.1.0 — MVP 초기 릴리스 ✅

| Phase | 내용 |
|-------|------|
| Phase 1 | 브레인 덤프 + 빅3 선정 (D&D) |
| Phase 2 | 타임박싱 캘린더 (일간/주간뷰, 드래그 이동/리사이즈, 줌, 시간 트래킹) |
| Phase 3 | 서브태스크 + 버퍼 블록 + 자동 밀기 + 통계 모달 + JSON 내보내기/가져오기 |

---

## 예정 패치

| 버전 | 내용 |
|------|------|
| v0.2.0 | 모바일 대응 Phase 2 — 하단 탭 네비게이션 ✅ |
| v0.3.0 | 모바일 대응 Phase 3 — 터치 인터랙션 완성 (PointerEvent) ✅ |
| v0.4.0 | 모바일 대응 Phase 4 — PWA, Safe area, 진동 피드백, 롱프레스 드래그 전환 ✅ |
| 미정 | 멀티 기기 동기화 (Supabase Realtime + Auth) |
