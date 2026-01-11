import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAllProducts() {
    return this.productsService.findAll();
  }

  @Get('/:id')
  async findProduct(@Param('id') id: string) {
    const Product = await this.productsService.findOne(parseInt(id));
    if(!Product){
      throw new NotFoundException('Product not found');
    }
    return Product;
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(parseInt(id), updateProductDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(parseInt(id));
  }
}
