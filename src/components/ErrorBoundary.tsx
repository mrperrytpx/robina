import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-screen-2xl flex-1 flex-col items-center justify-center gap-4 p-4 text-center text-gray-200">
                    <div className="flex flex-col items-center justify-center text-center">
                        <h1>
                            Well, well, well, if it isn&apos;t the consequences
                            of my own actions
                        </h1>
                        <h2>Reload the page 😒</h2>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
