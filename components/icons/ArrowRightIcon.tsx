import React from 'react';

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-full p-3">
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-gray-800 dark:text-gray-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    </div>
);

export default ArrowRightIcon;