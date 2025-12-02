import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Building2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';

// Schema para Etapa 1 - Informações Básicas
const step1Schema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

// Schema para Etapa 2 - Tipo de Usuário
const step2Schema = z.object({
    role: z.enum(['CLIENT', 'PROVIDER'], {
        message: 'Selecione um tipo de usuário',
    }),
});

// Schema para Etapa 3 - Informações de Contato
const step3Schema = z.object({
    phone: z.string().min(14, 'Telefone inválido'),
    address: z.string().min(5, 'Endereço muito curto'),
    city: z.string().min(2, 'Cidade inválida'),
});

// Schema completo
const registerSchema = step1Schema.merge(step2Schema).merge(step3Schema);

type RegisterFormData = z.infer<typeof registerSchema>;

function Register() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const totalSteps = 3;

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
    };

    const handleNext = async () => {
        let fieldsToValidate: (keyof RegisterFormData)[] = [];
        
        if (currentStep === 1) {
            fieldsToValidate = ['name', 'email', 'password', 'confirmPassword'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['role'];
        }

        const isValid = await trigger(fieldsToValidate);
        
        if (isValid && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setErrorMessage('');
            await authApi.register({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                phone: data.phone,
                address: data.address,
                city: data.city,
            });
            // Redirecionar para login após cadastro
            navigate('/login');
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const message = axiosError.response?.data?.message || 'Erro ao realizar cadastro. Tente novamente.';
            setErrorMessage(message);
            console.error('Erro ao fazer cadastro:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserPlus className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Criar nova conta
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Preencha os dados abaixo para começar
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center mb-2">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                        step < currentStep
                                            ? 'bg-blue-600 text-white'
                                            : step === currentStep
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {step < currentStep ? <Check size={20} /> : step}
                                </div>
                                {step < totalSteps && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${
                                            step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {errorMessage}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1 - Informações Básicas */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Informações Básicas
                                </h3>

                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome Completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            id="name"
                                            type="text"
                                            {...register('name')}
                                            className={`pl-10 block w-full px-3 py-3 border ${
                                                errors.name ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="João Silva"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                    )}
                                </div>

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

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            {...register('confirmPassword')}
                                            className={`pl-10 block w-full px-3 py-3 border ${
                                                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2 - Tipo de Usuário */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Tipo de Conta
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Selecione como você deseja usar a plataforma
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Client */}
                                    <label className="cursor-pointer border-2 rounded-lg p-6 transition-all border-gray-300 hover:border-gray-400 has-checked:border-blue-600 has-checked:bg-blue-50">
                                        <input
                                            type="radio"
                                            value="CLIENT"
                                            {...register('role')}
                                            className="sr-only"
                                        />
                                        <div className="text-center">
                                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                                <User className="text-blue-600" size={32} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Cliente</h4>
                                            <p className="text-sm text-gray-600">
                                                Quero contratar serviços
                                            </p>
                                        </div>
                                    </label>

                                    {/* Provider */}
                                    <label className="cursor-pointer border-2 rounded-lg p-6 transition-all border-gray-300 hover:border-gray-400 has-checked:border-blue-600 has-checked:bg-blue-50">
                                        <input
                                            type="radio"
                                            value="PROVIDER"
                                            {...register('role')}
                                            className="sr-only"
                                        />
                                        <div className="text-center">
                                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                                <Building2 className="text-blue-600" size={32} />
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-1">Prestador</h4>
                                            <p className="text-sm text-gray-600">
                                                Quero oferecer serviços
                                            </p>
                                        </div>
                                    </label>
                                </div>
                                {errors.role && (
                                    <p className="mt-2 text-sm text-red-600 text-center">{errors.role.message}</p>
                                )}
                            </div>
                        )}

                        {/* Step 3 - Informações de Contato */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Informações de Contato
                                </h3>

                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            id="phone"
                                            type="text"
                                            {...register('phone', {
                                                onChange: (e) => {
                                                    e.target.value = formatPhone(e.target.value);
                                                },
                                            })}
                                            maxLength={15}
                                            className={`pl-10 block w-full px-3 py-3 border ${
                                                errors.phone ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="(11) 98765-4321"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Endereço
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            id="address"
                                            type="text"
                                            {...register('address')}
                                            className={`pl-10 block w-full px-3 py-3 border ${
                                                errors.address ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="Rua, número, bairro"
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                                    )}
                                </div>

                                {/* City */}
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                                        Cidade
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            id="city"
                                            type="text"
                                            {...register('city')}
                                            className={`pl-10 block w-full px-3 py-3 border ${
                                                errors.city ? 'border-red-300' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                            placeholder="São Paulo"
                                        />
                                    </div>
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex justify-between">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrevious}
                                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors hover:cursor-pointer"
                                >
                                    <ArrowLeft size={20} />
                                    Voltar
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:cursor-pointer"
                                >
                                    Próximo
                                    <ArrowRight size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Faça login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
