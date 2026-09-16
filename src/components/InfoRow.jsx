const InfoRow = ({ label, value }) => {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-900 text-sm font-medium">{value}</span>
    </div>
  );
};

export default InfoRow;