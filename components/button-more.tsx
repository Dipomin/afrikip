export default function Button({ children, onClick }) {
  return (
    <button className=" bg-slate-800 text-white font-bold text-xl rounded-sm py-3 px-9 hover:bg-slate-500">
      {children}
    </button>
  );
}
