import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import IntervalModule from './pages/IntervalModule';
import NotesModule from './pages/NotesModule';
import KeyboardNotesModule from './pages/KeyboardNotesModule';
import TriadsModule from './pages/TriadsModule';
import EarTrainingModule from './pages/EarTrainingModule';
import CircleOfFifthsModule from './pages/CircleOfFifthsModule';
import ScalesModule from './pages/ScalesModule';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/intervals" element={<IntervalModule />} />
            <Route path="/notes" element={<NotesModule />} />
            <Route path="/keyboard-notes" element={<KeyboardNotesModule />} />
            <Route path="/scales" element={<ScalesModule />} />
            <Route path="/triads" element={<TriadsModule />} />
            <Route path="/ear-training" element={<EarTrainingModule />} />
            <Route path="/circle-of-fifths" element={<CircleOfFifthsModule />} />
          </Routes>
        </main>
        <footer className="text-center p-4 text-slate-500 text-sm">
          Music Theory Trainer v1.0
        </footer>
      </div>
    </Router>
  );
}

export default App;
