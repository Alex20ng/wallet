import { Button, Select, ThemedText } from "@/components/ui";
import {
  CATEGORY_COLORS,
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_NAMES,
} from "@/constants/category-icons";
import { borderRadius, spacing } from "@/constants/theme";
import { haptics } from "@/hooks/use-haptics";
import { useTheme } from "@/hooks/use-theme";
import { useAppStore } from "@/store/useAppStore";
import type { Category } from "@/types";
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface CategoryFormSheetRef {
  present: (category?: Category) => void;
  dismiss: () => void;
}

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: "expense" | "income" | "both";
}

const ICON_COLUMNS = 6;
const COLOR_COLUMNS = 7;
const GRID_GAP = 8;

export const CategoryFormSheet = forwardRef<CategoryFormSheetRef>(
  (_props, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const { dismiss } = useBottomSheetModal();
    const insets = useSafeAreaInsets();
    const colors = useTheme();

    const { addCategory, updateCategory, deleteCategory, isLoading } =
      useAppStore();

    const [editingCategory, setEditingCategory] = useState<Category | null>(
      null,
    );
    const [formData, setFormData] = useState<CategoryFormData>({
      name: "",
      icon: CATEGORY_ICON_NAMES[0],
      color: CATEGORY_COLORS[0],
      type: "expense",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [iconWidth, setIconWidth] = useState(0);
    const [colorWidth, setColorWidth] = useState(0);

    const iconItemSize = useMemo(() => {
      if (iconWidth === 0) return 52;
      const gap = spacing.sm * (ICON_COLUMNS - 1);
      const size = Math.floor((iconWidth - gap) / ICON_COLUMNS);
      return Math.max(44, size);
    }, [iconWidth]);

    const colorItemSize = useMemo(() => {
      if (colorWidth === 0) return 44;
      const gap = spacing.sm * (COLOR_COLUMNS - 1);
      const size = Math.floor((colorWidth - gap) / COLOR_COLUMNS);
      return Math.max(36, size);
    }, [colorWidth]);

    const snapPoints = useMemo(() => ["85%"], []);

    useImperativeHandle(ref, () => ({
      present: (category) => {
        haptics.impact(haptics.ImpactFeedbackStyle.Light);
        if (category) {
          setEditingCategory(category);
          setFormData({
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type,
          });
        } else {
          setEditingCategory(null);
          setFormData({
            name: "",
            icon: CATEGORY_ICON_NAMES[0],
            color: CATEGORY_COLORS[0],
            type: "expense",
          });
        }
        setErrors({});
        bottomSheetRef.current?.present();
      },
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};
      if (!formData.name.trim()) newErrors.name = "Le nom est requis";
      if (!formData.icon) newErrors.icon = "Sélectionnez une icône";
      if (!formData.color) newErrors.color = "Sélectionnez une couleur";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
      if (!validateForm()) {
        await haptics.notification(haptics.NotificationFeedbackType.Error);
        return;
      }

      await haptics.impact(haptics.ImpactFeedbackStyle.Medium);

      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, formData);
        } else {
          await addCategory({
            ...formData,
            isDefault: false,
            sortOrder: 0,
          });
        }
        await haptics.notification(haptics.NotificationFeedbackType.Success);
        bottomSheetRef.current?.dismiss();
      } catch {
        await haptics.notification(haptics.NotificationFeedbackType.Error);
        setErrors({ submit: "Erreur lors de la sauvegarde" });
      }
    }, [addCategory, editingCategory, formData, updateCategory, validateForm]);

    const handleDelete = useCallback(() => {
      if (!editingCategory) return;
      Alert.alert(
        "Supprimer la catégorie",
        `Voulez-vous supprimer « ${editingCategory.name} » ? Les transactions associées ne seront pas supprimées.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              await haptics.impact(haptics.ImpactFeedbackStyle.Heavy);
              try {
                await deleteCategory(editingCategory.id);
                await haptics.notification(
                  haptics.NotificationFeedbackType.Success,
                );
                bottomSheetRef.current?.dismiss();
              } catch {
                await haptics.notification(
                  haptics.NotificationFeedbackType.Error,
                );
              }
            },
          },
        ],
      );
    }, [deleteCategory, editingCategory]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      [],
    );

    const renderFooter = useCallback(
      (props: any) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              backgroundColor: colors.surface,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              {editingCategory ? (
                <Button
                  title="Supprimer"
                  onPress={handleDelete}
                  variant="danger"
                />
              ) : (
                <Button
                  title="Annuler"
                  onPress={() => dismiss()}
                  variant="ghost"
                />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Button
                title={editingCategory ? "Enregistrer" : "Créer"}
                onPress={handleSubmit}
                variant="primary"
                loading={isLoading}
              />
            </View>
          </View>
        </BottomSheetFooter>
      ),
      [
        dismiss,
        editingCategory,
        handleDelete,
        handleSubmit,
        insets.bottom,
        isLoading,
      ],
    );

    const handleIconLayout = useCallback((event: LayoutChangeEvent) => {
      setIconWidth(event.nativeEvent.layout.width);
    }, []);

    const handleColorLayout = useCallback((event: LayoutChangeEvent) => {
      setColorWidth(event.nativeEvent.layout.width);
    }, []);

    const typeOptions = useMemo(
      () => [
        { value: "expense", label: "Dépense" },
        { value: "income", label: "Revenu" },
        { value: "both", label: "Les deux" },
      ],
      [],
    );

    const [iconGridWidth, setIconGridWidth] = useState(0);

    // Math.floor évite que la somme des cases dépasse la largeur

    const iconRows = useMemo(() => {
      const rows: string[][] = [];
      for (let i = 0; i < CATEGORY_ICON_NAMES.length; i += ICON_COLUMNS) {
        rows.push(CATEGORY_ICON_NAMES.slice(i, i + ICON_COLUMNS));
      }
      return rows;
    }, []);

    const colorRows = useMemo(
      () =>
        Array.from(
          { length: Math.ceil(CATEGORY_COLORS.length / COLOR_COLUMNS) },
          (_, i) =>
            CATEGORY_COLORS.slice(i * COLOR_COLUMNS, (i + 1) * COLOR_COLUMNS),
        ),
      [],
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        handleComponent={null}
        style={{ backgroundColor: "transparent" }}
        backgroundStyle={{ backgroundColor: colors.surface }}
      >
        <BottomSheetScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="py-5">
            <ThemedText
              variant="subtitle"
              weight="bold"
              className="text-center"
            >
              {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </ThemedText>
          </View>

          <View className="mt-4 gap-4">
            <View>
              <ThemedText
                variant="caption"
                weight="medium"
                color="secondary"
                className="mb-2 ml-1"
              >
                Nom <ThemedText color="error">*</ThemedText>
              </ThemedText>
              <BottomSheetTextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Ex: Courses, Transport..."
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: errors.name ? colors.error : colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                accessibilityLabel="Nom de la catégorie"
              />
              {errors.name && (
                <ThemedText
                  variant="caption"
                  color="error"
                  className="ml-1 mt-1"
                >
                  {errors.name}
                </ThemedText>
              )}
            </View>

            <View>
              <ThemedText
                variant="caption"
                weight="medium"
                color="secondary"
                className="mb-2 ml-1"
              >
                Type
              </ThemedText>
              <Select
                value={formData.type}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as typeof formData.type,
                  }))
                }
                options={typeOptions}
                placeholder="Type de transaction"
              />
            </View>

            <View>
              <ThemedText
                variant="caption"
                weight="medium"
                color="secondary"
                className="mb-2 ml-1"
              >
                Icône
              </ThemedText>

              {/* onLayout sur la grille elle-même */}
              <View onLayout={handleIconLayout} style={{ gap: GRID_GAP }}>
                {iconItemSize > 0 &&
                  iconRows.map((row, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={{ flexDirection: "row", gap: GRID_GAP }}
                    >
                      {row.map((name) => {
                        const Icon = CATEGORY_ICON_MAP[name];
                        if (!Icon) return null;
                        const selected = formData.icon === name;

                        return (
                          <Pressable
                            key={name}
                            onPress={() =>
                              setFormData((prev) => ({ ...prev, icon: name }))
                            }
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            accessibilityLabel={`Icône ${name}`}
                            style={[
                              styles.pickerItem,
                              {
                                width: iconItemSize,
                                height: iconItemSize,
                                backgroundColor: selected
                                  ? colors.primaryLight
                                  : colors.backgroundSecondary,
                                borderColor: selected
                                  ? colors.primary
                                  : "transparent",
                              },
                            ]}
                          >
                            <Icon
                              size={Math.max(18, iconItemSize * 0.42)}
                              strokeWidth={2.2}
                              color={
                                selected ? colors.primary : colors.textTertiary
                              }
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
              </View>

              {errors.icon && (
                <ThemedText
                  variant="caption"
                  color="error"
                  className="ml-1 mt-1"
                >
                  {errors.icon}
                </ThemedText>
              )}
            </View>
            <View onLayout={handleColorLayout} className="mb-2">
              <ThemedText
                variant="caption"
                weight="medium"
                color="secondary"
                className="mb-2 ml-1"
              >
                Couleur
              </ThemedText>
              <View onLayout={handleColorLayout} style={{ gap: GRID_GAP }}>
                {colorItemSize > 0 &&
                  colorRows.map((row, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={{ flexDirection: "row", gap: GRID_GAP }}
                    >
                      {row.map((color) => {
                        const selected = formData.color === color;
                        const circleSize = Math.max(
                          28,
                          Math.round(colorItemSize * 0.77),
                        );

                        return (
                          <Pressable
                            key={color}
                            onPress={() =>
                              setFormData((prev) => ({ ...prev, color }))
                            }
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            accessibilityLabel={`Couleur ${color}`}
                            style={[
                              styles.colorItem,
                              { width: colorItemSize, height: colorItemSize },
                              selected && styles.colorItemSelected,
                            ]}
                          >
                            <View
                              style={[
                                styles.colorCircle,
                                {
                                  width: circleSize,
                                  height: circleSize,
                                  borderRadius: circleSize / 2,
                                  backgroundColor: color,
                                  borderColor: selected
                                    ? colors.primary
                                    : colors.surface,
                                },
                              ]}
                            />
                            {selected && (
                              <View
                                style={[
                                  styles.colorCheck,
                                  { width: circleSize, height: circleSize },
                                ]}
                              >
                                <Check
                                  size={Math.max(
                                    12,
                                    Math.round(circleSize * 0.41),
                                  )}
                                  strokeWidth={3}
                                  color="#FFFFFF"
                                />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
              </View>

              {errors.color && (
                <ThemedText
                  variant="caption"
                  color="error"
                  className="ml-1 mt-1"
                >
                  {errors.color}
                </ThemedText>
              )}
              {errors.color && (
                <ThemedText
                  variant="caption"
                  color="error"
                  className="ml-1 mt-1"
                >
                  {errors.color}
                </ThemedText>
              )}
            </View>

            {errors.submit && (
              <ThemedText
                variant="caption"
                color="error"
                className="text-center"
              >
                {errors.submit}
              </ThemedText>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

CategoryFormSheet.displayName = "CategoryFormSheet";

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
  },
  pickerItem: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  colorItem: {
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  colorItemSelected: {
    transform: [{ scale: 1.08 }],
  },
  colorCircle: {
    borderWidth: 2,
  },
  colorCheck: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CategoryFormSheet;
