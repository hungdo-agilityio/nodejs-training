'use client';

import { ServiceSelection } from '@/components/service-selection';
import { Button } from '@/ui/button';
import { useServices } from '@/hooks';
import { formatDuration } from '@/utils/booking';
import { useMemo } from 'react';

interface ServiceStepProps {
  selectedServiceIds: string[];
  onSelectionChange: (serviceIds: string[]) => void;
  onContinue: () => void;
}

export function ServiceStep({
  selectedServiceIds,
  onSelectionChange,
  onContinue,
}: ServiceStepProps) {
  const { data: services } = useServices();

  const { totalDuration, totalPrice } = useMemo(() => {
    if (!services || selectedServiceIds.length === 0) {
      return { totalDuration: 0, totalPrice: 0 };
    }

    const selectedServices = services.filter((service) =>
      selectedServiceIds.includes(service.id)
    );

    return {
      totalDuration: selectedServices.reduce(
        (sum, service) => sum + service.durationMinutes,
        0
      ),
      totalPrice: selectedServices.reduce(
        (sum, service) => sum + service.price,
        0
      ),
    };
  }, [services, selectedServiceIds]);

  return (
    <>
      <ServiceSelection
        selectedServiceIds={selectedServiceIds}
        onSelectionChange={onSelectionChange}
      />

      {selectedServiceIds.length > 0 && (
        <div className="mt-6 space-y-4 border-t border-gray-200 pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {selectedServiceIds.length} service
                {selectedServiceIds.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-700">
                Total Duration
              </span>
              <span className="text-base font-semibold text-gray-900">
                {formatDuration(totalDuration)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <span className="text-base font-medium text-gray-900">
                Total Price
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            onClick={onContinue}
            className="w-full bg-gray-900 hover:bg-gray-800"
            size="lg"
          >
            Continue to Date & Time
          </Button>
        </div>
      )}
    </>
  );
}
