import React, { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/use-theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'default' | 'surface' | 'elevated' | 'secondary' | 'tertiary';
}

export const ThemedView = forwardRef<View, ThemedViewProps>(
  ({ variant = 'default', style, children, ...props }, ref) => {
    const colors = useTheme();
    const backgroundColor = variant === 'surface' ? colors.surface
      : variant === 'elevated' ? colors.surfaceElevated
      : variant === 'secondary' ? colors.backgroundSecondary
      : variant === 'tertiary' ? colors.backgroundTertiary
      : colors.background;

    return (
      <View
        ref={ref}
        style={[
          { backgroundColor },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

ThemedView.displayName = 'ThemedView';

export default ThemedView;
