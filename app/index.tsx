import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cpu, Binary, Sparkles } from 'lucide-react-native';
import { THEME } from './theme';
import { Stack, useNavigation } from 'expo-router';

import SensorModeScreen from './Screens/SensorModeScreen';
import BinaryModeScreen from './Screens/BinaryModeScreen';


interface GlassCardProps {
  children: React.ReactNode;
  gradientColors: readonly [string, string, ...string[]];
}


function GlassCard({ children, gradientColors }: GlassCardProps) {
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.glassCard}>
        <LinearGradient colors={gradientColors} style={styles.stylesCardGradient} />
        {children}
      </View>
    </View>
  );
}

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<'Splash' | 'Home' | 'SensorMode' | 'BinaryMode'>('Splash');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const navigation = useNavigation(); 

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '', 
    });
  }, [navigation]);

  useEffect(() => {
    if (currentScreen === 'Splash') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        setCurrentScreen('Home');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  
  if (currentScreen === 'Splash') {
    return (
      <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid]} style={styles.container}>
        <Stack.Screen options={{ headerShown: false, title: '' }} />
        <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={[THEME.colors.cyanNeon, '#4FACFE', 'transparent']} style={styles.logoGlow} />
            <Sparkles size={64} color={THEME.colors.cyanNeon} />
          </View>
          <Text style={styles.splashTitle}>SignBridge</Text>
          <Text style={styles.splashSubtitle}>THE AI GESTURE INTERFACES</Text>
          <View style={styles.loadingTrack}>
            <LinearGradient colors={[THEME.colors.cyanNeon, THEME.colors.purpleNeon]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loadingBar} />
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  
  return (
    <LinearGradient colors={[THEME.colors.backgroundStart, THEME.colors.backgroundMid, THEME.colors.backgroundEnd]} style={styles.container}>
      <Stack.Screen options={{ headerShown: false, title: '' }} />
      
      {currentScreen !== 'Home' && (
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => setCurrentScreen('Home')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Hub</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentScreen === 'SensorMode' ? 'Sensor Glove' : 'Binary Matrix'}</Text>
        </View>
      )}

      {currentScreen === 'Home' ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeSub}>SYSTEM ONLINE</Text>
            <Text style={styles.welcomeMain}>Select Interface</Text>
          </View>

          
          <TouchableOpacity activeOpacity={0.8} onPress={() => setCurrentScreen('SensorMode')}>
            <GlassCard gradientColors={['rgba(0, 242, 254, 0.12)', 'rgba(79, 172, 254, 0.05)']}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconFrame, { borderColor: THEME.colors.cyanNeon }]}>
                  <Cpu color={THEME.colors.cyanNeon} size={32} />
                </View>
                <View style={styles.badgeOnline}>
                  <View style={[styles.dot, { backgroundColor: THEME.colors.greenNeon }]} />
                  <Text style={styles.badgeText}>READY</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Sensor-Based Mode</Text>
              <Text style={styles.cardDesc}>Connect external MPU & Flex hardware gloves for spatial, real-time AI sign translation.</Text>
              <Text style={[styles.actionText, { color: THEME.colors.cyanNeon }]}>Initialize Hardware →</Text>
            </GlassCard>
          </TouchableOpacity>

          
          <TouchableOpacity activeOpacity={0.8} onPress={() => setCurrentScreen('BinaryMode')}>
            <GlassCard gradientColors={['rgba(155, 81, 224, 0.12)', 'rgba(224, 170, 255, 0.05)']}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconFrame, { borderColor: THEME.colors.purpleNeon }]}>
                  <Binary color={THEME.colors.purpleNeon} size={32} />
                </View>
                <View style={styles.badgeOnline}>
                  <View style={[styles.dot, { backgroundColor: THEME.colors.greenNeon }]} />
                  <Text style={styles.badgeText}>VIRTUAL</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>Binary Custom Mode</Text>
              <Text style={styles.cardDesc}>High-speed, lightweight translation engine mapped to user-defined discrete hand bit arrays.</Text>
              <Text style={[styles.actionText, { color: THEME.colors.purpleNeon }]}>Boot Binary Engine →</Text>
            </GlassCard>
          </TouchableOpacity>
        </ScrollView>
      ) : currentScreen === 'SensorMode' ? (
        <SensorModeScreen />
      ) : (
        <BinaryModeScreen />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  welcomeContainer: { marginBottom: 32 },
  welcomeSub: { color: THEME.colors.greenNeon, fontSize: 12, fontWeight: '700', letterSpacing: 3, marginBottom: 6 },
  welcomeMain: { color: THEME.colors.textMain, fontSize: 32, fontWeight: '800' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconFrame: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000020' },
  badgeOnline: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, height: 24, borderRadius: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { color: THEME.colors.textMain, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardTitle: { color: THEME.colors.textMain, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  cardDesc: { color: THEME.colors.textDescription, fontSize: 14, lineHeight: 20, marginBottom: 20 },
  actionText: { fontSize: 14, fontWeight: '600' },
  splashContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 140, height: 140, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logoGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.15 },
  splashTitle: { fontSize: 38, fontWeight: '900', color: THEME.colors.textMain, letterSpacing: 2 },
  splashSubtitle: { fontSize: 12, color: THEME.colors.textMuted, letterSpacing: 4, marginTop: 8, marginBottom: 48, fontWeight: '600' },
  loadingTrack: { width: 180, height: 4, backgroundColor: '#1E2243', borderRadius: 2, overflow: 'hidden' },
  loadingBar: { width: '65%', height: '100%' },
  headerNav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#ffffff0a' },
  backButton: { position: 'absolute', left: 24, top: 40, zIndex: 10 },
  backButtonText: { color: THEME.colors.textMuted, fontSize: 14, fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#ffffff', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  
  cardWrapper: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassCard: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  stylesCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
});


