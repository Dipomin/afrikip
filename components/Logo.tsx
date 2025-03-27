import Image from "next/image";

const Logo = ({ className = "", ...props }) => (
  <div className="w-64">
    <Image
      src="/images/afrikipresse.png"
      width="640"
      height="124"
      alt="Afrikipresse"
      className="w-64 h-auto"
    />
  </div>
);

export default Logo;
