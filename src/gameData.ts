export interface Question {
  word: string;
  imagePath: string;
  emoji: string;
}

export const stage1Questions: Question[] = [
  { word: '수업시간', imagePath: '/images/수업시간.png', emoji: '📚' },
  { word: '점심시간', imagePath: '/images/점심시간.png', emoji: '🍱' },
  { word: '체육시간', imagePath: '/images/체육시간.png', emoji: '⚽' },
  { word: '쉬는시간', imagePath: '/images/쉬는시간.png', emoji: '🎮' },
];

export const stage2Questions: Question[] = [
  { word: '걷다', imagePath: '/images/걷다.png', emoji: '🚶' },
  { word: '뛰다', imagePath: '/images/뛰다.png', emoji: '🏃' },
  { word: '차례를 지키다', imagePath: '/images/차례를지키다.png', emoji: '🚦' },
  { word: '새치기하다', imagePath: '/images/새치기하다.png', emoji: '😤' },
  { word: '엎드리다', imagePath: '/images/엎드리다.png', emoji: '😴' },
  { word: '바르게 앉다', imagePath: '/images/바르게앉다.png', emoji: '🪑' },
  { word: '괴롭히다', imagePath: '/images/괴롭히다.png', emoji: '😢' },
  { word: '도와주다', imagePath: '/images/도와주다.png', emoji: '🤝' },
];

// 3단계 순서: 차례를 지키다 → 엎드리다 → 새치기하다 → 괴롭히다 → 바르게 앉다 → 도와주다
export const stage3Questions: Question[] = [
  { word: '차례를 지키다', imagePath: '/images/차례를지키다.png', emoji: '🚦' },
  { word: '엎드리다', imagePath: '/images/엎드리다.png', emoji: '😴' },
  { word: '새치기하다', imagePath: '/images/새치기하다.png', emoji: '😤' },
  { word: '괴롭히다', imagePath: '/images/괴롭히다.png', emoji: '😢' },
  { word: '바르게 앉다', imagePath: '/images/바르게앉다.png', emoji: '🪑' },
  { word: '도와주다', imagePath: '/images/도와주다.png', emoji: '🤝' },
];
