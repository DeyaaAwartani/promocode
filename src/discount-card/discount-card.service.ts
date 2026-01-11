import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountCardDto } from './dto/create-discount-card.dto';
import { UpdateDiscountCardDto } from './dto/update-discount-card.dto';
import { DiscountCard } from './entities/discount-card.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';

@Injectable()
export class DiscountCardService {
  constructor(@InjectRepository(DiscountCard) private repo: Repository<DiscountCard>) {}

  create(createDiscountCardDto: CreateDiscountCardDto) {
    const discountCard = this.repo.create(createDiscountCardDto)
    const code = nanoid(16);
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + createDiscountCardDto.expirationDurationMinutes);
    discountCard.expirationDate = expirationDate;
    discountCard.code = code;
    return this.repo.save(discountCard)
  } 

  findAll() {
    return this.repo.find();
  }

  findOneByCode(code: string) {
    return this.repo.findOneBy({code})
  }

  findOne(id: number) {
    if(!id){
      return null;
    }
    return this.repo.findOneBy({id})
  }

  async update(id: number, dto: UpdateDiscountCardDto) {
  const discountCard = await this.findOne(id);
  if(!discountCard) throw new NotFoundException('Discount card not found');

  if (dto.code !== undefined) discountCard.code = dto.code;
  if (dto.discountType !== undefined) discountCard.discountType = dto.discountType;
  if (dto.discountValue !== undefined) discountCard.discountValue = dto.discountValue;
  if (dto.isUsed !== undefined) discountCard.isUsed = dto.isUsed;

  if (dto.expirationDurationMinutes !== undefined) {
    discountCard.expirationDurationMinutes = dto.expirationDurationMinutes;

    const expirationDate = new Date(discountCard.createdAt);
    expirationDate.setMinutes(expirationDate.getMinutes() + dto.expirationDurationMinutes);
    discountCard.expirationDate = expirationDate;
  }
    return this.repo.save(discountCard);
  }

  async claimDiscountCard(discountCardId: number, now: Date = new Date()): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(DiscountCard)
      .set({ isUsed: true })
      .where('id = :id', { id: discountCardId })
      .andWhere('isUsed = :notUsed', { notUsed: false })
      .andWhere('expirationDate > :now', { now })
      .execute();

    return (result.affected ?? 0) === 1;
  }

  async remove(id: number) {
    const discountCard = await this.findOne(id);
    if(!discountCard){
      throw new NotFoundException('Discount card not found');
    }
    await this.repo.remove(discountCard);
    return {message: "Remove successfully"}
  }
  
}
