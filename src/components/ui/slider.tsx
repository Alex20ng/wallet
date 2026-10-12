import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import NativeSlider from "@react-native-community/slider";
import { View } from "react-native";
import ThemedText from "./themed-text";

export function Slider({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  accessibilityLabel,
}: {
  value: number;
  onValueChange: (v: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  accessibilityLabel?: string;
}) {
  const colors = useTheme();
  const { t } = useTranslation();

  return (
    <View>
      <NativeSlider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={(v) => onValueChange(Math.round(v * 100) / 100)}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.backgroundTertiary}
        thumbTintColor={colors.primary}
        style={{ height: 40 }}
        accessibilityLabel={accessibilityLabel ?? t("settings.warningThreshold")}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ThemedText variant="caption" color="tertiary">
          {Math.round(minimumValue * 100)}%
        </ThemedText>
        <ThemedText variant="caption" color="tertiary">
          {Math.round(maximumValue * 100)}%
        </ThemedText>
      </View>
    </View>
  );
}
