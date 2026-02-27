import { IsString, IsNotEmpty } from 'class-validator';

export class VideoJoinDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
