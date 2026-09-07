import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Product } from '../domain/product.entity';
import { ProductRepositoryPort } from '../domain/product-repository.port';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async decrementStock(id: string, quantity: number): Promise<Product | null> {
    // updateMany con guardia de stock evita la condición de carrera de leer-y-luego-escribir.
    const updated = await this.prisma.product.updateMany({
      where: { id, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
    return updated.count === 1 ? this.findById(id) : null;
  }
}
