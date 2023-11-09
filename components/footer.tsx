import Link from "next/link";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="mt-auto w-full">
      <p className="mb-28 text-black/60 dark:text-white/60">
        Made with ❤️ at{" "}
        <Link
          className="underline hover:text-black dark:hover:text-white"
          href="https://app.disco.xyz"
        >
          Disco
        </Link>
      </p>
    </div>
  );
};
