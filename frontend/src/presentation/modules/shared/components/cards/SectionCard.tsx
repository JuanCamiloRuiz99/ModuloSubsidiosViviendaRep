import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function SectionCard({ title, children, className = "" }: SectionCardProps) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default SectionCard;
