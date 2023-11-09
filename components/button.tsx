import { FC, HTMLProps } from "react";
import { Spinner } from "./spinner";

type Variant = "primary" | "secondary" | "tab";
type Size = "small" | "default";
export const Button2: FC<
  Omit<HTMLProps<HTMLButtonElement>, "size"> & {
    variant?: Variant;
    active?: boolean;
    size?: Size;
    loading?: boolean;
  }
> = ({
  className,
  variant = "primary",
  size = "default",
  active,
  loading,
  disabled,
  type: _, // eslint-disable-line no-unused-vars
  children,
  ...rest
}) => {
  // let classes =
  //   "rounded-2xl py-3 text-xl font-medium flex items-center justify-center relative ";
  // if (variant == "primary")
  //   classes +=
  //     "px-6 bg-black text-white dark:bg-white text-white dark:text-black ";
  // if (variant == "tab") classes += "px-3 mr-2 last-of-type:mr-0 inline-block ";
  // if (variant == "tab")
  //   classes += active
  //     ? "px-3 bg-black/10 text-black dark:bg-white/10 dark:text-white "
  //     : "px-3 text-black/80 hover:bg-black/10 dark:text-white dark:hover:bg-white/10 ";
  // classes += " " + className;

  const base =
    "rounded-2xl font-medium flex items-center justify-center relative";

  const classes2: { [key in Variant]?: any } = { // eslint-disable-line no-unused-vars
    secondary:
      "bg-transparent text-black border border-black dark:bg-transparent dark:text-white dark:border-white",
    primary:
      "bg-black text-white dark:bg-white text-white dark:text-black aria-disabled:bg-black/40 aria-disabled:dark:bg-white/40",
    tab: "px-3 aria-current:bg-black/10 aria-current:text-black aria-current:dark:bg-white/10 aria-current:dark:text-white text-black/80 hover:bg-black/10 dark:text-white/80 dark:hover:bg-white/10",
  };

  const sizeClasses: { [key in Size]?: any } = { // eslint-disable-line no-unused-vars
    small: "px-3 py-2 text-lg",
    default: "px-6 py-3 text-xl",
  };

  const classes = [base, classes2[variant], sizeClasses[size], className].join(
    " ",
  );

  return (
    <button
      type="button"
      aria-current={active}
      aria-disabled={disabled}
      disabled={disabled}
      className={classes}
      {...rest}
    >
      {children}
      {loading && (
        <Spinner
          className="absolute right-3 top-2/4 -mt-3 ml-3 inline-block"
          sizeClassName="w-6 h-6"
          fillClassName="fill-black"
        />
      )}
    </button>
  );
};
