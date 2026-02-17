import * as React from "react";

interface UnifiedFormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  description?: string;
  error?: string;
}

export function UnifiedFormField({ label, required, children, description, error }: UnifiedFormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
      {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
    </div>
  );
}