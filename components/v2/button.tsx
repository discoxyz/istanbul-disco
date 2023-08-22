import NextLink, { LinkProps as NextLinkProps } from "next/link";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FC,
} from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & NextLinkProps;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({ className, ...rest }) => {
  return <button className={`text-xl px-6 py-3 rounded-lg bg-purple-900 ${className}`} {...rest} />;
};

export const Link: FC<LinkProps> = ({ className, ...rest }) => {
  return <NextLink className={className} {...rest} />;
};
