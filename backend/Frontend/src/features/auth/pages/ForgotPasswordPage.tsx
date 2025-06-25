// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { Text } from '@/components/ui/Text';
// import { Button } from '@/components/ui/Button';
// import { ROUTES } from '@/config/routes';
// import { authService } from '../api/authService';

// export default function ForgotPasswordPage() {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEmailSent, setIsEmailSent] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       // Call API to send reset password email
//       await authService.requestPasswordReset(email);
//       setIsEmailSent(true);
//     } catch (err) {
//       setError('Não foi possível enviar o email de recuperação. Por favor, tente novamente.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isEmailSent) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="w-full max-w-md"
//         >
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6 text-center">
//             <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
//               <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <Text variant="h2" className="text-2xl font-bold text-gray-900 dark:text-white">
//               Email enviado!
//             </Text>
//             <Text variant="body" className="text-gray-600 dark:text-gray-400">
//               Enviamos um email com instruções para redefinir sua senha. Por favor, verifique sua caixa de entrada e a pasta de spam.
//             </Text>
//             <Button variant="outline" onClick={() => setIsEmailSent(false)}>
//               Tentar novamente
//             </Button>
//             <div className="text-sm">
//               <Link to={ROUTES.AUTH.LOGIN} className="font-medium text-senai-red hover:text-red-500">
//                 Voltar para o login
//               </Link>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md"
//       >
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-8">
//           <div>
//             <Text variant="h1" className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
//               Esqueceu sua senha?
//             </Text>
//             <Text variant="small" className="mt-2 text-center text-gray-600 dark:text-gray-400">
//               Digite seu email para receber um link de redefinição de senha
//             </Text>
//           </div>

//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 Email
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-senai-red focus:outline-none focus:ring-1 focus:ring-senai-red sm:text-sm"
//                   placeholder="seu@email.com"
//                 />
//               </div>
//             </div>

//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="rounded-md bg-red-50 dark:bg-red-900/50 p-4"
//               >
//                 <Text variant="small" className="text-red-700 dark:text-red-200">{error}</Text>
//               </motion.div>
//             )}

//             <Button
//               type="submit"
//               variant="primary"
//               className="w-full"
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <div className="flex items-center justify-center">
//                   <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   <span className="ml-2">Enviando...</span>
//                 </div>
//               ) : (
//                 'Enviar email de recuperação'
//               )}
//             </Button>
//           </form>

//           <div className="text-center">
//             <Text variant="small" className="text-gray-600 dark:text-gray-400">
//               Lembrou sua senha?{' '}
//               <Link
//                 to={ROUTES.AUTH.LOGIN}
//                 className="font-medium text-senai-red hover:text-red-500"
//               >
//                 Faça login
//               </Link>
//             </Text>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }
