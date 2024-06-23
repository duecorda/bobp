import { Column, ColumnOptions } from 'typeorm';

export function FixedDecimal(options: ColumnOptions = {}) {

  const override = Object.assign({ default: 0, nullable: false }, options);
  if (override.nullable) {
    delete override.default;
  }

  return Column({
    type: 'decimal',
    precision: 25,
    scale: 9,
    ...override, 
  });
}