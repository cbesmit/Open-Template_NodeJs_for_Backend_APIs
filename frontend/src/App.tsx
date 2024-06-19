import { FC, useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'src/store/Store';
import { ThemeSettings } from './theme/Theme';
import RTL from './layouts/full/shared/customizer/RTL';
import ScrollToTop from './components/shared/ScrollToTop';
import { AppState, store } from './store/Store';

//se configura para que fetchServer pueda acceder al token jwt del usuario
import { configureFetchServer } from './utils/fetchServer';

import RouterLogin from './modules/login/Router';
import RouterHome from './modules/home/Router';

const combinedRoutes = [
  ...RouterLogin,
  ...RouterHome,
];

const App: FC = () => {
  const routing = useRoutes(combinedRoutes);
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  useEffect(() => {
    // Configura fetchServer con la instancia de la tienda de Redux
    configureFetchServer(store);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <RTL direction={customizer.activeDir}>
        <CssBaseline />
        <ScrollToTop>{routing}</ScrollToTop>
      </RTL>
    </ThemeProvider>
  );
};

export default App;
