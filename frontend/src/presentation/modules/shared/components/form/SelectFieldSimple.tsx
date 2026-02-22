/**
 * Componente SelectField - HTML nativo simplificado
 * Usando select HTML estándar en lugar de Radix UI para evitar problemas
 */
import { Controller } from "react-hook-form";
import type { FieldError, Control } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldSimpleProps {
  label: string;
  required?: boolean;
  name: string;
  control: Control<any>;
  options: string[] | SelectOption[];
  error?: FieldError;
  placeholder?: string;
  disabled?: boolean;
  helperText?: string;
}

function SelectFieldSimple({
  label,
  required = false,
  name,
  control,
  options,
  error,
  placeholder = "Seleccionar opción",
  disabled = false,
  helperText,
}: SelectFieldSimpleProps) {
  // Normalizar options
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className="mb-6">
      <label htmlFor={name} className="block text-gray-800 font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => (
          <>
            <select
              id={name}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white transition cursor-pointer ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""}`}
            >
              <option value="">{placeholder}</option>
              {normalizedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}
            {helperText && !error && (
              <p className="text-gray-500 text-xs mt-1">{helperText}</p>
            )}
          </>
        )}
      />
    </div>
  );
}

export default SelectFieldSimple;
