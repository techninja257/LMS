import React from 'react';

/**
 * FormSelect component for dropdown select inputs
 * @param {Object} props - Component props
 * @param {string} props.id - Select ID
 * @param {string} props.name - Select name
 * @param {Array} props.options - Array of options [{value, label}]
 * @param {string} [props.label] - Select label
 * @param {string} [props.placeholder] - Select placeholder
 * @param {string|number} [props.value] - Select value
 * @param {Function} [props.onChange] - Select change handler
 * @param {Function} [props.onBlur] - Select blur handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether select is required
 * @param {boolean} [props.disabled=false] - Whether select is disabled
 * @param {string} [props.className] - Additional CSS classes for select
 * @param {string} [props.labelClassName] - Additional CSS classes for label
 * @param {string} [props.helpText] - Help text to display below select
 * @returns {React.ReactElement} - FormSelect component
 */
const FormSelect = ({
  id,
  name,
  options = [],
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  helpText,
  ...rest
}) => {
  // Generate unique ID if none provided
  const selectId = id || `select-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select element */}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
            appearance-none bg-white
            ${error ? 'border-danger-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      )}
      
      {/* Help text */}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormSelect;