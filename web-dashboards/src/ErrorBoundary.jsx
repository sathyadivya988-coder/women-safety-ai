import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical UI Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-10 font-sans">
                    <div className="bg-red-500/10 border border-red-500 p-8 rounded-3xl max-w-lg w-full text-center">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
                        <p className="text-slate-400 mb-6 text-sm">
                            The application encounterd a rendering error. This usually happens if the map library or location data is malformed.
                        </p>
                        <div className="bg-black/50 p-4 rounded-xl text-left overflow-auto max-h-40 mb-6 font-mono text-xs text-red-300">
                            {this.state.error?.toString()}
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
