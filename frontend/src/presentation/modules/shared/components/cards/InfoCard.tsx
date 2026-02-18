import type { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function InfoCard({ title, children, className = "" }: InfoCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default InfoCard;
