import { useAuth } from '@/hooks/useAuth';

export default function BookingsPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Meus Agendamentos
            </h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                    Bem-vindo, <span className="font-semibold">{user?.name}</span>!
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    Esta é uma página protegida. Apenas usuários autenticados podem acessá-la.
                </p>
            </div>
        </div>
    );
}
