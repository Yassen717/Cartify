import { useThemeStore } from '../../stores/themeStore';
import { HiSun, HiMoon } from 'react-icons/hi';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className={`${styles.icon} ${isDark ? styles.hidden : ''}`}>
        <HiSun size={18} />
      </span>
      <span className={`${styles.icon} ${isDark ? '' : styles.hidden}`}>
        <HiMoon size={18} />
      </span>
    </button>
  );
}
