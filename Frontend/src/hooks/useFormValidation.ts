import { useState } from 'react';
import { z } from 'zod';

interface UseFormValidationProps<T> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
}

interface ValidationErrors {
  [key: string]: string[];
}

export function useFormValidation<T>({ schema, onSubmit }: UseFormValidationProps<T>) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = async (data: unknown) => {
    try {
      const validatedData = await schema.parseAsync(data);
      setErrors({});
      await onSubmit(validatedData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(err.message);
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validate,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (field: string) => errors[field]?.[0],
  };
}
