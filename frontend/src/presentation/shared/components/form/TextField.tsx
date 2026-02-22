import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  helperText?: string;
}

export default function TextField({
  label,
  placeholder,
  required = false,
  type = "text",
  register,
  error,
  disabled = false,
  helperText,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...register}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
      {error && (
        <span className="text-sm text-red-600 flex items-center gap-1">
          ⚠️ {error.message}
        </span>
      )}
      {helperText && !error && (
        <span className="text-xs text-gray-500">{helperText}</span>
      )}
    </div>
  );
}
