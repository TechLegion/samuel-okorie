# samuel-okorie

A React Native calculator built with Expo for the Git & Mobile App assignment.

## About

This is my personal project submission. I built a fully functional calculator using Expo's React Native framework, applied a custom indigo colour theme, and managed the codebase with Git throughout.

The calculator component uses React's `useState` and `useCallback` hooks for state management, `react-native-reanimated` for smooth press animations, and `expo-haptics` for tactile feedback on physical devices.

---

## Running the project

```bash
npm install
npx expo start
```

Press `w` for web, `a` for Android emulator, or scan the QR code in Expo Go.

## Project structure

```
app/              → Screens (index = calculator, explore = notes)
components/       → calculator.tsx and shared UI components
constants/        → theme.ts (colour definitions)
hooks/            → useColorScheme for dark/light mode detection
```

## Git workflow used

```bash
git init
git add .
git commit -m "feat: calculator app with indigo theme"
git push origin main
```

*Submitted by: Samuel Okorie*
