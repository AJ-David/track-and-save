import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Track & Save Caught an Error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-6 text-zinc-100">
          <div className="max-w-md w-full bg-[#12131a] rounded-2xl shadow-2xl border border-zinc-800 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center mx-auto mb-5 shadow-md shadow-red-950/50">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this page. Don't worry, your financial records remain safe.
            </p>

            {this.state.error && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-6 text-left overflow-auto max-h-36">
                <p className="text-xs font-mono text-red-400 font-semibold break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                icon={RotateCcw}
                onClick={this.handleReload}
                className="w-full sm:w-auto"
              >
                Reload App
              </Button>
              <Button
                variant="outline"
                icon={Home}
                onClick={this.handleGoHome}
                className="w-full sm:w-auto"
              >
                Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

