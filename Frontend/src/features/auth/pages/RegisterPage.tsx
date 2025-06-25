import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { ROUTES } from '@/config/routes';
import { Button, Text } from '@/components/ui';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/providers/AuthProvider';
import { validatePassword, validateEmail } from '@/utils/validation';
export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setPasswordError('');
    setEmailError('');
    // Validate password before submitting
    const {isValid, errors} = validatePassword(password);
    if (!isValid) {
      setPasswordError(errors[0] ?? '');
      setIsLoading(false);
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      setIsLoading(false);
      return;
    }
    try {
      await authService.register({ name, email, password });
      // Auto-login after registration
      await login({ email, password });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-8">
          <div>
            <Text variant="h1" className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Criar conta
            </Text>
            <Text variant="small" className="mt-2 text-center text-gray-600 dark:text-gray-400">
              Preencha os campos para se registrar
            </Text>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-senai-red focus:outline-none focus:ring-1 focus:ring-senai-red sm:text-sm"
                  placeholder="Seu nome"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-senai-red focus:outline-none focus:ring-1 focus:ring-senai-red sm:text-sm"
                  placeholder="seu@email.com"
                />
                {emailError && (
                  <div className="mt-2 text-red-600 dark:text-red-400 text-xs">{emailError}</div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    const { errors } = validatePassword(e.target.value);
                    setPasswordError(errors[0] ?? '');
                  }}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-senai-red focus:outline-none focus:ring-1 focus:ring-senai-red sm:text-sm pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 dark:text-gray-500 focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <div className="mt-2 text-red-600 dark:text-red-400 text-xs">{passwordError}</div>
              )}
            </div>
            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 text-red-700 dark:text-red-200 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Registrando...' : 'Registrar'}
            </Button>
          </form>
          <div className="text-center">
            <Text variant="small" className="text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <a href={ROUTES.AUTH.LOGIN} className="text-senai-red hover:underline">Entrar</a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
