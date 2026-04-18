const GREETINGS = ['hi', 'hello', 'hey', 'مرحبا', 'اهلا', 'سلام', 'صباح الخير', 'مساء الخير'];
const THANKS = ['thanks', 'thank you', 'thx', 'شكرا', 'تسلم', 'جزاك الله خيرا', 'مشكور'];

/**
 * @returns {{ reply: string } | null}
 */
export function matchSmallTalk(lowerText, isAr) {
  if (GREETINGS.some((word) => lowerText.includes(word))) {
    return {
      reply: isAr
        ? 'أهلاً بك! كيف يمكنني مساعدتك في الإسعافات الأولية اليوم؟'
        : 'Hello! How can I help you with first aid today?',
    };
  }
  if (THANKS.some((word) => lowerText.includes(word))) {
    return {
      reply: isAr
        ? 'العفو! أنا هنا دائماً للمساعدة. أتمنى لك السلامة.'
        : "You're welcome! I'm always here to help. Stay safe.",
    };
  }
  return null;
}
