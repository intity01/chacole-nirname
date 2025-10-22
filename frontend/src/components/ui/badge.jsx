import React from 'react';

export const Badge = React.forwardRef(({ 
  className = '', 
  variant = 'default',
  children,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-blue-500 text-white',
    secondary: 'bg-gray-200 text-gray-700',
    success: 'bg-green-500 text-white',
    danger: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
  };
  
  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

