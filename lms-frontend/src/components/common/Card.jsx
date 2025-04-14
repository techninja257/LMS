import React from 'react';

/**
 * Card component for content containers
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hoverable=false] - Whether card should have hover effects
 * @param {React.ReactNode} [props.header] - Card header content
 * @param {React.ReactNode} [props.footer] - Card footer content
 * @returns {React.ReactElement} - Card component
 */
const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  header,
  footer
}) => {
  // Base classes
  const baseClasses = 'bg-white rounded-lg shadow';
  
  // Hover classes
  const hoverClasses = hoverable 
    ? 'transition-transform duration-300 transform hover:-translate-y-1 hover:shadow-lg' 
    : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200">
          {header}
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
};

/**
 * Card.Title component for card titles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - Card.Title component
 */
Card.Title = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-800 mb-2 ${className}`}>
    {children}
  </h3>
);

/**
 * Card.Description component for card descriptions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Description content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - Card.Description component
 */
Card.Description = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

/**
 * Card.Image component for card images
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} - Card.Image component
 */
Card.Image = ({ src, alt, className = '' }) => (
  <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-lg">
    <img 
      src={src} 
      alt={alt} 
      className={`w-full h-48 object-cover ${className}`} 
    />
  </div>
);

export default Card;