import { gradients } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SIZE = 58;

export default function FloatingActionButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={() => router.push("/transaction/new?type=expense")}
      accessibilityLabel="Ajouter une transaction"
      accessibilityRole="button"
      className="items-center justify-center rounded-full bg-emerald-500 active:scale-95"
      style={[
        {
          position: "absolute",
          right: 20,
          bottom: insets.bottom - 20, // au-dessus de la tab bar
          width: SIZE,
          height: SIZE,
          zIndex: 100,
        },
        Platform.select({
          ios: {
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 14,
          },
          android: { elevation: 10 },
        }),
      ]}
    >
      <LinearGradient
        colors={[...gradients.brand]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={28} strokeWidth={2.5} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );
}
