import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
}

export default PageHeader;
