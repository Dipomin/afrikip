export default function Button({ children }) {
  return (
    <button className="bg-red-600 text-white rounded-lg font-medium text-md py-1 px-2 lg:py-3 lg:px-4 hover:bg-red-700">
      {children}
    </button>
  );
}
