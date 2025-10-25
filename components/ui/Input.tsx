import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {props.required && <span className="text-[#FA2FB5]">*</span>}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg 
          bg-white/10 backdrop-blur-md border-2 border-[#FA2FB5]/30
          text-white placeholder-gray-400
          focus:outline-none focus:border-[#FA2FB5] focus:ring-2 focus:ring-[#FA2FB5]/20
          transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({ label, error, helperText, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {props.required && <span className="text-[#FA2FB5]">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 rounded-lg 
          bg-white/10 backdrop-blur-md border-2 border-[#FA2FB5]/30
          text-white placeholder-gray-400
          focus:outline-none focus:border-[#FA2FB5] focus:ring-2 focus:ring-[#FA2FB5]/20
          transition-all duration-200
          resize-vertical min-h-[100px]
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, helperText, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label} {props.required && <span className="text-[#FA2FB5]">*</span>}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 rounded-lg 
          bg-white/10 backdrop-blur-md border-2 border-[#FA2FB5]/30
          text-white
          focus:outline-none focus:border-[#FA2FB5] focus:ring-2 focus:ring-[#FA2FB5]/20
          transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#100720] text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
