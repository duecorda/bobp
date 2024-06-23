/* Enums */
import { UserStatus } from 'src/common/enums/user-status.enum';

export class UpdateUserDto {
  name?: string;
  status?: UserStatus; 
}