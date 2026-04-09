import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./app/store";
import App from "./App";
import "./styles/index.css";
import "leaflet/dist/leaflet.css";

// ── Workaround: React DOM reconciliation error ──────────────────────────── //
// React 19 + React Router v7 puede generar "removeChild" / "insertBefore"
// durante transiciones de ruta cuando el DOM real diverge del virtual DOM.
// Referencia: https://github.com/facebook/react/issues/17256
if (typeof Node !== "undefined") {
  const origRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return origRemoveChild.call(this, child) as T;
  };

  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    refNode: Node | null,
  ): T {
    if (refNode && refNode.parentNode !== this) {
      return newNode;
    }
    return origInsertBefore.call(this, newNode, refNode) as T;
  };
}

// Crear instancia de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: 2,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <App />
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
