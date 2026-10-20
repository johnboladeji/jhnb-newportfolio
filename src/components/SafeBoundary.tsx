import { Component, type ReactNode } from "react";

/**
 * Contains a crash in a decorative part of the page (the WebGL background, the hero photos) so the rest of the site
 * keeps working. Renders `fallback` (nothing by default) once its children have thrown.
 */
export default class SafeBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("A decorative part of the page failed and was skipped:", error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
