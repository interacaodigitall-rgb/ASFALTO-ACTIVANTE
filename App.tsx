
import React, { useState, useCallback } from 'react';
import { Chat } from './components/Chat';
import type { ChatMessage } from './types';
import { getAssistantResponse } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// --- INITIAL CHAT CONFIG ---
const initialQuickReplies = [
    "Quero alugar uma viatura.",
    "Quero um 'slot' (tenho carro).",
    "Quero saber sobre gestão de frotas.",
    "Quais os vossos planos?",
];

const initialMessages: ChatMessage[] = [
    {
        id: 'init',
        role: 'assistant',
        text: 'Bem-vindo ao Grupo Cativante. Sou o seu assistente virtual. Procura uma viatura para trabalhar ou um serviço de gestão para a sua frota? Como posso ajudar?',
        quickReplies: initialQuickReplies,
    }
];

// --- NAVIGATION HANDLERS ---
const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};


// --- ICONS ---
const Logo = () => (
    <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tracking-wide text-white">GRUPO</span>
        <span className="text-xl font-bold tracking-wide text-lime-400">CATIVANTE</span>
    </div>
);
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V12a1 1 0 011-1h12a1 1 0 011 1v4.382a1 1 0 01-.553.894L15 20M9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5" /></svg>;
const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917c0 1.34.223 2.63.635 3.834a1.8 1.8 0 001.785 1.252h12.16a1.8 1.8 0 001.785-1.252c.412-1.203.635-2.493.635-3.834 0-3.844-1.18-7.48-3.321-10.34z" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.846 6.215l-1.064 3.886 3.995-1.042z" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lime-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>

// --- PAGE COMPONENTS ---

const EntryScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
    <div 
        className="h-screen w-screen bg-black bg-cover bg-center text-white flex flex-col items-center justify-center p-8 relative" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop')" }}
    >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
            <div className="mb-12">
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>DRIVE</h1>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-lime-400 uppercase" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>YOUR FUTURE</h2>
            </div>
            <button 
                onClick={onEnter} 
                className="bg-lime-400 text-black font-bold text-xl py-4 px-14 rounded-full border-2 border-lime-400 hover:bg-transparent hover:text-lime-400 transition-all duration-300"
            >
                ENTRAR
            </button>
        </div>
    </div>
);


const Header: React.FC<{ onDriverAreaClick: () => void }> = ({ onDriverAreaClick }) => (
    <header className="bg-black/80 backdrop-blur-sm p-4 sticky top-0 z-40 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between">
            <a href="/" onClick={handleLogoClick} className="flex items-center gap-3">
                <Logo />
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm">
                <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-gray-300 hover:text-lime-400 transition-colors">Sobre Nós</a>
                <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="text-gray-300 hover:text-lime-400 transition-colors">Serviços</a>
                <a href="#rental-plans" onClick={(e) => handleNavClick(e, 'rental-plans')} className="text-gray-300 hover:text-lime-400 transition-colors">Aluguer</a>
                <a href="#why-us" onClick={(e) => handleNavClick(e, 'why-us')} className="text-gray-300 hover:text-lime-400 transition-colors">Vantagens</a>
                <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-gray-300 hover:text-lime-400 transition-colors">FAQ</a>
                <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="text-gray-300 hover:text-lime-400 transition-colors">Contacto</a>
            </nav>
            <button onClick={onDriverAreaClick} className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-2 px-4 rounded-md transition-colors text-sm">
                Área do Motorista
            </button>
        </div>
    </header>
);

