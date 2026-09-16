const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-indigo-600 text-white',
    secondary: 'bg-gray-200 text-gray-700',
  };

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;