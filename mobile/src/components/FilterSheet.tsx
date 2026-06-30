import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions, TouchableWithoutFeedback,
} from 'react-native';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible, onClose, title = 'Filter', options, selected, onSelect,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
        <View style={s.handle} />
        <Text style={s.title}>{title}</Text>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={s.row}
            onPress={() => handleSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[s.rowLabel, selected === opt.value && s.rowLabelActive]}>
              {opt.label}
            </Text>
            <View style={[s.radio, selected === opt.value && s.radioActive]}>
              {selected === opt.value && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFDF9', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB',
    alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 15, color: '#374151' },
  rowLabelActive: { color: '#00658E', fontWeight: '700' },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: '#00658E' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00658E' },
  cancelBtn: {
    marginTop: 16, backgroundColor: '#F3F4F6', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#374151' },
});
