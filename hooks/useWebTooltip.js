// hooks/useWebTooltip.js
import { Platform } from 'react-native';

export const useWebTooltip = (tooltip, accessibilityLabel) => {
  if (Platform.OS !== 'web') {
    return {
      accessible: true,
      accessibilityLabel: accessibilityLabel || tooltip,
    };
  }

  return {
    accessible: true,
    accessibilityLabel: accessibilityLabel || tooltip,
    title: tooltip,
    onMouseEnter: (e) => {
      if (e.target) {
        e.target.title = tooltip;
      }
    },
    style: {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    },
  };
};
