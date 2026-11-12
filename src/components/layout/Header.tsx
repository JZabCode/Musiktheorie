import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-slate-900 border-b border-white/10 p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center text-white">
                <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-slate-300 transition-colors">
                    Musiktheorie Trainer
                </Link>
            </div>
        </header>
    );
};

export default Header;
