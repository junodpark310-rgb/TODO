/** navigator.vibrate를 지원하지 않는 환경에서는 무시 */

/** 드래그 시작 — 짧은 피드백 (50ms) */
export function hapticLight() {
  navigator.vibrate?.(50)
}

/** 타임라인 배치 성공 — 더블 펄스 */
export function hapticSuccess() {
  navigator.vibrate?.([30, 20, 30])
}
