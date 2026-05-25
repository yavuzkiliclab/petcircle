// ThemeContext is now handled by SettingsContext.
// This re-export keeps backwards compatibility.
export { useSettings as useTheme, SettingsProvider as ThemeProvider } from './SettingsContext';
