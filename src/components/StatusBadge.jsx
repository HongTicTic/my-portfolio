const StatusBadge = ({ isAvailable }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${
        isAvailable ? 'bg-green-600' : 'bg-gray-500'
      }`}
    >
      {isAvailable ? 'Open to work' : 'Busy learning'}
    </span>
  );
};

export default StatusBadge;