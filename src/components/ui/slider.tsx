import { useTheme } from "@/hooks/use-theme";
import NativeSlider from "@react-native-community/slider";
import { View } from "react-native";
import ThemedText from "./themed-text";

export function Slider({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
}: {
  value: number;
  onValueChange: (v: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
}) {
  const colors = useTheme();

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
        accessibilityLabel="Seuil d'alerte"
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
