import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  create(name: string) {
    const user = this.repo.create({name})
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

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if(!user) throw new NotFoundException('User not found');

    if (dto.name !== undefined) user.name = dto.name;

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if(!user) throw new NotFoundException('User not found');


    await this.repo.remove(user);
    return {message: "Remove successfully"}
  }
}
