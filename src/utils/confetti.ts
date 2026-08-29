// Safe DOM-based confetti utility for smooth, error-free celebrations in iframe environments

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
}

export default function confetti(options: ConfettiOptions = {}): void {
  if (typeof document === 'undefined') return;

  const count = options.particleCount || 45;
  const colors = options.colors || ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
  const originY = options.origin?.y !== undefined ? options.origin.y * window.innerHeight : window.innerHeight * 0.6;
  const originX = options.origin?.x !== undefined ? options.origin.x * window.innerWidth : window.innerWidth * 0.5;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '99999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const particles: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 8 + 6;
    const isCircle = Math.random() > 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.position = 'absolute';
    particle.style.width = `${size}px`;
    particle.style.height = isCircle ? `${size}px` : `${size * 1.5}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = isCircle ? '50%' : '2px';
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.opacity = '1';
    particle.style.transform = 'translate(-50%, -50%)';
    particle.style.transition = 'all 1.2s cubic-bezier(0.25, 1, 0.5, 1)';

    container.appendChild(particle);
    particles.push(particle);

    // Random velocity & angle
    const angle = (Math.random() * 360) * (Math.PI / 180);
    const distance = Math.random() * 250 + 60;
    const destX = originX + Math.cos(angle) * distance;
    const destY = originY + Math.sin(angle) * distance + (Math.random() * 100);
    const rotation = Math.random() * 720 - 360;

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      particle.style.left = `${destX}px`;
      particle.style.top = `${destY}px`;
      particle.style.opacity = '0';
      particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${Math.random() * 0.5 + 0.5})`;
    });
  }

  // Clean up DOM after animation completes
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 1400);
}
