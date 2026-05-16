import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuoteSubmissionDto } from './create-quote-submission.dto';

export class CreateQuoteSubmissionFormDataDto extends CreateQuoteSubmissionDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional image uploaded for the quote.',
  })
  image?: unknown;
}
