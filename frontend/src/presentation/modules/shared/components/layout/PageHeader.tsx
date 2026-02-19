import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default PageHeader;
