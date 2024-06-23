import { IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class ListQueryParamsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return { start: 0, end: 9 };
    const [start, end] = value.slice(1, -1).split(',').map(Number);
    return { start, end };
  })
  range?: { start: number, end: number };

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return { field: 'id', order: 'DESC' };
    const [field, order] = JSON.parse(value);
    return { field, order };
  })
  sort?: { field: string, order: 'ASC' | 'DESC' };

  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value.trim() === '{}') {
      return {};
    }
    return JSON.parse(value);
  })
  filter?: Record<string, string>;
}