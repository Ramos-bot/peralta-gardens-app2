// components/GlobalTooltipWrapper.js
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useWebTooltip } from '../hooks/useWebTooltip';

// Enhanced TouchableOpacity with automatic tooltips
export const TooltipTouchableOpacity = ({ 
  children, 
  tooltip, 
  onPress, 
  style, 
  disabled = false,
  ...props 
}) => {
  const tooltipProps = useWebTooltip(tooltip);
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[style, disabled && { opacity: 0.5 }]}
      disabled={disabled}
      {...tooltipProps}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

// Enhanced Text component with tooltips for buttons
export const TooltipText = ({ 
  children, 
  tooltip, 
  style, 
  ...props 
}) => {
  const tooltipProps = useWebTooltip(tooltip);
  
  return (
    <Text
      style={style}
      {...tooltipProps}
      {...props}
    >
      {children}
    </Text>
  );
};

// Enhanced View wrapper for clickable cards
export const TooltipView = ({ 
  children, 
  tooltip, 
  onPress, 
  style,
  ...props 
}) => {
  const tooltipProps = useWebTooltip(tooltip);
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={style}
        {...tooltipProps}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View
      style={style}
      {...tooltipProps}
      {...props}
    >
      {children}
    </View>
  );
};

export default {
  TooltipTouchableOpacity,
  TooltipText,
  TooltipView,
};
