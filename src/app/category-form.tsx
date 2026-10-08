import { Button, Input, Select, ThemedText } from "@/components/ui";
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_NAMES,
} from "@/constants/category-icons";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoryType = "expense" | "income" | "both";

// Évite l'erreur de clé dupliquée (#0EA5E9 apparaît deux fois)
const UNIQUE_COLORS = Array.from(new Set(CATEGORY_COLORS));

export default function CategoryFormSheet() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } =
    useAppStore();

  const editing = categories.find((c) => c.id === id) ?? null;

  const [formData, setFormData] = useState(() => ({
    name: editing?.name ?? "",
    icon: editing?.icon ?? CATEGORY_ICON_NAMES[0],
    color: editing?.color ?? UNIQUE_COLORS[0],
    type: (editing?.type ?? "expense") as CategoryType,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Le nom est requis";
    if (!formData.icon) newErrors.icon = "Sélectionnez une icône";
    if (!formData.color) newErrors.color = "Sélectionnez une couleur";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      return;
    }

    await haptics.impact(haptics.ImpactFeedbackStyle.Medium);

    try {
      if (editing) {
        await updateCategory(editing.id, formData);
      } else {
        await addCategory({ ...formData, isDefault: false, sortOrder: 0 });
      }
      await haptics.notification(haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      await haptics.notification(haptics.NotificationFeedbackType.Error);
      setErrors({ submit: "Erreur lors de la sauvegarde" });
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    Alert.alert(
      "Supprimer la catégorie",
      `Voulez-vous supprimer « ${editing.name} » ? Les transactions associées ne seront pas supprimées.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
            try {
              await deleteCategory(editing.id);
              await haptics.notification(
                haptics.NotificationFeedbackType.Success,
              );
              router.back();
            } catch {
              await haptics.notification(
                haptics.NotificationFeedbackType.Error,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="gap-2 px-6 pt-6 pb-4"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="subtitle" weight="bold" className="mb-2">
          {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </ThemedText>

        <Input
          label="Nom"
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          placeholder="Ex: Courses, Transport..."
          error={errors.name}
          required
          autoCapitalize="words"
        />

        <ThemedText
          variant="caption"
          weight="medium"
          color="secondary"
          className="mb-2 mt-4"
        >
          Type
        </ThemedText>
        <Select
          value={formData.type}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, type: value as CategoryType }))
          }
          options={[
            { value: "expense", label: "Dépense" },
            { value: "income", label: "Revenu" },
            { value: "both", label: "Les deux" },
          ]}
          placeholder="Type de transaction"
        />

        <ThemedText
          variant="caption"
          weight="medium"
          color="secondary"
          className="mb-2 mt-4"
        >
          Icône
        </ThemedText>
        <IconPicker
          selectedIcon={formData.icon}
          onSelect={(icon) => setFormData((prev) => ({ ...prev, icon }))}
        />

        <ThemedText
          variant="caption"
          weight="medium"
          color="secondary"
          className="mb-2 mt-4"
        >
          Couleur
        </ThemedText>
        <ColorPicker
          selectedColor={formData.color}
          onSelect={(color) => setFormData((prev) => ({ ...prev, color }))}
        />

        {errors.submit && (
          <ThemedText
            variant="caption"
            color="error"
            className="mt-2 text-center"
          >
            {errors.submit}
          </ThemedText>
        )}
      </ScrollView>

      {/* Pied de page fixe */}
      <View
        className="flex-row gap-3 border-t-[0.5px] border-gray-500/20 px-6 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-1">
          {editing ? (
            <Button title="Supprimer" variant="danger" onPress={handleDelete} />
          ) : (
            <Button
              title="Annuler"
              variant="ghost"
              onPress={() => router.back()}
            />
          )}
        </View>
        <View className="flex-1">
          <Button
            title={editing ? "Enregistrer" : "Créer"}
            variant="primary"
            onPress={handleSubmit}
            loading={isLoading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function IconPicker({
  selectedIcon,
  onSelect,
}: {
  selectedIcon: string;
  onSelect: (icon: string) => void;
}) {
  const colors = useTheme();

  return (
    <View className="flex-row flex-wrap gap-2">
      {CATEGORY_ICON_NAMES.map((name) => {
        const Icon = CATEGORY_ICON_MAP[name];
        if (!Icon) return null;
        const selected = selectedIcon === name;

        return (
          <Pressable
            key={name}
            onPress={() => onSelect(name)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Icône ${name}`}
            className="h-[52px] w-[52px] items-center justify-center rounded-2xl border-[1.5px]"
            style={{
              backgroundColor: selected
                ? colors.primaryLight
                : colors.backgroundSecondary,
              borderColor: selected ? colors.primary : "transparent",
            }}
          >
            <Icon
              size={22}
              strokeWidth={2.2}
              color={selected ? colors.primary : colors.textTertiary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function ColorPicker({
  selectedColor,
  onSelect,
}: {
  selectedColor: string;
  onSelect: (color: string) => void;
}) {
  const colors = useTheme();

  return (
    <View className="flex-row flex-wrap gap-2">
      {UNIQUE_COLORS.map((color) => {
        const selected = selectedColor === color;

        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Couleur ${color}`}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              selected ? "scale-110" : ""
            }`}
          >
            <View
              className="h-[34px] w-[34px] rounded-full border-2"
              style={{
                backgroundColor: color,
                borderColor: selected ? colors.primary : colors.surface,
              }}
            />
            {selected && (
              <View className="absolute h-[34px] w-[34px] items-center justify-center">
                <Check size={14} strokeWidth={3} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function EvenGrid<T>({
  items,
  columns,
  gap = 10,
  renderItem,
  keyExtractor,
}: {
  items: T[];
  columns: number;
  gap?: number;
  renderItem: (item: T, size: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);
  const size =
    width > 0 ? Math.floor((width - gap * (columns - 1)) / columns) : 0;

  return (
    <View
      onLayout={onLayout}
      style={{ flexDirection: "row", flexWrap: "wrap", gap }}
    >
      {size > 0 &&
        items.map((item) => (
          <View key={keyExtractor(item)} style={{ width: size, height: size }}>
            {renderItem(item, size)}
          </View>
        ))}
    </View>
  );
}
