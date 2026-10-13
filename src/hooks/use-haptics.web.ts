// Stub web (PWA) des haptics.
// expo-haptics est un module natif : sur le web, aucune vibration n'est
// possible. Les enums sont répliquées pour conserver la même surface d'API.

const ImpactFeedbackStyle = {
  Heavy: 0,
  Medium: 1,
  Light: 2,
  Soft: 3,
  Rigid: 4,
} as const;
const NotificationFeedbackType = { Success: 0, Warning: 1, Error: 2 } as const;

export const haptics = {
  impact: async (_style?: number) => {},
  notification: async (_type?: number) => {},
  selection: async () => {},
  ImpactFeedbackStyle,
  NotificationFeedbackType,
};
