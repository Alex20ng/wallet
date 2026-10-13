import { Button, Input, Select, ThemedText } from "@/components/ui";
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_NAMES,
} from "@/constants/category-icons";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "@/i18n";
import { useAppStore } from "@/store/useAppStore";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { alert } from "@/utils/alert";
import {
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
  const { t } = useTranslation();
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
    if (!formData.name.trim()) newErrors.name = t("validation.nameRequired");
    if (!formData.icon) newErrors.icon = t("validation.selectIcon");
    if (!formData.color) newErrors.color = t("validation.selectColor");
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
      setErrors({ submit: t("errors.save") });
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    alert(
      t("categories.deleteTitle"),
      t("categories.deleteMessage", { name: editing.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
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
          {editing ? t("categories.editTitle") : t("categories.newTitle")}
        </ThemedText>

        <Input
          label={t("common.name")}
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
          }
          placeholder={t("categories.namePlaceholder")}
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
          {t("common.type")}
        </ThemedText>
        <Select
          value={formData.type}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, type: value as CategoryType }))
          }
          options={[
            { value: "expense", label: t("common.expense") },
            { value: "income", label: t("common.income") },
            { value: "both", label: t("common.both") },
          ]}
          placeholder={t("categories.typePlaceholder")}
        />

        <ThemedText
          variant="caption"
          weight="medium"
          color="secondary"
          className="mb-2 mt-4"
        >
          {t("common.icon")}
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
          {t("common.color")}
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
            <Button
              title={t("common.delete")}
              variant="danger"
              onPress={handleDelete}
            />
          ) : (
            <Button
              title={t("common.cancel")}
              variant="ghost"
              onPress={() => router.back()}
            />
          )}
        </View>
        <View className="flex-1">
          <Button
            title={editing ? t("common.save") : t("common.create")}
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
  const { t } = useTranslation();

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
            accessibilityLabel={t("common.iconLabel", { name })}
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
  const { t } = useTranslation();

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
            accessibilityLabel={t("common.colorLabel", { color })}
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
