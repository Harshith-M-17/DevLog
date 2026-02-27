import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

/**
 * AuthService — Single Responsibility: authentication logic only.
 * It delegates persistence to UsersService (Dependency Inversion).
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(dto.name, dto.email, dto.password);
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await this.usersService.validatePassword(
      dto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: any): AuthResponseDto {
    const payload: JwtPayload = { sub: user._id.toString(), email: user.email };
    const token = this.jwtService.sign(payload);
    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        team: user.team,
      },
    };
  }
}
