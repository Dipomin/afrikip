export default function AlertTitle({ title, slug }) {
  return (
    <div className="flex items-center justify-center p-5 pb-6 pt-4 w-full">
      <div
        className="text-xs font-medium text-white border-r-2 border-red-800 ml-2 px-4 "
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </div>
  );
}
