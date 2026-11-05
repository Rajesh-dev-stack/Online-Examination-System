/**
 * Normalizes question correct answer to single uppercase letter 'A', 'B', 'C', or 'D'.
 * Supports:
 * - Single letter 'A', 'B', 'C', 'D' (case-insensitive)
 * - Strings like 'Option A', 'option B', 'A) class', 'A. define'
 * - The actual answer text (e.g. correctAnswer === 'class', which matches optionA)
 */
export const normalizeCorrectAnswer = (q) => {
  if (!q) return '';
  const raw = String(q.correctAnswer ?? q.answer ?? '').trim();
  if (!raw) return '';

  const upper = raw.toUpperCase();

  // 1. Direct single letter 'A', 'B', 'C', 'D'
  if (['A', 'B', 'C', 'D'].includes(upper)) {
    return upper;
  }

  // 2. Starts with 'OPTION A', 'OPTIONA', 'A)', 'A.', 'A -'
  const letterMatch = upper.match(/^(?:OPTION\s*)?([A-D])[\s.):\-]/) || upper.match(/^(?:OPTION\s*)([A-D])$/);
  if (letterMatch && letterMatch[1]) {
    return letterMatch[1];
  }

  // 3. Match against the actual text of optionA, optionB, optionC, optionD
  const cleanRaw = raw.toLowerCase().trim();
  const optA = String(q.optionA ?? '').toLowerCase().trim();
  const optB = String(q.optionB ?? '').toLowerCase().trim();
  const optC = String(q.optionC ?? '').toLowerCase().trim();
  const optD = String(q.optionD ?? '').toLowerCase().trim();

  if (optA && cleanRaw === optA) return 'A';
  if (optB && cleanRaw === optB) return 'B';
  if (optC && cleanRaw === optC) return 'C';
  if (optD && cleanRaw === optD) return 'D';

  // 4. Starts with a single letter A-D
  if (['A', 'B', 'C', 'D'].includes(upper[0])) {
    return upper[0];
  }

  return upper;
};

/**
 * Normalizes student answer to 'A', 'B', 'C', 'D'
 */
export const normalizeStudentAnswer = (ans, q) => {
  if (!ans) return '';
  const str = String(ans).trim().toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(str)) return str;

  if (q) {
    const raw = String(ans).toLowerCase().trim();
    const optA = String(q.optionA ?? '').toLowerCase().trim();
    const optB = String(q.optionB ?? '').toLowerCase().trim();
    const optC = String(q.optionC ?? '').toLowerCase().trim();
    const optD = String(q.optionD ?? '').toLowerCase().trim();

    if (optA && raw === optA) return 'A';
    if (optB && raw === optB) return 'B';
    if (optC && raw === optC) return 'C';
    if (optD && raw === optD) return 'D';
  }

  return str;
};
