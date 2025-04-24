import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ token: string; user: any }> {
    const { email, username, password } = registerDto;
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new UnauthorizedException('Email is already registered');
    }

    const existingUserByUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUserByUsername) {
      throw new UnauthorizedException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    const payload = {
      email: user.email,
      username: user.username,
      sub: user.id,
    };
    const token = this.jwtService.sign(payload);

    // Return user data without password
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      token,
      user: userResponse,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      username: user.username,
      sub: user.id,
    };
    const token = this.jwtService.sign(payload);

    // Return user data without password
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      token,
      user: userResponse,
    };
  }
}
