import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/theme.css';
import App from './App';
import Store from './store/store';

(function initThemeBeforeRender() {
  const saved = localStorage.getItem('app-theme');
  const theme = saved === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();

interface State{
  store: Store;
}

const store = new Store();

export const Context = React.createContext<State>({
  store,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Context.Provider value={{ store }}>
      <App />
    </Context.Provider> 
  </React.StrictMode>
);

