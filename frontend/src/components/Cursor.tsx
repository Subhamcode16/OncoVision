'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;

    if (!cursor || !follower) return;

    // Set initial positions
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(follower, { xPercent: -50, yPercent: -50 });

    // Use quickSetter for sub-millisecond response
    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");
    const xFollowSet = gsap.quickSetter(follower, "x", "px");
    const yFollowSet = gsap.quickSetter(follower, "y", "px");

    const moveCursor = (e: MouseEvent) => {
      xSet(e.clientX);
      ySet(e.clientY);
      
      // Follower has more inertia for the "dynamic" feel
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out"
      });
    };

    const handleHover = () => {
      gsap.to(follower, {
        scale: 2.5,
        borderWidth: "1px",
        backgroundColor: "rgba(37, 99, 235, 0.05)",
        duration: 0.3
      });
    };

    const handleUnhover = () => {
      gsap.to(follower, {
        scale: 1,
        borderWidth: "2px",
        backgroundColor: "transparent",
        duration: 0.3
      });
    };

    window.addEventListener('mousemove', moveCursor);

    // Attach to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, [role="button"], .interactive');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHover);
      el.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHover);
        el.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999] hidden md:block">
      {/* Primary Dot (Precision) */}
      <div 
        ref={cursorRef}
        className="fixed w-1.5 h-1.5 bg-blue-600 rounded-full"
      />
      {/* Follower Ring (Medical Aesthetics) */}
      <div 
        ref={followerRef}
        className="fixed w-8 h-8 border-2 border-blue-600/30 rounded-full"
      />
    </div>
  );
};

export default Cursor;
