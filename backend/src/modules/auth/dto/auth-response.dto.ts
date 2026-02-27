import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  team?: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Bearer token' })
  token: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
