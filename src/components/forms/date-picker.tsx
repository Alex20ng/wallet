import React, { forwardRef, ComponentRef } from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ThemedText, Modal } from '../ui';
import { useTheme } from '../../hooks/use-theme';
import { spacing, borderRadius } from '../../constants/theme';
import { startOfMonth, addMonths, isSameDay, getDaysInMonth } from '../../services/date';
import { formatDate } from '../../services/currency';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  required?: boolean;
  mode?: 'date' | 'month';
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const DatePicker = forwardRef<ComponentRef<typeof Pressable>, DatePickerProps>(
  ({
    value,
    onChange,
    label,
    placeholder = 'Choisir une date',
    minDate,
    maxDate,
    disabled = false,
    required = false,
    mode = 'date',
    testID,
    accessibilityLabel,
    style,
  }, ref) => {
    const colors = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(value));

    const handlePress = () => {
      if (!disabled) {
        setCurrentMonth(startOfMonth(value));
        setIsOpen(true);
      }
    };

    const handleDayPress = (day: Date) => {
      if (disabled) return;
      if (minDate && day < minDate) return;
      if (maxDate && day > maxDate) return;
      onChange(day);
      setIsOpen(false);
    };

    const handleMonthPress = (month: Date) => {
      if (disabled) return;
      if (minDate && month < startOfMonth(minDate)) return;
      if (maxDate && month > startOfMonth(maxDate)) return;
      const newDate = new Date(month);
      newDate.setDate(Math.min(value.getDate(), getDaysInMonth(month.getFullYear(), month.getMonth())));
      onChange(newDate);
      setIsOpen(false);
    };

    const renderMonthGrid = () => {
      const months = Array.from({ length: 12 }, (_, i) => new Date(currentMonth.getFullYear(), i, 1));

      return (
        <View style={styles.monthGrid}>
          {months.map((month) => {
            const isSelected = month.getFullYear() === value.getFullYear() && month.getMonth() === value.getMonth();
            const isCurrent = month.getFullYear() === currentMonth.getFullYear() && month.getMonth() === currentMonth.getMonth();
            const isDisabled = Boolean(
              (minDate && month < startOfMonth(minDate)) || (maxDate && month > startOfMonth(maxDate)),
            );

            return (
              <Pressable
                key={`${month.getFullYear()}-${month.getMonth()}`}
                onPress={() => handleMonthPress(month)}
                disabled={isDisabled}
                style={[
                  styles.monthCell,
                  { backgroundColor: colors.backgroundSecondary },
                  isSelected && { backgroundColor: colors.primary },
                  isCurrent && !isSelected && { backgroundColor: colors.primaryLight },
                  isDisabled && styles.cellDisabled,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected, disabled: isDisabled }}
              >
                <ThemedText
                  variant="caption"
                  weight={isSelected || isCurrent ? 'semibold' : 'regular'}
                  color={isSelected ? 'inverse' : isDisabled ? 'tertiary' : isCurrent ? 'link' : 'primary'}
                >
                  {month.toLocaleString('fr-FR', { month: 'short' })}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      );
    };

    const renderDayGrid = () => {
      const firstDay = startOfMonth(currentMonth);
      const startDayOfWeek = firstDay.getDay();
      const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
      const prevMonthDays = startDayOfWeek;

      const days: Date[] = [];

      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const prevMonthDaysCount = getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
      for (let i = prevMonthDaysCount - prevMonthDays + 1; i <= prevMonthDaysCount; i++) {
        days.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i));
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
      }

      const totalCells = Math.ceil(days.length / 7) * 7;
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      for (let i = days.length; i < totalCells; i++) {
        days.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i - daysInMonth - prevMonthDays + 1));
      }

      const weeks: Date[][] = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }

      return (
        <View>
          <View style={styles.weekHeader}>
            {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day) => (
              <ThemedText key={day} variant="overline" color="tertiary" style={styles.weekDay}>
                {day}
              </ThemedText>
            ))}
          </View>
          <View style={styles.dayGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((day, dayIndex) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                  const isSelected = isSameDay(day, value);
                  const isToday = isSameDay(day, new Date());
                  const isDisabled = !isCurrentMonth
                    || Boolean(minDate && day < minDate)
                    || Boolean(maxDate && day > maxDate);

                  return (
                    <Pressable
                      key={day.getTime()}
                      onPress={() => handleDayPress(day)}
                      disabled={isDisabled}
                      style={[
                        styles.dayCell,
                        isSelected && { backgroundColor: colors.primary },
                        isToday && !isSelected && {
                          borderWidth: 1.5,
                          borderColor: colors.primary,
                        },
                        !isCurrentMonth && styles.cellOtherMonth,
                        isDisabled && styles.cellDisabled,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                      accessibilityLabel={day.toLocaleDateString('fr-FR')}
                    >
                      <ThemedText
                        variant="caption"
                        weight={isSelected || isToday ? 'semibold' : 'regular'}
                        color={
                          isSelected ? 'inverse'
                          : isToday && !isSelected ? 'link'
                          : !isCurrentMonth || isDisabled ? 'tertiary'
                          : 'primary'
                        }
                      >
                        {day.getDate()}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      );
    };

    return (
      <View style={style}>
        {label && (
          <ThemedText variant="caption" weight="medium" color="secondary" style={styles.label}>
            {label} {required && <ThemedText color="error">*</ThemedText>}
          </ThemedText>
        )}
        <Pressable
          ref={ref}
          onPress={handlePress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || label}
          accessibilityState={{ disabled }}
          style={[
            styles.input,
            {
              borderColor: isOpen ? colors.borderFocus : colors.border,
              borderWidth: isOpen ? 1.5 : 1,
              backgroundColor: disabled ? colors.backgroundSecondary : colors.surface,
            },
          ]}
          testID={testID}
        >
          <ThemedText variant="body" color={value ? 'primary' : 'tertiary'} style={styles.inputText}>
            {value ? formatDate(value) : placeholder}
          </ThemedText>
          <Calendar size={18} strokeWidth={2} color={colors.textTertiary} />
        </Pressable>

        <Modal
          visible={isOpen}
          onClose={() => setIsOpen(false)}
          size="lg"
          showHandle={true}
          title={label || 'Choisir une date'}
        >
          <View style={styles.calendarHeader}>
            <Pressable
              onPress={() => setCurrentMonth(addMonths(currentMonth, -1))}
              style={[styles.navButton, { backgroundColor: colors.backgroundSecondary }]}
              accessibilityLabel="Mois précédent"
              hitSlop={8}
            >
              <ChevronLeft size={18} strokeWidth={2.4} color={colors.textPrimary} />
            </Pressable>
            <ThemedText variant="subtitle" weight="semibold" style={styles.monthTitle}>
              {currentMonth.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
            </ThemedText>
            <Pressable
              onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
              style={[styles.navButton, { backgroundColor: colors.backgroundSecondary }]}
              accessibilityLabel="Mois suivant"
              hitSlop={8}
            >
              <ChevronRight size={18} strokeWidth={2.4} color={colors.textPrimary} />
            </Pressable>
          </View>
          {mode === 'month' ? renderMonthGrid() : renderDayGrid()}
        </Modal>
      </View>
    );
  }
);

DatePicker.displayName = 'DatePicker';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md + 2,
    borderWidth: 1,
  },
  inputText: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekDay: {
    width: 36,
    textAlign: 'center',
  },
  dayGrid: {
    gap: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  cellOtherMonth: {
    opacity: 0.35,
  },
  cellDisabled: {
    opacity: 0.3,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  monthCell: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
});

export default DatePicker;
