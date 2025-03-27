import Image from "next/image";
import Link from "next/link";

export default function Intro() {
  return (
    <section className="pb-3 md:flex-row items-center md:justify-between mt-8 md:mb-12 bg-white">
      <div className="flex justify-center space-x-16 items-center leading-tight md:pr-8">
        <div className="hidden lg:flex space-x-2">
          <div>Français </div> | <div>English</div>
        </div>
        <div className="">
          <Link href="/">
            <Image
              src="/images/afriki.png"
              width="300"
              height="100"
              alt="Afrikipresse"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
