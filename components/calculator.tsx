import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Dimensions, Platform, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming,
  useSharedValue 
} from 'react-native-reanimated';

const { width: windowWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_APP_WIDTH = 500;
const APP_WIDTH = isWeb ? Math.min(windowWidth, MAX_APP_WIDTH) : windowWidth;
const BUTTON_GAP = 12;
const PADDING = 12;
const BUTTON_WIDTH = (APP_WIDTH - (PADDING * 2) - (3 * BUTTON_GAP)) / 4;

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isResult, setIsResult] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  
  const displayScale = useSharedValue(1);

  // Define animated styles early
  const animatedDisplayContainer = useAnimatedStyle(() => {
    return {
      transform: [{ scale: displayScale.value }]
    };
  });

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const animatePress = () => {
    displayScale.value = withSequence(
      withTiming(1.05, { duration: 50 }),
      withSpring(1)
    );
  };

  const handlePress = useCallback((value: string) => {
    triggerHaptic();
    animatePress();

    if (value === 'AC') {
      setDisplay('0');
      setEquation('');
      setIsResult(false);
      return;
    }

    if (value === 'C') {
      if (isResult) {
        setDisplay('0');
        setIsResult(false);
      } else {
        setDisplay(display.length === 1 ? '0' : display.slice(0, -1));
      }
      return;
    }

    if (value === '=') {
      if (!equation && !isResult) return;
      try {
        let finalEquation = equation + display;
        const sanitized = finalEquation.replace(/×/g, '*').replace(/÷/g, '/');
        const result = Function(`'use strict'; return (${sanitized})`)();
        
        if (isNaN(result) || !isFinite(result)) {
            setDisplay('Error');
        } else {
            const resultStr = String(Number(result.toFixed(8)));
            setDisplay(resultStr);
        }
        setEquation('');
        setIsResult(true);
      } catch (e) {
        setDisplay('Error');
        setEquation('');
        setIsResult(true);
      }
      return;
    }

    if (['+', '-', '*', '/'].includes(value)) {
      if (isResult) {
        setEquation(display + ' ' + value + ' ');
        setDisplay('0');
        setIsResult(false);
        return;
      }
      if (display === '0' && equation) {
        setEquation(equation.slice(0, -3) + ' ' + value + ' ');
        return;
      }
      setEquation(equation + display + ' ' + value + ' ');
      setDisplay('0');
      return;
    }

    if (value === '.') {
      if (isResult) {
        setDisplay('0.');
        setIsResult(false);
      } else if (!display.includes('.')) {
        setDisplay(display + '.');
      }
      return;
    }

    if (value === '%') {
        const val = parseFloat(display) / 100;
        setDisplay(String(val));
        return;
    }

    if (isResult) {
      setDisplay(value);
      setIsResult(false);
    } else {
      setDisplay(display === '0' ? value : display + value);
    }
  }, [display, equation, isResult, displayScale]); // Added displayScale to deps

  const renderButton = (label: string, type: 'num' | 'op' | 'spec' = 'num') => {
    let bgColor = colorScheme === 'dark' ? '#262626' : '#F5F5F5';
    let textColor = theme.text;

    if (type === 'op') {
      bgColor = theme.tint;
      textColor = '#FFFFFF';
    } else if (type === 'spec') {
      bgColor = colorScheme === 'dark' ? '#404040' : '#E5E5E5';
    }

    const isZero = label === '0';

    return (
      <Pressable
        key={label}
        onPress={() => handlePress(label)}
        style={({ pressed }) => [
          styles.button,
          { 
            backgroundColor: pressed ? (type === 'op' ? '#84CC16' : (colorScheme === 'dark' ? '#525252' : '#D4D4D4')) : bgColor,
            width: isZero ? (BUTTON_WIDTH * 2) + BUTTON_GAP : BUTTON_WIDTH,
            transform: [{ scale: pressed ? 0.95 : 1 }]
          }
        ]}>
        <ThemedText style={[
          styles.buttonText, 
          { color: textColor },
          type === 'op' && { fontSize: 32 }
        ]}>
          {label === '*' ? '×' : label === '/' ? '÷' : label}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.outerContainer}>
      <ThemedView style={styles.container}>
        <Animated.View style={[styles.displayContainer, animatedDisplayContainer]}>
          <ThemedText style={styles.equationText} numberOfLines={1} ellipsizeMode="head">
            {equation}
          </ThemedText>
          <ThemedText 
            style={styles.displayText} 
            numberOfLines={1} 
            adjustsFontSizeToFit 
            minimumFontScale={0.3}
          >
            {display}
          </ThemedText>
        </Animated.View>

        <View style={styles.buttonsContainer}>
          <View style={styles.row}>
            {renderButton('AC', 'spec')}
            {renderButton('C', 'spec')}
            {renderButton('%', 'spec')}
            {renderButton('/', 'op')}
          </View>
          <View style={styles.row}>
            {renderButton('7')}
            {renderButton('8')}
            {renderButton('9')}
            {renderButton('*', 'op')}
          </View>
          <View style={styles.row}>
            {renderButton('4')}
            {renderButton('5')}
            {renderButton('6')}
            {renderButton('-', 'op')}
          </View>
          <View style={styles.row}>
            {renderButton('1')}
            {renderButton('2')}
            {renderButton('3')}
            {renderButton('+', 'op')}
          </View>
          <View style={styles.row}>
            {renderButton('0')}
            {renderButton('.')}
            {renderButton('=', 'op')}
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: APP_WIDTH,
    maxWidth: MAX_APP_WIDTH,
    padding: PADDING,
    justifyContent: 'flex-end',
    height: isWeb ? 720 : '100%',
    borderRadius: isWeb ? 32 : 0,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 10,
      }
    })
  },
  displayContainer: {
    width: '100%',
    paddingHorizontal: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 160,
    marginBottom: 10,
  },
  equationText: {
    fontSize: 18,
    opacity: 0.5,
    marginBottom: 2,
    fontWeight: '400',
    textAlign: 'right',
    width: '100%',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'monospace' }),
  },
  displayText: {
    fontSize: 88,
    fontWeight: '200',
    letterSpacing: -2,
    textAlign: 'right',
    width: '100%',
  },
  buttonsContainer: {
    gap: BUTTON_GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: BUTTON_GAP,
  },
  button: {
    height: BUTTON_WIDTH,
    borderRadius: BUTTON_WIDTH / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }
    })
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '400',
  },
});
