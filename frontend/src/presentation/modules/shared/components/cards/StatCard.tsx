interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  borderColor: string;
  textColor: string;
}

function StatCard({ title, value, description, borderColor, textColor }: StatCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${borderColor}`}>
      <h3 className="text-gray-600 text-sm font-semibold">{title}</h3>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
      <p className="text-gray-500 text-xs mt-2">{description}</p>
    </div>
  );
}

export default StatCard;
