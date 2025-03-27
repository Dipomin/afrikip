export default function Container({ children }) {
  return (
    <div className="container px-5 bg-white lg:w-[1100px] lg:pt-5 lg:mt-16 mt-8">
      {children}
    </div>
  );
}
