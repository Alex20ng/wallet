import { impactAsync, notificationAsync, selectionAsync, ImpactFeedbackStyle, NotificationFeedbackType } from 'expo-haptics';

export const haptics = {
  impact: (style?: ImpactFeedbackStyle) => impactAsync(style),
  notification: (type?: NotificationFeedbackType) => notificationAsync(type),
  selection: () => selectionAsync(),
  ImpactFeedbackStyle,
  NotificationFeedbackType,
};