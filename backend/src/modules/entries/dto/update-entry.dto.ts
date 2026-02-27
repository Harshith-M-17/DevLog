import { PartialType } from '@nestjs/swagger';
import { CreateEntryDto } from './create-entry.dto';

/**
 * UpdateEntryDto inherits all fields from CreateEntryDto as optional.
 * Open/Closed: extend CreateEntryDto without modifying it.
 */
export class UpdateEntryDto extends PartialType(CreateEntryDto) {}
