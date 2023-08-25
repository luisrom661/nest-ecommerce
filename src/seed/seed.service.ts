import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService : ProductsService
  ){}

  async runSeed() {
    await this.insertNewProducts();
    const productsSeed = initialData.products;
    const inserPromises = [];
    productsSeed.forEach( product => {
      inserPromises.push(this.productsService.create(product));
    });
    await Promise.all(inserPromises);
    return `seed executed`;
  }

  private async insertNewProducts(){
    this.productsService.deleteAllProducts();
    return true;
  }
  
}
