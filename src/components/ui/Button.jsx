export const Button = ({ children, variant = 'default', onClick, className = '' }) => {
  const variants = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700',
    outline: 'border border-gray-300 text-gray-900 hover:bg-gray-50',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};