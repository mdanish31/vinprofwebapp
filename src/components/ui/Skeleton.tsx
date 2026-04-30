import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

export function Skeleton({ className = '', rounded = true, circle = false }: SkeletonProps) {
  return (
    <div
      className={`
        bg-gray-200 animate-pulse-soft
        ${circle ? 'rounded-full' : rounded ? 'rounded-lg' : 'rounded'}
        ${className}
      `}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton circle className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <Skeleton className="h-20 w-full" rounded={false} />
      <div className="px-4 pb-4 -mt-5">
        <Skeleton circle className="w-16 h-16 border-2 border-white" />
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
