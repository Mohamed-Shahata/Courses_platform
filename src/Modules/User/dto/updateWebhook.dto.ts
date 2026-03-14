import { IsString } from 'class-validator';

export class updateWebhookDTO {
  @IsString()
  webhook_url: string;
}
