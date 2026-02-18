interface TimelineStepProps {
  icon: string;
  label: string;
  date: string;
  bgColor: string;
  textColor: string;
  isActive?: boolean;
}

function TimelineStep({ 
  icon, 
  label, 
  date, 
  bgColor, 
  textColor,
  isActive = false 
}: TimelineStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 ${bgColor} ${textColor} rounded-full flex items-center justify-center font-bold text-lg ${isActive ? "ring-2 ring-offset-2 ring-blue-400" : ""}`}>
        {icon}
      </div>
      <p className="mt-2 font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-600 text-center">{date}</p>
    </div>
  );
}

export default TimelineStep;
