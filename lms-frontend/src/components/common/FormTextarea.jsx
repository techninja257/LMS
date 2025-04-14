import React from 'react';

/**
 * FormTextarea component for multiline text inputs
 * @param {Object} props - Component props
 * @param {string} props.id - Textarea ID
 * @param {string} props.name - Textarea name
 * @param {string} [props.label] - Textarea label
 * @param {string} [props.placeholder] - Textarea placeholder
 * @param {string} [props.value] - Textarea value
 * @param {Function} [props.onChange] - Textarea change handler
 * @param {Function} [props.onBlur] - Textarea blur handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether textarea is required
 * @param {boolean} [props.disabled=false] - Whether textarea is disabled
 * @param {number} [props.rows=4] - Number of visible rows
 * @param {string} [props.className] - Additional CSS classes for textarea
 * @param {string} [props.labelClassName] - Additional CSS classes for label
 * @param {string} [props.helpText] - Help text to display below textarea
 * @returns {React.ReactElement} - FormTextarea component
 */
const FormTextarea = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  labelClassName = '',
  helpText,
  ...rest
}) => {
  // Generate unique ID if none provided
  const textareaId = id || `textarea-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label 
          htmlFor={textareaId} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Textarea element */}
      <textarea
        id={textareaId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
          focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm
          ${error ? 'border-danger-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
          ${className}
        `}
        {...rest}
      />
      
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

export default FormTextarea;