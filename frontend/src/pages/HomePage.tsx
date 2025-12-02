import { Search, Briefcase, UserCheck } from 'lucide-react';

function HomePage() {
    return (
        <>
            {/* Hero Section */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl font-bold mb-6">
                            Encontre o Profissional Ideal
                        </h1>
                        <p className="text-xl mb-8 text-blue-100">
                            Conectamos você aos melhores prestadores de serviços da sua região
                        </p>
                        
                        {/* Search Bar */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 max-w-2xl mx-auto border border-white/20">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Buscar Serviços"
                                            className="w-full pl-12 pr-4 py-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 hover:shadow-lg transition-all shadow-md">
                                    Pesquisar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Search className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Busca Fácil</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Encontre profissionais por categoria, localização e avaliações
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Agendamento Simples</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Escolha data, horário e confirme em poucos cliques
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                            <UserCheck className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900">Profissionais Verificados</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Todos os prestadores são avaliados pela comunidade
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-4 text-gray-900">
                        Você é um Prestador de Serviços?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Cadastre-se gratuitamente e comece a receber contratações hoje mesmo!
                    </p>
                    <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg">
                        Quero Ofertar Meus Serviços
                    </button>
                </div>
            </div>
        </>
    );
}
export default HomePage;