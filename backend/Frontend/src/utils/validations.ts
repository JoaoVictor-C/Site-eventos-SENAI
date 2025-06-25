import { z } from 'zod';

// Common validation schemas
export const dateSchema = z.string().refine((date) => !isNaN(Date.parse(date)), {
  message: 'Data inválida',
});

export const emailSchema = z.string().email({
  message: 'Email inválido',
});

export const priceSchema = z.number().min(0, {
  message: 'O preço deve ser maior ou igual a zero',
});

export const quantitySchema = z.number().int().min(0, {
  message: 'A quantidade deve ser maior ou igual a zero',
});

export const nameSchema = z.string().min(3, {
  message: 'O nome deve ter no mínimo 3 caracteres',
});

// Event validation schemas
export const eventFormSchema = z.object({
  name: nameSchema,
  short_description: z.string().min(10, {
    message: 'A descrição curta deve ter no mínimo 10 caracteres',
  }),
  long_description: z.string().min(30, {
    message: 'A descrição longa deve ter no mínimo 30 caracteres',
  }),
  event_date: dateSchema,
  location: z.string().min(5, {
    message: 'A localização deve ter no mínimo 5 caracteres',
  }),
  image_url: z.string().url({
    message: 'URL de imagem inválida',
  }),
  is_active: z.boolean(),
});

// Batch validation schema
export const batchFormSchema = z.object({
  name: nameSchema,
  unit_price: priceSchema,
  total_quantity: quantitySchema,
  stock: quantitySchema,
  start_date: dateSchema,
  end_date: dateSchema,
  type: z.enum(['quantity', 'time']),
  is_active: z.boolean(),
});
