export const UNKNOWN_PATTERN = 'غير معرّف';

export const DEFAULT_DICTIONARY: Record<string, string> = {
  '00000': 'جاهز',
  '00001': 'مرحبا',
  '00010': 'شكرا',
  '00011': 'نعم',
  '00100': 'لا',
  '00101': 'مساعدة',
  '00110': 'من فضلك',
  '00111': 'آسف',
  '01000': 'صباح الخير',
  '01001': 'مساء الخير',
  '01010': 'مع السلامة',
  '01011': 'تباعد',
  '01100': 'أحبك',
  '01101': 'أفهم',
  '01110': 'لا أفهم',
  '01111': 'كيف حالك',
  '10000': 'ماء',
  '10001': 'طعام',
  '10010': 'تعبان',
  '10011': 'بخير',
  '10100': 'سعيد',
  '10101': 'حزين',
  '10110': 'طوارئ',
  '10111': 'أين',
  '11000': 'متى',
  '11001': 'كيف',
  '11010': 'لماذا',
  '11011': 'من',
  '11100': 'ماذا',
  '11101': 'أريد',
  '11110': 'انتظر',
  '11111': 'توقف',
};

export function lookupWord(bits: string, dictionary: Record<string, string> = DEFAULT_DICTIONARY): string {
  return dictionary[bits] ?? UNKNOWN_PATTERN;
}

export const EN_UNKNOWN = 'Unknown';

/** English translations keyed by the same 5-bit patterns as DEFAULT_DICTIONARY. */
export const EN_DICTIONARY: Record<string, string> = {
  '00000': 'Ready',
  '00001': 'Hello',
  '00010': 'Thank you',
  '00011': 'Yes',
  '00100': 'No',
  '00101': 'Help',
  '00110': 'Please',
  '00111': 'Sorry',
  '01000': 'Good morning',
  '01001': 'Good evening',
  '01010': 'Goodbye',
  '01011': 'Keep distance',
  '01100': 'I love you',
  '01101': 'I understand',
  '01110': "I don't understand",
  '01111': 'How are you',
  '10000': 'Water',
  '10001': 'Food',
  '10010': 'Tired',
  '10011': 'Fine',
  '10100': 'Happy',
  '10101': 'Sad',
  '10110': 'Emergency',
  '10111': 'Where',
  '11000': 'When',
  '11001': 'How',
  '11010': 'Why',
  '11011': 'Who',
  '11100': 'What',
  '11101': 'I want',
  '11110': 'Wait',
  '11111': 'Stop',
};

/** Reverse map: Arabic word -> English, for translating arbitrary detected words. */
export const AR_TO_EN: Record<string, string> = Object.keys(DEFAULT_DICTIONARY).reduce(
  (acc, bits) => {
    acc[DEFAULT_DICTIONARY[bits]] = EN_DICTIONARY[bits] ?? EN_UNKNOWN;
    return acc;
  },
  {} as Record<string, string>,
);

export function lookupEnglish(bits: string): string {
  return EN_DICTIONARY[bits] ?? EN_UNKNOWN;
}

export function translateArabic(word: string): string {
  return AR_TO_EN[word] ?? EN_UNKNOWN;
}
