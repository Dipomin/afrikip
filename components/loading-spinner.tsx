import React from "react";

function LoadingSpinner() {
  return (
    <div role="status" className="flex items-center justify-center">
      <svg
        aria-hidden="true"
        className="w-6 h-6 text-gray-300 animate-spin dark:text-gray-600 fill-white"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
          fill="currentColor"
        />
        <circle cx="12" cy="2.5" r="1.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            dur="0.75s"
            values="0 12 12;360 12 12"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
      <span className="sr-only text-white">Chargement...</span>
    </div>
  );
}

export default LoadingSpinner;
