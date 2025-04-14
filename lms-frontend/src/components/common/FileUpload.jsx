import React, { useState, useRef } from 'react';
import {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
  SUPPORTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_VIDEO_SIZE
} from '../../config';

/**
 * FileUpload component for handling file uploads
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID
 * @param {string} props.name - Input name
 * @param {string} [props.label] - Input label
 * @param {string} [props.accept='image/*'] - Accepted file types
 * @param {Function} props.onFileSelect - Callback when file is selected
 * @param {string} [props.error] - Error message
 * @param {boolean} [props.required=false] - Whether input is required
 * @param {boolean} [props.disabled=false] - Whether input is disabled
 * @param {string} [props.fileType='image'] - Type of file (image, document, video)
 * @param {number} [props.maxSize] - Maximum file size in bytes
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.labelClassName] - Additional CSS classes for label
 * @param {string} [props.helpText] - Help text to display below input
 * @param {string} [props.previewUrl] - URL for previewing existing file
 * @returns {React.ReactElement} - FileUpload component
 */
const FileUpload = ({
  id,
  name,
  label,
  accept = 'image/*',
  onFileSelect,
  error,
  required = false,
  disabled = false,
  fileType = 'image',
  maxSize,
  className = '',
  labelClassName = '',
  helpText,
  previewUrl,
  ...rest
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(previewUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);
  
  // Determine accepted file types and size limits based on fileType
  const getAcceptedTypes = () => {
    switch (fileType) {
      case 'image':
        return {
          types: SUPPORTED_IMAGE_TYPES,
          maxSize: maxSize || MAX_IMAGE_SIZE,
          accept: 'image/*'
        };
      case 'document':
        return {
          types: SUPPORTED_DOCUMENT_TYPES,
          maxSize: maxSize || MAX_DOCUMENT_SIZE,
          accept: '.pdf,.doc,.docx'
        };
      case 'video':
        return {
          types: SUPPORTED_VIDEO_TYPES,
          maxSize: maxSize || MAX_VIDEO_SIZE,
          accept: 'video/*'
        };
      default:
        return {
          types: SUPPORTED_IMAGE_TYPES,
          maxSize: maxSize || MAX_IMAGE_SIZE,
          accept: 'image/*'
        };
    }
  };
  
  const { types, maxSize: fileMaxSize, accept: fileAccept } = getAcceptedTypes();
  
  // Validate file type and size
  const validateFile = (file) => {
    // Check file type
    if (!types.includes(file.type)) {
      return `Unsupported file type. Please upload ${fileType === 'image' ? 'an image' : fileType === 'document' ? 'a document' : 'a video'}.`;
    }
    
    // Check file size
    if (file.size > fileMaxSize) {
      const sizeMB = Math.round(fileMaxSize / (1024 * 1024));
      return `File is too large. Maximum size is ${sizeMB}MB.`;
    }
    
    return null;
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setFileError(validationError);
        return;
      }
      
      setFileError('');
      setFile(selectedFile);
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else if (fileType === 'document') {
        setPreview('/assets/images/document-icon.png');
      } else if (fileType === 'video') {
        setPreview('/assets/images/video-icon.png');
      }
      
      // Call onFileSelect callback
      onFileSelect(selectedFile);
    }
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      const validationError = validateFile(droppedFile);
      
      if (validationError) {
        setFileError(validationError);
        return;
      }
      
      setFileError('');
      setFile(droppedFile);
      
      // Create preview for images
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(droppedFile);
      } else if (fileType === 'document') {
        setPreview('/assets/images/document-icon.png');
      } else if (fileType === 'video') {
        setPreview('/assets/images/video-icon.png');
      }
      
      // Call onFileSelect callback
      onFileSelect(droppedFile);
    }
  };
  
  // Handle button click
  const onButtonClick = () => {
    inputRef.current.click();
  };
  
  // Generate unique ID if none provided
  const inputId = id || `file-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
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
      
      {/* File input */}
      <div 
        className={`
          border-2 border-dashed rounded-md p-4
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${error || fileError ? 'border-danger-500' : ''}
          ${disabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : onButtonClick}
      >
        <input 
          ref={inputRef}
          type="file"
          id={inputId}
          name={name}
          accept={accept || fileAccept}
          onChange={handleFileChange}
          disabled={disabled}
          required={required}
          className="sr-only"
          {...rest}
        />
        
        <div className="text-center">
          {preview ? (
            <div className="mb-3">
              {fileType === 'image' ? (
                <img 
                  src={preview} 
                  alt="File preview" 
                  className="mx-auto h-32 w-auto object-contain"
                />
              ) : (
                <img 
                  src={preview} 
                  alt="File icon" 
                  className="mx-auto h-16 w-auto object-contain"
                />
              )}
            </div>
          ) : (
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          )}
          
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              {file ? file.name : `Drag and drop your ${fileType}, or click to select`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileType === 'image' 
                ? 'PNG, JPG, GIF up to 2MB' 
                : fileType === 'document'
                  ? 'PDF, DOC, DOCX up to 20MB'
                  : 'MP4, WEBM, OGG up to 100MB'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {(error || fileError) && (
        <p className="mt-1 text-sm text-danger-600">
          {error || fileError}
        </p>
      )}
      
      {/* Help text */}
      {helpText && !error && !fileError && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FileUpload;