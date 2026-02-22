import type { FieldError, Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import * as Select from "@radix-ui/react-select";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  control: Control<any>;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: FieldError;
  disabled?: boolean;
  helperText?: string;
}

export default function SelectField({
  label,
  name,
  control,
  options,
  placeholder = "Selecciona una opción",
  required = false,
  error,
  disabled = false,
  helperText,
}: SelectFieldProps) {
  const triggerBaseStyles =
    "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition flex items-center justify-between bg-white";
  const triggerErrorStyles = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
  const triggerDisabledStyles = disabled
    ? "disabled:bg-gray-100 disabled:cursor-not-allowed"
    : "";

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-sm font-semibold text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select.Root value={field.value || ""} onValueChange={field.onChange}>
            <Select.Trigger
              id={name}
              disabled={disabled}
              aria-label={label}
              aria-invalid={!!error}
              className={`${triggerBaseStyles} ${triggerErrorStyles} ${triggerDisabledStyles}`}
            >
              <Select.Value placeholder={placeholder} />
              <Select.Icon className="text-gray-600">▼</Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content 
                className="bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                position="popper"
                side="bottom"
                sideOffset={4}
              >
                <Select.Viewport className="p-1 max-h-[300px] overflow-y-auto">
                  {options.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 focus:bg-blue-50 outline-none rounded transition-colors data-[highlighted]:bg-blue-50"
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}
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
