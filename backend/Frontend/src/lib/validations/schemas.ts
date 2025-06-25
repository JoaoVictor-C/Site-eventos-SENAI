import { z } from 'zod';

// Reusable schema parts
const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
  .regex(/[!@#$%^&*]/, 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)');

const emailSchema = z
  .string()
  .email('E-mail inválido')
  .min(1, 'E-mail é obrigatório');

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Event form schema
export const eventSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  short_description: z.string().min(1, 'Descrição curta é obrigatória'),
  long_description: z.string().optional(),
  event_date: z.string().min(1, 'Data é obrigatória'),
  location: z.string().min(1, 'Local é obrigatório'),
  image_url: z.string().url('URL inválida').optional(),
  is_active: z.boolean(),
  batches: z.array(
    z.object({
      name: z.string().min(1, 'Nome do lote é obrigatório'),
      unit_price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
      total_quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
      type: z.string().min(1, 'Tipo é obrigatório'),
      start_date: z.string().min(1, 'Data inicial é obrigatória'),
      end_date: z.string().min(1, 'Data final é obrigatória'),
      is_active: z.boolean(),
    })
  ).min(1, 'Pelo menos um lote é obrigatório'),
});

// Payment form schema
export const paymentSchema = z.object({
  event_id: z.string().min(1, 'Evento é obrigatório'),
  batches: z.array(
    z.object({
      batch_id: z.string().min(1, 'Lote é obrigatório'),
      quantity: z.number().min(1, 'Quantidade deve ser maior que zero'),
    })
  ).min(1, 'Selecione pelo menos um ingresso'),
});

// Profile form schema
export const profileSchema = z.object({
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  email: emailSchema,
  current_password: passwordSchema.optional(),
  new_password: passwordSchema.optional(),
  confirm_password: passwordSchema.optional(),
}).refine(data => {
  if (data.new_password) {
    return data.current_password && data.confirm_password === data.new_password;
  }
  return true;
}, {
  message: "Senhas não conferem",
  path: ["confirm_password"],
});
