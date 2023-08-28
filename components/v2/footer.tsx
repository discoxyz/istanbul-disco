import Link from "next/link";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="mt-auto w-full px-6 py-8">
      <p className="text-white/60">
        Made with ❤️ at{" "}
        <Link
          className="underline hover:text-white/100"
          href="https://app.disco.xyz"
        >
          Disco
        </Link>
      </p>
    </div>
  );
};
