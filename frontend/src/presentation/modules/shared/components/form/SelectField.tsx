/**
 * Componente reutilizable para campos select con Radix UI
 * Simplificado para evitar problemas con Portal
 */
import { Controller } from "react-hook-form";
import type { FieldError } from "react-hook-form";
import * as Select from "@radix-ui/react-select";
import ChevronIcon from "../icons/ChevronIcon";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  required?: boolean;
  name: string;
  control: any;
  options: string[] | SelectOption[];
  error?: FieldError;
  placeholder?: string;
}

function SelectField({
  label,
  required = false,
  name,
  control,
  options,
  error,
  placeholder = "Seleccionar opción",
}: SelectFieldProps) {
  // Normalizar options a formato {value, label}
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className="mb-6">
      <label className="block text-gray-800 font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { value, onChange } }) => {
          const safeValue = value && value !== "" ? String(value) : "";
          const selectedOption = normalizedOptions.find(
            (opt) => opt.value === safeValue
          );

          return (
            <Select.Root value={safeValue} onValueChange={onChange}>
              <Select.Trigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-white flex items-center justify-between">
                <Select.Value placeholder={placeholder}>
                  {selectedOption?.label || placeholder}
                </Select.Value>
                <Select.Icon className="opacity-50">
                  <ChevronIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content className="bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <Select.Viewport className="p-1">
                    {normalizedOptions.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className="px-4 py-2 hover:bg-blue-100 cursor-pointer rounded text-gray-800 outline-none focus:bg-blue-50"
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
              </Select.Content>
            </Select.Root>
          );
        }}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

export default SelectField;
