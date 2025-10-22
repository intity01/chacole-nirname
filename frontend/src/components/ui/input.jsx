import React from 'react';

export const Input = React.forwardRef(({ 
  className = '', 
  type = 'text',
  ...props 
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={`
        flex h-12 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-base
        placeholder:text-gray-400 
        focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
        disabled:cursor-not-allowed disabled:opacity-50
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
});

Input.displayName = 'Input';
