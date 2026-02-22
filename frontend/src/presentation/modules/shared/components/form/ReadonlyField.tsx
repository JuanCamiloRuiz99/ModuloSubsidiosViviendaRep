/**
 * Componente reutilizable para campos deshabilitados (solo lectura)
 */
interface ReadonlyFieldProps {
  label: string;
  value: string;
  helperText?: string;
}

function ReadonlyField({ label, value, helperText }: ReadonlyFieldProps) {
  return (
    <div>
      <label className="block text-gray-800 font-semibold mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
      />
      {helperText && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
}

export default ReadonlyField;
