import { type PropsWithChildren, useEffect, useRef, useState } from 'react';

export default function DynamicHeight({ children }: PropsWithChildren) {
  const [occludedHeight, setOccludedHeight] = useState(0);

  useEffect(() => {
    window.addEventListener('resize', debouncedGetOccludedHeight);
    window.addEventListener('scroll', debouncedGetOccludedHeight);
    getOccludedHeight();

    return () => {
      window.removeEventListener('resize', debouncedGetOccludedHeight);
      window.removeEventListener('scroll', debouncedGetOccludedHeight);
    };
  }, []);

  // measure area covered up by fixed elements
  const getOccludedHeight = () => {
    const elements = document.body.getElementsByTagName('*');
    let occludedHeight = 0;
    for (const element of elements) {
      const style = window.getComputedStyle(element);
      if (
        style.position === 'fixed' &&
        parseFloat(style.width) === window.innerWidth
      ) {
        occludedHeight += parseFloat(style.height);
      }
    }
    setOccludedHeight(occludedHeight);
  };

  const timeoutId = useRef<ReturnType<typeof setTimeout>>();

  const debouncedGetOccludedHeight = () => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(getOccludedHeight, 250);
  };

  return (
    <div style={{ minHeight: `calc(100dvh - ${occludedHeight}px)` }}>
      {children}
    </div>
  );
}
