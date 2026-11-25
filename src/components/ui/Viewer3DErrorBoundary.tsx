import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackClassName?: string;
}

interface State {
  hasError: boolean;
}

export default class Viewer3DErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn("[Viewer3D] Fallback due to error:", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className={`flex flex-col items-center justify-center gap-3 text-center ${this.props.fallbackClassName ?? ""}`}
          role="img"
          aria-label="3D viewer unavailable"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-slate-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">3D viewer unavailable</p>
        </div>
      );
    }
    return this.props.children;
  }
}
