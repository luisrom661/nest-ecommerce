import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handledDBExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
    })
  }

  async findOne(term: string) {
    let product: Product;
    try {
      if (isUUID(term)) {
        product = await this.productRepository.findOneByOrFail({ id: term })
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder();
        product = await queryBuilder
          .where(`UPPER(title)=:title or slug=:slug`, {
            title: term.toUpperCase(),
            slug: term.toLowerCase()
          }).getOne();
      }
      return product;
    } catch (error) {
      throw new NotFoundException(`Product with id or slug "${term}" not found.`);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const productUpdate = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    if (!productUpdate) throw new NotFoundException(`Product with id "${id}" not found.`)
    try {
      await this.productRepository.save(productUpdate);
      return productUpdate;
    } catch (error) {
      this.handledDBExceptions(error);
    }
  }

  async remove(id: string) {
    const deletedProduct = await this.productRepository.delete(id);
    if (!deletedProduct.affected)
      throw new NotFoundException();
    return;
  }

  private handledDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs.');
  }
}
