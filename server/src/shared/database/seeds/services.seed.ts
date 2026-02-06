import { DataSource } from 'typeorm';
import { Service } from '@modules/services';

interface ServiceSeedData {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

const servicesData: ServiceSeedData[] = [
  {
    name: 'Haircut',
    description: 'Classic haircut with styling',
    price: 25.0,
    durationMinutes: 30,
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring with premium dye',
    price: 80.0,
    durationMinutes: 120,
  },
  {
    name: 'Highlights',
    description: 'Partial or full highlights',
    price: 100.0,
    durationMinutes: 90,
  },
  {
    name: 'Blow Dry & Styling',
    description: 'Professional blow dry and styling',
    price: 35.0,
    durationMinutes: 45,
  },
  {
    name: 'Deep Conditioning Treatment',
    description: 'Intensive hair conditioning and repair',
    price: 40.0,
    durationMinutes: 30,
  },
  {
    name: 'Beard Trim',
    description: 'Beard shaping and trimming',
    price: 15.0,
    durationMinutes: 15,
  },
  {
    name: 'Shampoo & Cut',
    description: 'Shampoo, haircut, and basic styling',
    price: 35.0,
    durationMinutes: 45,
  },
  {
    name: 'Perm',
    description: 'Permanent wave styling',
    price: 120.0,
    durationMinutes: 150,
  },
  {
    name: 'Hair Treatment',
    description: 'Keratin or protein treatment',
    price: 150.0,
    durationMinutes: 120,
  },
  {
    name: 'Kids Haircut',
    description: 'Haircut for children under 12',
    price: 18.0,
    durationMinutes: 20,
  },
];

export const seedServices = async (dataSource: DataSource): Promise<void> => {
  const serviceRepository = dataSource.getRepository(Service);

  const existingCount = await serviceRepository.count();
  if (existingCount > 0) {
    return;
  }

  const services = servicesData.map((data) => {
    const service = new Service();
    service.name = data.name;
    service.description = data.description;
    service.price = data.price;
    service.durationMinutes = data.durationMinutes;
    service.isActive = true;
    return service;
  });

  await serviceRepository.save(services);
};
