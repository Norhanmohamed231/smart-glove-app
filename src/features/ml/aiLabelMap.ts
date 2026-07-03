/** English labels for the 20 AI model classes. */
export const AI_LABEL_EN: Record<string, string> = {
  'إنت': 'You',
  'اسكت': 'Be quiet',
  'اسمي': 'My name is',
  'اكل': 'Eat',
  'الافضل': 'The best',
  'السلام عليكم': 'Peace be upon you',
  'انا': 'I / Me',
  'بحبك': 'I love you',
  'تعبان': 'Tired',
  'زعلان': 'Upset',
  'سهل': 'Easy',
  'شكرا': 'Thank you',
  'عاوز': 'I want',
  'قوي': 'Strong',
  'كريم': 'Kareem / Generous',
  'كليه الهندسه': 'Faculty of Engineering',
  'لأ': 'No',
  'لو سمحت': 'Please',
  'مسؤول': 'Responsible / Manager',
  'نعم': 'Yes',
};

export const AI_UNKNOWN_AR = 'غير معروف';
export const AI_UNKNOWN_EN = 'Unknown';

export function getAiEnglish(label: string): string {
  return AI_LABEL_EN[label] ?? AI_UNKNOWN_EN;
}
