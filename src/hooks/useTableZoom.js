"use client";

import { useState, useEffect } from 'react';

const useTableZoom = (storageKey) => {
  const [zoom, setZoom] = useState(() => {
    try {
      if (typeof window === 'undefined') return 1;
      const saved = localStorage.getItem(storageKey);
      return saved ? parseFloat(saved) : 1;
    } catch (e) {
      return 1;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem(storageKey, String(zoom));
    } catch (e) {}
  }, [zoom, storageKey]);

  const handleZoomChange = (event, value) => {
    setZoom(typeof value === 'number' ? value : parseFloat(value));
  };

  const zoomStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    width: `${100 / zoom}%`,
  };

  return { zoom, handleZoomChange, zoomStyle };
};

export default useTableZoom;
