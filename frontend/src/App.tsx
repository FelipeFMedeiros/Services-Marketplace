import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import HomePage from '@/pages/HomePage';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
                {/* Navbar */}
                <nav className="bg-white shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <a href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                                <Lightbulb className="w-8 h-8" />
                                Services Marketplace
                            </a>
                            <div className="flex items-center gap-4">
                                <a 
                                    href="/login" 
                                    className="px-6 py-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                >
                                    Login
                                </a>
                                <a 
                                    href="/register" 
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Cadastrar-se
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
