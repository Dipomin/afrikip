import Image from "next/image";

const Logo = ({ className = "", ...props }) => (
  <Image
    width={150}
    height={50}
    src="/images/afrikipresse.png"
    alt="Afrikipresse"
  />
);

export default Logo;
