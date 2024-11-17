import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import MainApp from './MainApp';
import WalletPage from './pages/WalletPage';
import Admin from './Admin';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <MainApp />
      },
      {
        path: '/wallet',
        element: <WalletPage />
      },
      {
        path: '/admin',
        element: <Admin />
      }
    ]
  }
]);

export default router; 