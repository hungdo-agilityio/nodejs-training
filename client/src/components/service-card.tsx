import { Service } from '@/types/service';
import { cn } from '@/utils';

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
        'relative w-full cursor-pointer rounded-lg border-2 bg-white p-4 text-left transition-all hover:border-sky-300',
        isSelected ? 'border-sky-500' : 'border-gray-200'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">{service.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">${service.price.toFixed(2)}</span>
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {service.durationMinutes} Mins
            </span>
          </div>
        </div>
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded border-2 transition-colors',
            isSelected
              ? 'border-sky-500 bg-sky-500'
              : 'border-gray-300 bg-white'
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
    </button>
  );
}
