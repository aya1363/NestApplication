import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import {
  CartDocument, CartRepository,
  ProductRepository, type UserDocument
} from '../../DB';
import { RemoveItemsFromCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,

  ){}
async create(createCartDto: CreateCartDto, user: UserDocument)
: Promise<{ status: number; cart: CartDocument }> {
  
  const product = await this.productRepository.findOne({
    filter: { _id: createCartDto.product, stock: { $gte: createCartDto.quantity } }
  });

  if (!product) {
    throw new NotFoundException('fail to find product instance or product out of stock');
  }

  const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } });

  if (!cart) {
    const [newCart] = await this.cartRepository.create({
      data: {
        createdBy: user._id,
        products: [{ product: product._id, quantity: createCartDto.quantity ?? 1 }]
      }
    });

    if (!newCart) throw new BadRequestException('fail to create cart instance');
    return { status: 201, cart: newCart };
  }

  const existingProduct = cart.products.find(p => p.product == createCartDto.product);

  if (existingProduct) {
    existingProduct.quantity = createCartDto.quantity ?? 0;
  } else {
    cart.products.push({ product: product._id, quantity: createCartDto.quantity ?? 1 });
  }

  await cart.save();
  return { status: 200, cart };
  }
  
  async removeItems(
    removeItemsFromCartDto: RemoveItemsFromCartDto,
    user: UserDocument)
    : Promise<CartDocument> {
    const cart = await this.cartRepository.findOneAndUpdate({
      filter: { createdBy: user._id },
      update: {
        $pull: {
          products:{_id:{$in:removeItemsFromCartDto.productIds}}
        }
      }
    })
    console.log({ removeItemsFromCartDto });
    if (!cart) {
      throw new NotFoundException('fail to find matching user cart')
    }
    return cart ;
  }
  
    async removeCart(
    user: UserDocument)
    : Promise<string> {
    const cart = await this.cartRepository.deleteOne({
      filter: { createdBy: user._id },

    })
    if (!cart.deletedCount) {
      throw new NotFoundException('fail to find matching user cart')
    }
    return 'Done' ;
}


    async findOne(
    user: UserDocument)
    : Promise<CartDocument> {
    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
      options: {
        populate: [{ path: 'products.product' }]
}
    
    })
    if (!cart) {
      throw new NotFoundException('fail to find matching user cart')
    }
  return cart ;
  }





}
