// components/WebTooltip.js
import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

const WebTooltip = ({ children, tooltip, onPress, style, accessible = true, accessibilityLabel, ...props }) => {
  const webProps = Platform.OS === 'web' ? {
    title: tooltip,
    onMouseEnter: (e) => {
      if (e.target) {
        e.target.title = tooltip;
      }
    },
    style: [
      style,
      {
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }
    ]
  } : { style };

  return (
    <TouchableOpacity
      onPress={onPress}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel || tooltip}
      {...webProps}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default WebTooltip;
