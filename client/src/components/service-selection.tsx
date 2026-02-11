'use client';

import { useServices } from '@/hooks/use-services';
import { ServiceCard } from './service-card';
import { Spinner } from './spinner';

interface ServiceSelectionProps {
  selectedServiceIds: string[];
  onSelectionChange: (serviceIds: string[]) => void;
}

export function ServiceSelection({
  selectedServiceIds,
  onSelectionChange,
}: ServiceSelectionProps) {
  const { data: services, isLoading, error } = useServices();

  const handleToggle = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      onSelectionChange(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      onSelectionChange([...selectedServiceIds, serviceId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Failed to load services. Please try again.
        </p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">No services available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          isSelected={selectedServiceIds.includes(service.id)}
          onToggle={() => handleToggle(service.id)}
        />
      ))}
    </div>
  );
}
