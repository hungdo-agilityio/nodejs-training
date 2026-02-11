import { Service } from '@/types/service';
import { cn } from '@/utils';
import { formatDuration } from '@/utils/booking';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
}

export function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'group relative w-full cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-white p-4 text-left transition-all',
        isSelected
          ? 'border-sky-500 shadow-xl shadow-sky-500/20'
          : 'shadow-lg hover:shadow-xl hover:border-sky-200'
      )}
    >
      {/* Selected indicator bar */}
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-1 bg-sky-500" />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={cn(
            'text-base font-semibold transition-colors',
            isSelected ? 'text-sky-900' : 'text-gray-900 group-hover:text-gray-700'
          )}>
            {service.name}
          </h3>

          {service.description && (
            <p className="mt-1 text-xs text-gray-600 line-clamp-1">
              {service.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold',
              isSelected
                ? 'bg-sky-100 text-sky-700'
                : 'bg-gray-100 text-gray-700'
            )}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${service.price.toFixed(2)}
            </span>

            <span className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
              isSelected
                ? 'bg-sky-50 text-sky-600'
                : 'bg-gray-50 text-gray-600'
            )}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(service.durationMinutes)}
            </span>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-start pt-1">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all',
              isSelected
                ? 'border-sky-500 bg-sky-500 scale-110'
                : 'border-gray-500 bg-white group-hover:border-sky-400'
            )}
          >
            {isSelected && (
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
