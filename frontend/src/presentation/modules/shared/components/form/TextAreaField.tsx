/**
 * Componente reutilizable para campos de texto largo (textarea)
 */
import type { FieldError } from "react-hook-form";

interface TextAreaFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  register: any;
  name: string;
  error?: FieldError;
  helperText?: string;
  rows?: number;
}

function TextAreaField({
  label,
  placeholder,
  required = false,
  register,
  name,
  error,
  helperText,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-gray-800 font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        {...register(name)}
        rows={rows}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      {helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
}

export default TextAreaField;
