import { useNavigate } from 'react-router-dom';
import { Music, Activity, Layers, Ear, Compass, ChartNoAxesColumnIncreasing } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const modules = [
        {
            path: '/notes',
            title: 'Notenlesen',
            description: 'Noten benennen (Multiple Choice).',
            icon: <Music size={48} className="text-indigo-500" />,
            color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
        },
        {
            path: '/keyboard-notes',
            title: 'Töne auf der Klaviatur',
            description: 'Noten auf der Klaviatur finden.',
            icon: <Music size={48} className="text-blue-500" />,
            color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        },
        {
            path: '/intervals',
            title: 'Intervalle',
            description: 'Erkennen und Bilden von Intervallen bis zur Oktave.',
            icon: <Activity size={48} className="text-emerald-500" />,
            color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
        },
        {
            path: '/scales',
            title: 'Tonleitern',
            description: 'Dur- und Moll-Tonleitern bilden.',
            icon: <ChartNoAxesColumnIncreasing size={48} className="text-teal-500" />,
            color: 'bg-teal-50 hover:bg-teal-100 border-teal-200',
        },
        {
            path: '/triads',
            title: 'Dreiklänge',
            description: 'Bestimmen und Bilden von Dur, Moll, Vermindert und Übermäßig.',
            icon: <Layers size={48} className="text-rose-500" />,
            color: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
        },
        {
            path: '/ear-training',
            title: 'Gehörbildung',
            description: 'Intervalle und Dreiklänge nach Gehör bestimmen.',
            icon: <Ear size={48} className="text-amber-500" />,
            color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
        },
        {
            path: '/circle-of-fifths',
            title: 'Quintenzirkel',
            description: 'Tonarten, Vorzeichen und leitereigene Dreiklänge.',
            icon: <Compass size={48} className="text-violet-500" />,
            color: 'bg-violet-50 hover:bg-violet-100 border-violet-200',
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
            <h1 className="text-4xl font-bold mb-4 text-center text-slate-800">Musiktheorie lernen</h1>
            <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl">
                Wähle ein Modul, um deine Fähigkeiten zu trainieren.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {modules.map((m) => (
                    <button
                        key={m.path}
                        onClick={() => navigate(m.path)}
                        className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all transform hover:scale-105 shadow-sm ${m.color}`}
                    >
                        <div className="mb-4 bg-white p-4 rounded-full shadow-sm">{m.icon}</div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-800">{m.title}</h2>
                        <p className="text-center text-slate-600">{m.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Home;
