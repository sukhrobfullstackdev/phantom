import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import CanvasConfetti from 'canvas-confetti';

type Props = ComponentProps<'canvas'>;

export const Confetti = ({ style, ...rest }: Props) => {
  const [portalReady, setPortalReady] = useState(Boolean(document.getElementById('magic-modal')));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<CanvasConfetti>();

  useEffect(() => setPortalReady(true), []);

  // Setup Confetti
  useEffect(() => {
    confettiRef.current = CanvasConfetti.create(canvasRef.current, {
      resize: true,
    });
  }, []);

  // Trigger Confetti
  useEffect(() => {
    const timer = setTimeout(() => {
      confettiRef.current({
        colors: ['#A799FF', '#90F0D3', '#FFD594', '#A2E1F4'],
        particleCount: 1000,
        spread: 240,
        ticks: 80,
        shapes: ['circle'],
        startVelocity: -40,
        origin: {
          y: -1,
        },
      });
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  if (!portalReady) {
    return <></>;
  }

  return (
    <>
      {createPortal(
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            zIndex: 13,
            pointerEvents: 'none',
            ...style,
          }}
          {...rest}
        />,
        document.getElementById('magic-modal') || document.body,
      )}
    </>
  );
};
