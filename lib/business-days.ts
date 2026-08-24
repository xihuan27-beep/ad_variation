/**
 * 한국 공휴일 기준 영업일 계산.
 *
 * 엑셀에 적힌 소재 마감일은 종종 "라이브 최소 N영업일 전"처럼 상대 표현이다.
 * 실제 날짜를 모르면 담당자가 매번 달력을 세야 하므로, 라이브 일정에서 주말·공휴일을
 * 뺀 영업일 N일을 거꾸로 세어 구체적인 날짜로 보여준다.
 *
 * 공휴일은 2026·2027년만 하드코딩한다 — 그 이후 연도는 정부 확정 고시가 나와야
 * 정확해지므로, 지금 범위 밖 연도는 주말만 제외하고 계산한다(확인 필요로 표시).
 *
 * 대체공휴일 규정(2023년 개정 기준): 설날·추석 연휴가 다른 공휴일과 겹칠 때,
 * 어린이날·부처님오신날·성탄절이 주말과 겹칠 때, 3·1절·광복절·개천절·한글날·제헌절
 * 등 국경일이 주말과 겹칠 때 대체공휴일이 붙는다. 현충일과 신정은 대체공휴일
 * 적용 대상이 아니다(국가추모일 지위 등 별도 사유로 개정 대상에서 제외됨).
 */

const KR_HOLIDAYS_2026: Record<string, string> = {
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-03-02': '삼일절 대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '부처님오신날 대체공휴일',
  '2026-06-06': '현충일',
  '2026-07-17': '제헌절',
  '2026-08-15': '광복절',
  '2026-08-17': '광복절 대체공휴일',
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-05': '개천절 대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
};

const KR_HOLIDAYS_2027: Record<string, string> = {
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴',
  '2027-02-07': '설날',
  '2027-02-08': '설날 연휴',
  '2027-02-09': '설날 대체공휴일',
  '2027-03-01': '삼일절',
  '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일',
  '2027-07-17': '제헌절',
  '2027-08-15': '광복절',
  '2027-08-16': '광복절 대체공휴일',
  '2027-09-14': '추석 연휴',
  '2027-09-15': '추석',
  '2027-09-16': '추석 연휴',
  '2027-10-03': '개천절',
  '2027-10-04': '개천절 대체공휴일',
  '2027-10-09': '한글날',
  '2027-10-11': '한글날 대체공휴일',
  '2027-12-25': '성탄절',
};

/** 근로자의 날 — 관공서 공휴일은 아니지만 대부분의 사기업이 쉬므로 영업일 계산에 포함한다 */
const KR_LABOR_DAY: Record<string, string> = {
  '2026-05-01': '근로자의 날',
  '2027-05-01': '근로자의 날',
};

const KR_HOLIDAYS: Record<string, string> = { ...KR_HOLIDAYS_2026, ...KR_HOLIDAYS_2027, ...KR_LABOR_DAY };

/** 하드코딩된 공휴일 데이터가 있는 연도인지 — 범위 밖이면 계산 결과에 "확인 필요"를 붙인다 */
export function hasHolidayDataFor(year: number): boolean {
  return year === 2026 || year === 2027;
}

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isHoliday(d: Date): boolean {
  return toKey(d) in KR_HOLIDAYS;
}

export function isWorkingDay(d: Date): boolean {
  const day = d.getDay();
  if (day === 0 || day === 6) return false;
  return !isHoliday(d);
}

/** live 날짜에서 거꾸로 N영업일 전 날짜를 찾는다 (live 날짜 자신은 세지 않는다) */
export function subtractWorkingDays(live: Date, n: number): Date {
  const d = new Date(live);
  let remaining = n;
  while (remaining > 0) {
    d.setDate(d.getDate() - 1);
    if (isWorkingDay(d)) remaining--;
  }
  return d;
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function formatKoreanDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}(${WEEKDAY_KO[d.getDay()]})`;
}

/** "최소 5영업일" 같은 표현에서 영업일 수를 뽑는다 */
export function parseWorkingDaysCount(text: string): number | null {
  const m = text.match(/(\d+)\s*영업일/);
  return m ? Number(m[1]) : null;
}

/**
 * "8/21" 또는 "8/21 19:00-20:00" 형태의 라이브 일정에서 날짜를 만든다.
 * 엑셀에는 연도가 없으므로 기준일(referenceDate) 기준으로 가장 가까운 미래 쪽 연도를
 * 고른다 — 기준일보다 60일 넘게 과거로 떨어지면 내년으로 본다.
 */
export function parseLiveDate(liveSchedule: string, referenceDate: Date = new Date()): Date | null {
  const m = liveSchedule.match(/^(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  let year = referenceDate.getFullYear();
  let candidate = new Date(year, month - 1, day);
  const diffDays = (candidate.getTime() - referenceDate.getTime()) / 86400000;
  if (diffDays < -60) {
    year += 1;
    candidate = new Date(year, month - 1, day);
  }
  return candidate;
}

export interface ResolvedDeadline {
  /** 화면에 보여줄 문구 */
  display: string;
  /** true 면 영업일 역산으로 실제 계산한 날짜, false 면 엑셀 원문을 그대로 보여준 것 */
  computed: boolean;
}

/**
 * 엑셀의 "소재 전달 기한" 원문(deadline)과 "라이브 일정"(liveSchedule)을 조합해
 * 구체적인 날짜로 바꾼다. deadline 이 "N영업일 전" 형태가 아니거나 liveSchedule 을
 * 못 읽으면 원문을 그대로 돌려준다.
 */
export function resolveDeadline(
  deadline: string | undefined,
  liveSchedule: string | undefined,
  referenceDate: Date = new Date()
): ResolvedDeadline {
  if (!deadline) return { display: '-', computed: false };

  const n = parseWorkingDaysCount(deadline);
  if (n == null || !liveSchedule) return { display: deadline, computed: false };

  const live = parseLiveDate(liveSchedule, referenceDate);
  if (!live) return { display: deadline, computed: false };

  const due = subtractWorkingDays(live, n);
  const suffix = hasHolidayDataFor(due.getFullYear()) ? '' : ' (공휴일 데이터 없는 연도 — 주말만 반영, 확인 필요)';
  return { display: `${formatKoreanDate(due)}${suffix}`, computed: true };
}
