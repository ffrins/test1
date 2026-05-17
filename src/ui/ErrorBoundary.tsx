import React from 'react';

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0f172a',
            color: '#fecaca',
            padding: 24,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            overflow: 'auto',
            zIndex: 99999,
          }}
        >
          <h2 style={{ color: '#f87171', marginBottom: 12 }}>运行时错误</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fca5a5' }}>
            {String(this.state.error?.stack || this.state.error?.message)}
          </pre>
          {this.state.info && (
            <details style={{ marginTop: 16, color: '#fcd34d' }}>
              <summary>Component stack</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
