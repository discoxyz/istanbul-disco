import Link from "next/link";
import { FC } from "react";

export const Footer: FC = () => {
  return (
    <div className="w-full py-8 px-6 mt-auto">
      <p className="text-white/60">
        Made with ❤️ at <Link className='hover:text-white/100 underline' href="https://app.disco.xyz">Disco</Link>
      </p>
    </div>
  );
};
