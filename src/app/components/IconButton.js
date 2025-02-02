import React, { useRef } from 'react';

const IconButton = ({
  icon,
  isActive,
  isDisabled,
  onClick,
  isColorIndicator,
  color = '#222222',
  onColorChange,
  tooltip
}) => {
  const colorInputRef = useRef(null);
  const baseStyles = "inline-flex justify-center items-center p-3 rounded-lg transition-colors relative";
  const stateStyles = isDisabled
    ? "opacity-50 cursor-not-allowed bg-gray-50"
    : isActive
      ? "bg-[#2F2F2F] text-white"
      : "hover:bg-gray-100";

  const handleColorClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleColorChange = (e) => {
    onColorChange(e.target.value);
  };

  if (isColorIndicator) {
    return (
      <div className="relative">
        <input
          type="color"
          ref={colorInputRef}
          value={color}
          onChange={handleColorChange}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            opacity: 0, 
            width: '100%', 
            height: '100%', 
            cursor: 'pointer',
            zIndex: 0
          }}
        />
        <button
          className={`${baseStyles} ${stateStyles}`}
          disabled={isDisabled}
          title={tooltip}
          style={{ pointerEvents: 'none' }}  // Disable button clicks
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <g filter="url(#filter0_d_35_982)">
              <circle cx="12" cy="12" r="8" fill="white" />
            </g>
            <circle cx="12" cy="12" r="6" fill={color} />
            <defs>
              <filter id="filter0_d_35_982" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_35_982" />
                <feOffset />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_35_982" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_35_982" result="shape" />
              </filter>
            </defs>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button
      className={`${baseStyles} ${stateStyles}`}
      onClick={onClick}
      disabled={isDisabled}
      title={tooltip}
    >
      {icon}
    </button>
  );
};

export default IconButton;