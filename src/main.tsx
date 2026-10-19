import { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HeroQuest error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-8 flex flex-col items-center justify-center font-mono">
          <div className="max-w-xl w-full border-4 border-red-700 bg-stone-900 p-6 rounded shadow-2xl">
            <h1 className="text-xl text-red-500 font-bold mb-4">⚔️ Error al cargar HeroQuest</h1>
            <p className="text-amber-300 text-sm mb-4">
              {this.state.error?.message || 'Error desconocido al inicializar'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded cursor-pointer"
            >
              Recargar Juego
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