const HeroSection: React.FC<{ onVerPlanosClick: () => void }> = ({ onVerPlanosClick }) => (
    <section className="relative min-h-[600px] py-20 md:py-32 flex items-center text-white">
        <div className="absolute inset-0 bg-black">
             <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" alt="Mãos a apertar sobre um portátil com gráficos de negócio" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center relative z-10">
            <div className="max-w-xl">
                 <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">O Poder das Parcerias para o seu <span className="text-lime-400">Sucesso no Mundo TVDE</span></h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8">
                    Juntos, otimizamos a sua operação, desde o aluguer de viaturas à gestão completa da frota, garantindo a máxima rentabilidade.
                </p>
                <div className="flex flex-wrap gap-4">
                    <button onClick={onVerPlanosClick} className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-3 px-8 rounded-lg transition-colors text-lg inline-flex items-center">
                        Ver Planos de Gestão 360°
                    </button>
                </div>
            </div>
            <div className="hidden md:flex flex-col gap-6 bg-black/50 backdrop-blur-md p-8 rounded-lg border border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="bg-lime-400/20 text-lime-400 p-3 rounded-full"><CarIcon /></div>
                    <div>
                        <h3 className="font-bold text-xl">Viaturas Premium</h3>
                        <p className="text-gray-400">Conduza os melhores veículos do mercado.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="bg-lime-400/20 text-lime-400 p-3 rounded-full"><ShieldCheckIcon /></div>
                    <div>
                        <h3 className="font-bold text-xl">Gestão Simplificada</h3>
                        <p className="text-gray-400">Foque-se em conduzir, nós tratamos do resto.</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="bg-lime-400/20 text-lime-400 p-3 rounded-full"><TrendingUpIcon /></div>
                    <div>
                        <h3 className="font-bold text-xl">Maximize os Ganhos</h3>
                        <p className="text-gray-400">Otimizamos a sua operação para maior lucro.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const AboutSection = () => (
    <section id="about" className="py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
                 <h2 className="text-3xl font-bold mb-4">Sobre o <span className="text-lime-400">Grupo Cativante</span></h2>
                 <p className="text-gray-400 mb-12">Com mais de 20 anos de experiência, oferecemos soluções completas para motoristas e clientes que exigem excelência, segurança e autonomia. Somos especialistas em transporte TVDE, Uber Black e importação automóvel, sempre com foco na qualidade premium.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg text-center">
                    <div className="text-lime-400 text-5xl font-bold mb-2">20+</div>
                    <div className="text-gray-400">Anos de Experiência</div>
                </div>
                 <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg text-center">
                    <div className="text-lime-400 text-5xl font-bold mb-2">500+</div>
                    <div className="text-gray-400">Motoristas Ativos</div>
                </div>
                 <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg text-center">
                    <div className="text-lime-400 text-5xl font-bold mb-2">100%</div>
                    <div className="text-gray-400">Satisfação Garantida</div>
                </div>
            </div>
        </div>
    </section>
);

const ServicesSection = () => (
    <section id="services" className="py-16 md:py-24 bg-gray-900/50 text-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">Os Nossos <span className="text-lime-400">Serviços 360°</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-black border border-gray-800 p-6 rounded-lg text-center hover:border-lime-400 transition-colors">
                    <h3 className="font-bold text-xl mb-2">Criação de Empresa</h3>
                    <p className="text-gray-400 text-sm">Apoio na abertura de atividade e enquadramento fiscal para TVDE.</p>
                </div>
                 <div className="bg-black border border-gray-800 p-6 rounded-lg text-center hover:border-lime-400 transition-colors">
                    <h3 className="font-bold text-xl mb-2">Contabilidade TVDE</h3>
                    <p className="text-gray-400 text-sm">Gestão contabilística mensal e anual, e entrega de declarações obrigatórias.</p>
                </div>
                <div className="bg-black border border-gray-800 p-6 rounded-lg text-center hover:border-lime-400 transition-colors">
                    <h3 className="font-bold text-xl mb-2">Gestão de Frota</h3>
                    <p className="text-gray-400 text-sm">Gestão de viaturas, motoristas, licenças, seguros e manutenção.</p>
                </div>
                <div className="bg-black border border-gray-800 p-6 rounded-lg text-center hover:border-lime-400 transition-colors">
                    <h3 className="font-bold text-xl mb-2">Aluguer e Slots</h3>
                    <p className="text-gray-400 text-sm">Fornecimento de viaturas premium ou integração da sua viatura na nossa frota.</p>
                </div>
            </div>
        </div>
    </section>
);

const CostComparisonChart: React.FC = () => {
    const data = [
      { name: 'Individual', Separado: 450, 'Pacote Integrado': 350 },
      { name: 'Frota Pequena', Separado: 550, 'Pacote Integrado': 450 },
      { name: 'Frota Média', Separado: 700, 'Pacote Integrado': 600 },
    ];
  
    return (
      <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg mt-8">
        <h4 className="text-xl font-bold text-center text-white mb-4">Comparativo de Custos Mensais</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(value) => `€${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              labelStyle={{ color: '#d1d5db' }}
              formatter={(value: number) => `€${value}`}
            />
            <Legend wrapperStyle={{ color: '#d1d5db' }} />
            <Bar dataKey="Separado" fill="#a855f7" name="Custo Separado" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pacote Integrado" fill="#a3e635" name="Nosso Pacote" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

interface PlansSectionProps {
    onPlanSelect: (prompt: string) => void;
}

const PlansSection: React.FC<PlansSectionProps> = ({ onPlanSelect }) => (
    <section id="rental-plans" className="py-16 md:py-24 bg-black text-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">Modalidades de <span className="text-lime-400">Aluguer</span></h2>
                <p className="text-gray-400 mt-2">Para motoristas que procuram uma viatura ou querem rentabilizar a sua.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 <div className="bg-gray-900/50 border-2 border-lime-400 p-8 rounded-lg relative flex flex-col">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-lime-400 text-black text-xs font-bold px-4 py-1 rounded-full">RECOMENDADO</div>
                    <div className="flex-grow">
                        <h3 className="font-bold text-xl text-center mb-2">Aluguer de Viatura</h3>
                        <p className="text-center text-gray-400 mb-4">Tesla Model 3 (ou similar)</p>
                        <p className="text-center text-4xl font-bold my-4">380€ <span className="text-lg font-normal text-gray-400">/ semana</span></p>
                        <p className="text-center text-lime-400 font-semibold text-2xl mb-4">+ 6% <span className="text-lg font-normal text-gray-400">do ganho líquido</span></p>
                        <p className="text-center text-xs text-gray-500 mb-6">Inclui seguro, manutenção e apoio total. O IVA sobre o aluguer é de 6%.</p>
                    </div>
                     <button onClick={() => onPlanSelect("Olá, tenho interesse na modalidade recomendada de aluguer de viatura (Tesla).")} className="w-full block text-center bg-lime-400 text-black font-bold py-3 rounded-lg hover:bg-lime-500 transition-colors mt-auto">Escolher Esta Modalidade</button>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg flex flex-col">
                    <div className="flex-grow">
                        <h3 className="font-bold text-xl text-center mb-2">Aluguer de Slot</h3>
                        <p className="text-center text-gray-400 mb-4">(Viatura Própria)</p>
                         <p className="text-center text-lime-400 font-semibold text-2xl my-4">6% <span className="text-lg font-normal text-gray-400">IVA (ganho líquido)</span></p>
                         <p className="text-center text-lime-400 font-semibold text-2xl mb-4">+ 4% <span className="text-lg font-normal text-gray-400">pelo serviço</span></p>
                         <p className="text-center text-gray-400 text-sm">Use o seu carro sob a nossa estrutura empresarial, sem burocracias.</p>
                    </div>
                     <button onClick={() => onPlanSelect("Olá, gostaria de saber mais sobre o aluguer de slot para a minha viatura própria.")} className="w-full block text-center border-2 border-gray-500 text-white font-bold py-3 rounded-lg hover:border-lime-400 hover:text-lime-400 transition-colors mt-auto">Escolher Esta Modalidade</button>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg flex flex-col">
                    <div className="flex-grow">
                         <h3 className="font-bold text-xl text-center mb-2">Outros Alugueres</h3>
                          <p className="text-center text-gray-400 mb-4">Diversos modelos de viaturas</p>
                        <p className="text-center text-4xl font-bold my-4">Desde 230€ <span className="text-lg font-normal text-gray-400">/semana</span></p>
                        <p className="text-center text-gray-400 text-sm">Temos outras viaturas disponíveis para aluguer. Fale connosco para saber as opções e condições.</p>
                    </div>
                    <button onClick={() => onPlanSelect("Olá, podem informar-me sobre as outras viaturas para aluguer a partir de 230€?")} className="w-full block text-center border-2 border-gray-500 text-white font-bold py-3 rounded-lg hover:border-lime-400 hover:text-lime-400 transition-colors mt-auto">Consultar Opções</button>
                </div>
            </div>
        </div>
    </section>
);

const ManagementPlansModal: React.FC<{ onClose: () => void; onContactClick: () => void; }> = ({ onClose, onContactClick }) => {
    const servicesIncluded = [
        'Criação de Empresa',
        'Contabilidade Especializada',
        'Gestão de Frota e Motoristas',
        'Apoio com Licenças e Seguros',
        'Relatórios de Performance',
    ];

    const PlanCard: React.FC<{title: string, subtitle: string, price: string, saving: string, highlight?: boolean}> = ({title, subtitle, price, saving, highlight}) => (
        <div className={`bg-gray-900/50 border ${highlight ? 'border-lime-400 border-2' : 'border-gray-800'} p-8 rounded-lg text-center flex flex-col`}>
            <div className="flex-grow">
                <h3 className="font-bold text-xl mb-2">{title}</h3>
                <p className="text-gray-400 mb-4">{subtitle}</p>
                <p className="text-5xl font-bold my-4 text-lime-400">{price}<span className="text-lg font-normal text-gray-400">/mês</span></p>
                <p className="text-green-400 font-semibold mb-6">{saving}</p>
                <ul className="space-y-3 text-left my-6">
                    {servicesIncluded.map(service => (
                        <li key={service} className="flex items-center gap-3">
                            <CheckIcon/>
                            <span className="text-gray-300">{service}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><CloseIcon /></button>
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white">Planos de Gestão <span className="text-lime-400">360°</span></h2>
                    <p className="text-gray-400 mt-2 text-lg">Para investidores e donos de frota que procuram tranquilidade e maximização de lucros.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <PlanCard title="Individual" subtitle="(1 carro)" price="350€" saving="Poupança de 100€" />
                    <PlanCard title="Frota Pequena" subtitle="(Até 3 carros)" price="450€" saving="Poupança de 100€" highlight />
                    <PlanCard title="Frota Média" subtitle="(Até 10 carros)" price="600€" saving="Poupança de 100€" />
                </div>
                <CostComparisonChart />
                <div className="text-center mt-12">
                    <button onClick={onContactClick} className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-3 px-8 rounded-lg transition-colors text-lg">
                        Fale com um Especialista
                    </button>
                </div>
            </div>
        </div>
    );
};

const WhyChooseUsSection = () => {
    const advantages = [
        { title: 'Atendimento Ágil', description: 'Suporte rápido e eficiente para todas as suas necessidades.' },
        { title: 'Gestão Fiscal e Contabilística', description: 'Tratamos de toda a documentação, impostos e obrigações fiscais.' },
        { title: 'Veículos Premium', description: 'Frota moderna e eficiente para garantir o máximo conforto e rentabilidade.' },
        { title: 'Gestão de Frota Centralizada', description: 'Otimização de processos, relatórios em tempo real e controlo total.' },
        { title: 'Pagamentos Semanais', description: 'Receba os seus ganhos todas as segundas-feiras, sem falhas.' },
        { title: 'Segurança e Confiança', description: 'Mais de 20 anos de experiência e solidez no setor automóvel.' },
    ];
    return (
        <section id="why-us" className="py-16 md:py-24 bg-gray-900/50 text-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Por que escolher o <span className="text-lime-400">Grupo Cativante?</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {advantages.map(adv => (
                        <div key={adv.title} className="bg-black p-6 rounded-lg border border-gray-800">
                            <h3 className="font-bold text-xl text-lime-400 mb-2">{adv.title}</h3>
                            <p className="text-gray-400 text-sm">{adv.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
};

const FaqItem: React.FC<{ q: string; a: string; isOpen: boolean; onClick: () => void; }> = ({ q, a, isOpen, onClick }) => (
    <div className="border-b border-gray-800">
        <button onClick={onClick} className="w-full flex justify-between items-center text-left py-6">
            <span className="font-bold text-lg">{q}</span>
            <div className={`transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}><ChevronDownIcon/></div>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <p className="pb-6 text-gray-400">{a}</p>
        </div>
    </div>
);

const FaqSection = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const faqs = [
        { q: "Preciso abrir empresa para ser motorista?", a: "Sim, é necessário ter atividade aberta ou uma empresa. Com a nossa modalidade 'Aluguer de Slot', nós fornecemos a estrutura empresarial, simplificando todo o processo para si." },
        { q: "Qual a diferença entre alugar um carro e um 'slot'?", a: "'Alugar um carro' significa que nós fornecemos a viatura pronta a trabalhar. 'Alugar um slot' é para quem já tem carro próprio e quer usar a nossa estrutura empresarial para operar legalmente e sem burocracias." },
        { q: "O que inclui o serviço de Gestão 360°?", a: "Inclui tudo o que um dono de frota precisa: constituição da empresa, contabilidade, gestão de motoristas, gestão documental das viaturas (seguros, licenças), e relatórios financeiros. É uma solução completa para que se foque apenas nos lucros." },
        { q: "Carros a combustão são aceites?", a: "Sim, na modalidade de 'Aluguer de Slot' aceitamos viaturas a combustão, desde que cumpram todos os requisitos exigidos pelas plataformas TVDE (Uber, Bolt) em Portugal." },
    ];

    return (
        <section id="faq" className="py-16 md:py-24 bg-black text-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold">Perguntas <span className="text-lime-400">Frequentes</span></h2>
                </div>
                <div>
                    {faqs.map((faq, index) => (
                        <FaqItem key={index} q={faq.q} a={faq.a} isOpen={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const ContactSection: React.FC = () => {
    const whatsappUrl = "https://wa.me/351914800818?text=" + encodeURIComponent("Olá! Vim do vosso site e gostaria de saber mais sobre os vossos serviços.");
    
    return (
    <section id="contact" className="py-16 md:py-24 bg-gray-900/50 text-white">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">Entre em <span className="text-lime-400">Contacto</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                 <div className="bg-black border border-gray-800 p-8 rounded-lg text-center flex flex-col items-center">
                    <LocationIcon />
                    <h3 className="font-bold text-xl my-4">Localização</h3>
                    <p className="text-gray-400 mb-4">Lisboa, Portugal</p>
                 </div>
                 <div className="bg-black border border-gray-800 p-8 rounded-lg text-center flex flex-col items-center">
                    <PhoneIcon />
                    <h3 className="font-bold text-xl my-4">Telefone</h3>
                    <p className="text-gray-400 mb-4">+351 914 800 818</p>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors">WhatsApp</a>
                 </div>
                 <div className="bg-black border border-gray-800 p-8 rounded-lg text-center flex flex-col items-center">
                    <MailIcon />
                    <h3 className="font-bold text-xl my-4">Email</h3>
                    <p className="text-gray-400 mb-4">cativante.geral@gmail.com</p>
                    <a href="mailto:cativante.geral@gmail.com" className="border-2 border-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:border-lime-400 hover:text-lime-400 transition-colors">Enviar Email</a>
                 </div>
            </div>
        </div>
    </section>
);
}
const Footer: React.FC = () => (
    <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
             <div className="flex justify-center mb-6">
                <a href="/" onClick={handleLogoClick}><Logo /></a>
            </div>
            <p className="mb-6 max-w-2xl mx-auto">Mais de 20 anos de experiência em transportes TVDE, oferecendo soluções completas para motoristas que exigem excelência e autonomia.</p>
            <div className="flex justify-center gap-6 mb-8">
                 <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="text-gray-400 hover:text-lime-400 transition-colors">Sobre Nós</a>
                 <a href="#services" onClick={(e) => handleNavClick(e, 'services')} className="text-gray-400 hover:text-lime-400 transition-colors">Serviços</a>
                 <a href="#rental-plans" onClick={(e) => handleNavClick(e, 'rental-plans')} className="text-gray-400 hover:text-lime-400 transition-colors">Aluguer</a>
            </div>
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Grupo Cativante. Todos os direitos reservados.</p>
        </div>
    </footer>
);


const ChatToggleButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="bg-lime-400 hover:bg-lime-500 text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
        aria-label="Abrir chat"
    >
        <ChatBubbleIcon />
    </button>
);

const WhatsAppButton: React.FC = () => {
    const whatsappUrl = "https://wa.me/351914800818?text=" + encodeURIComponent("Olá! Vim do vosso site e gostaria de saber mais sobre os vossos serviços.");

    return (
    <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 hover:bg-green-500 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
        aria-label="Contactar via WhatsApp"
    >
        <WhatsAppIcon />
    </a>
);
}

const MainLayout: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  
  const WHATSAPP_URL = "https://wa.me/351914800818?text=" + encodeURIComponent("Olá! Vim do vosso site e gostaria de falar com um gestor sobre os vossos serviços.");
  const ACTION_CODE = "[ACTION:WHATSAPP]";

  const handleRequestHuman = useCallback(() => {
    window.open(WHATSAPP_URL, '_blank');
  }, [WHATSAPP_URL]);

  const handleSendMessage = useCallback(async (message: string) => {
    // Reset quick replies on new message
    const historyWithoutReplies = chatHistory.map(m => {
        const { quickReplies, ...rest } = m;
        return rest;
    });

    const updatedHistory: ChatMessage[] = [
        ...historyWithoutReplies,
        { id: Date.now().toString(), role: 'user', text: message }
    ];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
        const response = await getAssistantResponse(updatedHistory);
        let responseText = response.text;

        if (responseText.includes(ACTION_CODE)) {
            responseText = responseText.replace(ACTION_CODE, "").trim();
            handleRequestHuman();
        }

        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(), role: 'assistant', text: responseText,
        };
        setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
        console.error("Failed to get response:", error);
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(), role: 'assistant', text: 'Ocorreu um erro. Por favor, tente novamente.'
        };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [chatHistory, handleRequestHuman]);

  const openChatWithPrompt = useCallback(async (prompt: string) => {
      setIsChatOpen(true);
      // Brief delay to allow the chat window to render before sending the message
      setTimeout(() => {
        handleSendMessage(prompt);
      }, 100);
  },[handleSendMessage]);

  const toggleChat = () => setIsChatOpen(prev => !prev);
    
    return (
        <div className="bg-black text-gray-200 font-sans">
            <Header onDriverAreaClick={() => openChatWithPrompt("Olá, gostaria de aceder à Área do Motorista.")}/>
            <main>
                <HeroSection onVerPlanosClick={() => setIsPlansModalOpen(true)} />
                <AboutSection />
                <ServicesSection />
                <PlansSection onPlanSelect={openChatWithPrompt} />
                <WhyChooseUsSection />
                <FaqSection />
                <ContactSection/>
            </main>
            <Footer />

            {isPlansModalOpen && (
                <ManagementPlansModal 
                    onClose={() => setIsPlansModalOpen(false)}
                    onContactClick={() => {
                        setIsPlansModalOpen(false);
                        openChatWithPrompt("Olá, tenho interesse nos vossos planos de gestão 360°.");
                    }}
                />
            )}

            <div className="fixed bottom-5 left-5 z-50">
                <WhatsAppButton />
            </div>

            <div className="fixed bottom-5 right-5 z-50">
                {!isChatOpen && <ChatToggleButton onClick={toggleChat} />}
            </div>
            {isChatOpen && (
                <div className="fixed bottom-5 right-5 sm:bottom-20 z-50 w-[calc(100%-2.5rem)] max-w-md h-[70vh] max-h-[600px] transition-all duration-300 ease-in-out">
                    <Chat 
                        messages={chatHistory} 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading} 
                        onClose={toggleChat}
                        onRequestHuman={handleRequestHuman}
                    />
                </div>
            )}
        </div>
    )
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return <EntryScreen onEnter={() => setHasEntered(true)} />;
  }

  return <MainLayout />;
}