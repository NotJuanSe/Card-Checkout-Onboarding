import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Audífonos inalámbricos Aurora',
    description:
      'Audífonos over-ear con cancelación activa de ruido y 30 horas de batería.',
    priceCents: 45990000,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=60',
    stock: 12,
  },
  {
    name: 'Teclado mecánico Nimbus 65%',
    description:
      'Teclado compacto hot-swappable, switches lineales y retroiluminación RGB.',
    priceCents: 32990000,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=60',
    stock: 7,
  },
  {
    name: 'Cámara instantánea Lumen',
    description:
      'Cámara analógica de impresión instantánea con flash automático y lente gran angular.',
    priceCents: 28990000,
    imageUrl:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=60',
    stock: 4,
  },
];

async function main(): Promise<void> {
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: product });
    } else {
      await prisma.product.create({ data: product });
    }
  }
  console.log(`Seed listo: ${products.length} productos.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
