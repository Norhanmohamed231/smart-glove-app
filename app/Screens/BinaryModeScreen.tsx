import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../theme';

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

export default function BinaryModeScreen() {
  const [binaryBits, setBinaryBits] = useState([1, 0, 1, 1, 0]);
  const insets = useSafeAreaInsets();

  const toggleBit = (index: number) => {
    const updatedBits = [...binaryBits];
    updatedBits[index] = updatedBits[index] === 1 ? 0 : 1;
    setBinaryBits(updatedBits);
  };

  // حساب دقيق لعرض الزر الواحد على الموبايل بناءً على العرض الفعلي الحالي
  // العرض الكلي - البادينج اليمين والشمال (40) - المسافات بين الأزرار الأربعة (32) مقسوماً على 5
  const mobileNodeWidth = (screenWidth - 40 - 32) / 5;

  return (
    <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid]} style={styles.container}>
      <ScrollView 
        contentContainerStyle={[
          styles.innerContainer, 
          !isWeb && { 
            paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 24, 
            paddingBottom: insets.bottom + 30 
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>BIT MATRIX CONTROLLER</Text>
        
        {/* صف مصفوفة البتات الخمسة */}
        <View style={styles.bitContainer}>
          {binaryBits.map((bit, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.bitNode, 
                { width: isWeb ? (screenWidth - 48 - 32) / 5 : mobileNodeWidth },
                bit === 1 ? styles.bitNodeOn : styles.bitNodeOff
              ]}
              onPress={() => toggleBit(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.bitIndex}>F{index + 1}</Text>
              <Text style={[styles.bitValue, { color: bit === 1 ? THEME.colors.greenNeon : THEME.colors.textMuted }]}>
                {bit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* كارت عرض الترجمة الفورية */}
        <View style={styles.predictionBox}>
          <LinearGradient colors={['#251A3E', '#161026']} style={StyleSheet.absoluteFillObject} />
          <Text style={[styles.predictionLabel, { color: THEME.colors.purpleNeon }]}>CURRENT SIGN MAPPING</Text>
          <Text style={[styles.predictionOutput, { color: '#E0AAFF' }]}>
            {binaryBits.join('') === '10110' ? 'EMERGENCY' : 'CUSTOM_0' + binaryBits.join('')}
          </Text>
        </View>

        {/* كارت عرض النص المحفوظ وترجمته الصوتية */}
        <View style={styles.speechCard}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.speechLabel, { color: THEME.colors.purpleNeon }]}>SAVED PHRASE</Text>
            <Text style={styles.speechStream} numberOfLines={3}>Immediate assistance requested.</Text>
          </View>
          <TouchableOpacity style={styles.ttsButton} activeOpacity={0.6}>
            <Volume2 color={THEME.colors.purpleNeon} size={isWeb ? 24 : 22} />
          </TouchableOpacity>
        </View>

        {/* زر مزامنة القاموس المخصص السفلية */}
        <TouchableOpacity style={styles.refreshButton} activeOpacity={0.7}>
          <RefreshCw color={THEME.colors.purpleNeon} size={18} />
          <Text style={styles.refreshText}>Sync Custom Dictionary</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { paddingHorizontal: isWeb ? 24 : 20, paddingTop: 20 },
  sectionLabel: { color: THEME.colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  
  bitContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: isWeb ? 32 : 24 
  },
  
  bitNode: { 
    
    height: isWeb ? 80 : 72, 
    borderRadius: 14, 
    borderWidth: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  bitNodeOn: { backgroundColor: 'rgba(57, 255, 20, 0.08)', borderColor: 'rgba(57, 255, 20, 0.3)' },
  bitNodeOff: { backgroundColor: '#16172B', borderColor: THEME.colors.cardBorder },
  bitIndex: { color: THEME.colors.textMuted, fontSize: isWeb ? 11 : 10, fontWeight: '600', marginBottom: 2 },
  bitValue: { fontSize: isWeb ? 24 : 20, fontWeight: '800' },
  
  predictionBox: { 
    height: isWeb ? 180 : 140, 
    borderRadius: 24, 
    overflow: 'hidden', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: isWeb ? 24 : 20, 
    borderWidth: 1, 
    borderColor: THEME.colors.cardBorder 
  },
  predictionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: isWeb ? 3 : 2, marginBottom: isWeb ? 12 : 6 },
  predictionOutput: { fontSize: isWeb ? 36 : 28, fontWeight: '900' },
  
  speechCard: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.02)', 
    borderWidth: 1, 
    borderColor: THEME.colors.cardBorder, 
    padding: isWeb ? 20 : 16, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  speechLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  speechStream: { color: THEME.colors.textMain, fontSize: isWeb ? 16 : 14, fontWeight: '500' },
  
  ttsButton: { 
    width: isWeb ? 48 : 42, 
    height: isWeb ? 48 : 42, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(155, 81, 224, 0.2)', 
    backgroundColor: 'rgba(155, 81, 224, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: isWeb ? 16 : 10 
  },
  refreshButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: isWeb ? 24 : 20, 
    padding: isWeb ? 16 : 14, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(155, 81, 224, 0.3)' 
  },
  refreshText: { color: THEME.colors.purpleNeon, fontSize: 14, fontWeight: '600', marginLeft: 8 }
});

