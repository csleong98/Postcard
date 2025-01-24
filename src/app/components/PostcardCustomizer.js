'use client'

import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';

// Add this function to compress the image
const compressImage = (base64String) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (reduce by 50%)
      const newWidth = img.width * 0.5;
      const newHeight = img.height * 0.5;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Get compressed base64 (0.7 quality)
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

export default function PostcardCustomizer() {
  // Existing state
  const [currentSide, setCurrentSide] = useState('front');
  const [uploadedImage, setUploadedImage] = useState('/images/default-image.png');
  const [selectedTool, setSelectedTool] = useState(null);
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const staticCanvasRef = useRef(null);
  const isDrawing = useRef(false);
  const containerRef = useRef(null);
  const [isTextareaActive, setIsTextareaActive] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Caveat');
  const [textColor, setTextColor] = useState('#000000');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [showPreview, setShowPreview] = useState(false);
  const [previewLayout, setPreviewLayout] = useState('horizontal');
  const [previewBackground, setPreviewBackground] = useState('/images/preview-bg.png');

  // Add useEffect to handle preview generation when layout changes
  useEffect(() => {
    if (showPreview) {
      generatePreview();
    }
  }, [previewLayout]);

  const handleFlip = () => {
    setCurrentSide(currentSide === 'front' ? 'back' : 'front');
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const canvas = staticCanvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width - 120 - 16, 16, 120, 160);
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 16);
    ctx.lineTo(canvas.width / 2, canvas.height - 16);
    ctx.stroke();
  }, []);

  const startDrawing = (e) => {
    if (selectedTool) {
      isDrawing.current = true;
      const canvas = frontCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      ctx.beginPath();
      ctx.moveTo(point.clientX - rect.left, point.clientY - rect.top);

      // Prevent scrolling while drawing on touch devices
      if (e.touches) {
        e.preventDefault();
      }
    }
  };

  const draw = (e) => {
    if (!isDrawing.current || !selectedTool) return;
    const canvas = frontCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;

    if (selectedTool === 'eraser') {
      const size = 16;
      ctx.clearRect(
        point.clientX - rect.left - size / 2,
        point.clientY - rect.top - size / 2,
        size,
        size
      );
    } else {
      ctx.lineTo(point.clientX - rect.left, point.clientY - rect.top);
      ctx.strokeStyle = selectedTool === 'pencil' ? drawingColor : `${drawingColor}80`;
      ctx.lineWidth = selectedTool === 'pencil' ? 2 : 8;
      ctx.stroke();
    }

    // Prevent scrolling while drawing on touch devices
    if (e.touches) {
      e.preventDefault();
    }
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      const canvas = frontCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = frontCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Font options
  const fontOptions = [
    { name: 'Homemade Apple', value: 'Homemade Apple' },
    { name: 'Dancing Script', value: 'Dancing Script' },
    { name: 'Caveat', value: 'Caveat' },
    { name: 'Indie Flower', value: 'Indie Flower' },
    { name: 'Shadows Into Light', value: 'Shadows Into Light' },
  ];

  const generatePreview = () => {
    // Create a temporary canvas for the combined preview
    const previewCanvas = document.createElement('canvas');
    
    // Set fixed square canvas dimensions
    const canvasWidth = 1500;
    const canvasHeight = 1500;
    
    previewCanvas.width = canvasWidth;
    previewCanvas.height = canvasHeight;
    const ctx = previewCanvas.getContext('2d');

    // Load and draw background image
    const bgImg = new Image();
    bgImg.onload = () => {
      // Draw background with cover effect
      const bgAspect = bgImg.width / bgImg.height;
      const canvasAspect = canvasWidth / canvasHeight;
      let drawWidth, drawHeight, x, y;

      if (bgAspect > canvasAspect) {
        // Background is wider than canvas
        drawHeight = canvasHeight;
        drawWidth = drawHeight * bgAspect;
        x = (canvasWidth - drawWidth) / 2;
        y = 0;
      } else {
        // Background is taller than canvas
        drawWidth = canvasWidth;
        drawHeight = drawWidth / bgAspect;
        x = 0;
        y = (canvasHeight - drawHeight) / 2;
      }

      ctx.drawImage(bgImg, x, y, drawWidth, drawHeight);

      // Load and draw postcard content
      const img = new Image();
      img.onload = () => {
        // Calculate card dimensions and positions
        const cardWidth = 879;
        const cardHeight = 591;
        const scale = 1.2;  // Larger scale for better visibility
        const padding = 16 * scale; // Scale the padding with the card
        
        // Center horizontally and position vertically
        const frontX = (canvasWidth - cardWidth * scale) / 2;
        const frontY = canvasHeight * 0.05;  // Moved up to 15% from top
        const backX = frontX - 15;  // Slight offset for depth
        const backY = canvasHeight * 0.45;  // Adjusted to maintain spacing

        // Helper function to draw a rotated card with shadow
        const drawRotatedCard = (x, y, width, height, rotation, drawContent) => {
          ctx.save();
          
          // Move to center point for rotation
          ctx.translate(x + width / 2, y + height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-(x + width / 2), -(y + height / 2));

          // Add shadow (less prominent)
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 4;

          // Draw white background with shadow
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, y, width, height);

          // Remove shadow for content
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Draw the content
          drawContent(x, y, width, height);

          ctx.restore();
        };

        // Draw front card first (will be behind)
        drawRotatedCard(
          frontX, 
          frontY, 
          cardWidth * scale, 
          cardHeight * scale,
          2,  // Slight rotation in opposite direction
          (x, y, w, h) => {
            // Draw the image with padding
            const paddedX = x + padding;
            const paddedY = y + padding;
            const paddedWidth = w - (padding * 2);
            const paddedHeight = h - (padding * 2);
            ctx.drawImage(img, paddedX, paddedY, paddedWidth, paddedHeight);
            ctx.drawImage(frontCanvasRef.current, paddedX, paddedY, paddedWidth, paddedHeight);
          }
        );

        // Draw back card last (will be on top)
        drawRotatedCard(
          backX, 
          backY, 
          cardWidth * scale, 
          cardHeight * scale,
          -2,  // Slight rotation
          (x, y, w, h) => {
            ctx.drawImage(staticCanvasRef.current, x, y, w, h);
            
            // Draw text content
            const textarea = document.querySelector('textarea');
            if (textarea) {
              ctx.font = `${24 * scale}px ${selectedFont}`;
              ctx.fillStyle = textColor;
              
              const lines = textarea.value.split('\n');
              let textY = y + (36 * scale);
              const maxWidth = (w / 2) - (40 * scale);
              const textX = x + (36 * scale);

              lines.forEach(text => {
                const words = text.split(' ');
                let line = '';
                
                words.forEach(word => {
                  const testLine = line + word + ' ';
                  const metrics = ctx.measureText(testLine);
                  if (metrics.width > maxWidth) {
                    ctx.fillText(line, textX, textY);
                    line = word + ' ';
                    textY += 24 * scale;
                  } else {
                    line = testLine;
                  }
                });
                ctx.fillText(line, textX, textY);
                textY += 24 * scale;
              });
            }
          }
        );

        setShowPreview(previewCanvas.toDataURL());
      };
      img.src = uploadedImage;
    };
    bgImg.src = previewBackground;
  };

  // Add touch event handler to prevent scrolling
  useEffect(() => {
    const canvas = frontCanvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', (e) => e.preventDefault());
        canvas.removeEventListener('touchmove', (e) => e.preventDefault());
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 
        className="text-slate-900 text-2xl md:text-4xl mb-4 md:mb-8 text-center"
        style={{
          fontFamily: 'PP Editorial New',
          fontWeight: 'italic',
          fontStyle: 'italic',
        }}
      >
        Make your own postcard
      </h1>

      <div className="relative w-full max-w-[879.04px]">
        {/* Postcard Canvas */}
        <div className="relative w-full aspect-[879/591] perspective">
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
              currentSide === 'back' ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Side */}
            <div className="absolute w-full h-full backface-hidden bg-white shadow-md flex items-center justify-center touch-none">
              {/* Drawing canvas for front */}
              <canvas
                ref={frontCanvasRef}
                width={879}
                height={591}
                className="absolute inset-0 touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              ></canvas>

              <img
                src={uploadedImage}
                alt="Postcard Front"
                className="w-full h-full object-cover p-4 box-border pointer-events-none"
              />

              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Back Side */}
            <div className="absolute w-full h-full rotate-y-180 backface-hidden bg-white shadow-md flex items-center justify-center">
              {/* Static elements canvas */}
              <canvas
                ref={staticCanvasRef}
                width={879}
                height={591}
                className="absolute inset-0 pointer-events-none"
              ></canvas>

              {/* Add Message Textarea */}
              <div className="absolute inset-9 flex z-0">
                <textarea
                  className="w-[50%] h-full resize-none p-4 bg-transparent focus:outline-none"
                  placeholder="Type your message here..."
                  style={{
                    fontFamily: selectedFont,
                    color: textColor,
                    fontSize: "20px"
                  }}
                  onFocus={() => setIsTextareaActive(true)}
                  onBlur={(e) => {
                    setTimeout(() => {
                      const activeElement = document.activeElement;
                      const isControlsContainer = activeElement?.closest('.controls-container');
                      if (!isControlsContainer) {
                        setIsTextareaActive(false);
                      }
                    }, 0);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar - now positioned at bottom center */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[calc(100%+12px)] md:translate-y-[calc(100%+24px)] w-full md:w-auto">
          <Toolbar
            currentSide={currentSide}
            selectedTool={selectedTool}
            drawingColor={drawingColor}
            textColor={textColor}
            selectedFont={selectedFont}
            fontOptions={fontOptions}
            onToolSelect={setSelectedTool}
            onColorChange={setDrawingColor}
            onTextColorChange={setTextColor}
            onFontChange={setSelectedFont}
            onClear={clearCanvas}
            onUpload={() => document.getElementById('imageUpload').click()}
            onDownload={() => {
              if (showPreview) {
                const link = document.createElement('a');
                link.href = showPreview;
                link.download = 'my-postcard.png';
                link.click();
              } else {
                generatePreview();
              }
            }}
            onFlip={handleFlip}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full md:w-[80%] lg:w-[60%] h-[95%] flex flex-col rounded-lg">
            {/* Header */}
            <div className="p-4 flex-shrink-0 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>

            {/* Content - Full height preview */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 min-h-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={showPreview}
                  alt="Postcard Preview"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-4 flex-shrink-0 border-t bg-gray-50 rounded-b-lg">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
                <a
                  href={showPreview}
                  download="my-postcard.png"
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}