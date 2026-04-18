import { Component, type ReactNode } from "react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[var(--color-bg)] p-8">
          <h1 className="text-lg font-semibold text-red-400">
            Something went wrong
          </h1>
          <p className="max-w-md text-center text-sm text-[var(--color-text-muted)]">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
