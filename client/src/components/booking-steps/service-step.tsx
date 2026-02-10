'use client';

import { ServiceSelection } from '@/components/service-selection';
import { Button } from '@/ui/button';

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
  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Select Services</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose one or more services for your booking
        </p>
      </div>

      <ServiceSelection
        selectedServiceIds={selectedServiceIds}
        onSelectionChange={onSelectionChange}
      />

      {selectedServiceIds.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t pt-6">
          <div className="text-sm text-gray-600">
            {selectedServiceIds.length} service
            {selectedServiceIds.length > 1 ? 's' : ''} selected
          </div>
          <Button onClick={onContinue}>Continue to Date & Time</Button>
        </div>
      )}
    </>
  );
}
