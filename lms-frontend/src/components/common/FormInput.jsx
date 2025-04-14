import React from 'react';

/**
 * FormInput component for form fields
 * @param {Object} props - Component props
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.value] - Input value
 * @param {Function} [props.onChange] - Input change handler
 * @param {Function} [props.onBlur] - Input blur handler
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.className] - Additional CSS classes for input
 * @param {string} [props.labelClassName] - Additional CSS classes for label
 * @param {string} [props.helpText] - Help text to display below input
 * @returns {React.ReactElement} - FormInput component
 */
const FormInput = ({
  type = 'text',
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
  className = '',
  labelClassName = '',
  helpText,
  ...rest
}) => {
  // Generate unique ID if none provided
  const inputId = id || `input-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input element */}
      <input
        type={type}
        id={inputId}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
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

export default FormInput;