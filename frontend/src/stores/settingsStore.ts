import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ThemeMode } from '../types/hymn';
import { dbService } from '../services/db';

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeMode>('dark');
  const fontSize = ref<number>(18);
  const seniorMode = ref<boolean>(false);
  const keepScreenOn = ref<boolean>(true);

  const applyTheme = (newTheme: ThemeMode) => {
    let effectiveTheme = newTheme;
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      if (effectiveTheme === 'dark') metaThemeColor.setAttribute('content', '#0b0f19');
      else if (effectiveTheme === 'sepia') metaThemeColor.setAttribute('content', '#f4ecd8');
      else metaThemeColor.setAttribute('content', '#ffffff');
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    theme.value = newTheme;
    applyTheme(newTheme);
    await dbService.setSetting('theme', newTheme);
  };

  const setFontSize = async (size: number) => {
    // Clamp between 14px and 36px (200% of standard 18px)
    const clamped = Math.min(36, Math.max(14, size));
    fontSize.value = clamped;
    document.documentElement.style.setProperty('--hymn-font-size', `${clamped}px`);
    await dbService.setSetting('fontSize', clamped);
  };

  const increaseFontSize = () => {
    setFontSize(fontSize.value + 2);
  };

  const decreaseFontSize = () => {
    setFontSize(fontSize.value - 2);
  };

  const resetFontSize = () => {
    setFontSize(18);
  };

  const setSeniorMode = async (enabled: boolean) => {
    seniorMode.value = enabled;
    if (enabled) {
      document.documentElement.classList.add('senior-mode');
      if (fontSize.value < 22) {
        setFontSize(24);
      }
    } else {
      document.documentElement.classList.remove('senior-mode');
    }
    await dbService.setSetting('seniorMode', enabled);
  };

  const setKeepScreenOn = async (enabled: boolean) => {
    keepScreenOn.value = enabled;
    await dbService.setSetting('keepScreenOn', enabled);
  };

  const initSettings = async () => {
    const savedTheme = await dbService.getSetting<ThemeMode>('theme', 'dark');
    const savedFontSize = await dbService.getSetting<number>('fontSize', 18);
    const savedSeniorMode = await dbService.getSetting<boolean>('seniorMode', false);
    const savedKeepScreenOn = await dbService.getSetting<boolean>('keepScreenOn', true);

    theme.value = savedTheme;
    fontSize.value = savedFontSize;
    seniorMode.value = savedSeniorMode;
    keepScreenOn.value = savedKeepScreenOn;

    applyTheme(savedTheme);
    document.documentElement.style.setProperty('--hymn-font-size', `${savedFontSize}px`);
    if (savedSeniorMode) {
      document.documentElement.classList.add('senior-mode');
    }
  };

  return {
    theme,
    fontSize,
    seniorMode,
    keepScreenOn,
    setTheme,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setSeniorMode,
    setKeepScreenOn,
    initSettings
  };
});
