import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/data/api';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setErrorMessage('');
            await authApi.login({ email: data.email, password: data.password });
            navigate('/');
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const message = axiosError.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.';
            setErrorMessage(message);
            console.error('Erro ao fazer login:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <LogIn className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Bem-vindo de volta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {errorMessage}
                        </div>
                    )}
                    
                    <div className="rounded-md shadow-sm space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={`pl-10 block w-full px-3 py-3 border ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="seu@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    className={`pl-10 block w-full px-3 py-3 border ${
                                        errors.password ? 'border-red-300' : 'border-gray-300'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Remember & Forgot */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Lembrar-me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Esqueceu a senha?
                            </a>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
                        >
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{' '}
                            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Cadastre-se agora
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
