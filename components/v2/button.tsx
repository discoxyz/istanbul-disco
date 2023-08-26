import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { AnchorHTMLAttributes, ButtonHTMLAttributes, FC } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & NextLinkProps;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps & { customColorClasses?: string }> = ({
  className,
  customColorClasses,
  ...rest
}) => {
  return (
    <button
      className={`${className} rounded-lg px-6 py-3 text-xl ${
        customColorClasses ? customColorClasses : "bg-purple-900 text-white"
      }`}
      {...rest}
    />
  );
};

export const Link: FC<LinkProps> = ({ className, ...rest }) => {
  return <NextLink className={className} {...rest} />;
};
