import { useColorScheme } from './use-color-scheme';
import { lightColors, darkColors, type Colors } from '../constants/theme';

export function useTheme(): Colors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}