import { FC, InputHTMLAttributes } from "react";

export const Toggle: FC<
  InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    helperText?: string;
  }
> = ({ label, helperText, className, ...rest }) => {
  return (
    <label
      className={`relative inline-flex cursor-pointer items-center ${className}`}
    >
      <div className="relative">
        <input type="checkbox" className="peer sr-only" {...rest} />
        <div className="peer h-6 w-11 rounded-full  border-gray-600 bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800"></div>
      </div>
      <div className="ml-4">
        <span className="block ">{label}</span>
        <span className="bloxk text-m text-slate-400">{helperText}</span>
      </div>
    </label>
  );
};
