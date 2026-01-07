import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  create(createProductDto: CreateProductDto) {
    const user = this.repo.create(createProductDto)
    return this.repo.save(user)
  } 

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    if(!id){
      return null;
    }
    return this.repo.findOneBy({id})
  }

  async update(id: number, attrs: Partial<Product>) {
    const product = await this.findOne(id);
    if(!product){
      throw new NotFoundException('Product not found');
    }
    Object.assign(product,attrs);
    return this.repo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    if(!product){
      throw new NotFoundException('Product not found');
    }
    await this.repo.remove(product);
    return {message: "Remove successfully"}
  }
}
