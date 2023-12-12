import { FC, HTMLProps } from "react";

export const Card: FC<HTMLProps<HTMLDivElement>> = ({ className, ...rest }) => (
  <div
    className={`rounded-2xl bg-white p-4 dark:border dark:border-white/10 dark:bg-zinc-900 ${className}`}
    {...rest}
  />
);
