import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  online?: boolean;
}

const sizes: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

const onlineSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
};

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name?: string) {
  const colors = [
    'bg-blue-500', 'bg-teal-500', 'bg-green-500', 'bg-amber-500',
    'bg-orange-500', 'bg-red-500', 'bg-sky-500', 'bg-cyan-500',
  ];
  if (!name) return colors[0];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
}

export function Avatar({ src, name, size = 'md', className = '', online }: AvatarProps) {
  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'avatar'}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center ring-2 ring-white`}>
          <span className="font-semibold text-white leading-none">{getInitials(name)}</span>
        </div>
      )}
      {online && (
        <span className={`absolute bottom-0 right-0 ${onlineSizes[size]} bg-emerald-500 border-2 border-white rounded-full`} />
      )}
    </div>
  );
}
