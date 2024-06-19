import { FC } from 'react';
import { useSelector } from 'src/store/Store';
import { Link } from 'react-router-dom';
import LogoDarkPng from 'src/assets/images/logos/light-logo.svg'; 
import LogoDarkRTLPng from 'src/assets/images/logos/light-logo.svg'; 
import LogoLightPng from 'src/assets/images/logos/light-logo.svg'; 
import LogoLightRTLPng from 'src/assets/images/logos/light-logo.svg';
import { styled } from '@mui/material';
import { AppState } from 'src/store/Store';

const Logo: FC = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const LinkStyled = styled(Link)(() => ({
    height: customizer.TopbarHeight,
    width: customizer.isCollapse ? '40px' : '180px',
    overflow: 'hidden',
    display: 'block',
  }));

  if (customizer.activeDir === 'ltr') {
    return (
      <LinkStyled to="/">
        {customizer.activeMode === 'dark' ? (
          <img src={LogoLightPng} alt="Logo" height={customizer.TopbarHeight} />
        ) : (
          <img src={LogoDarkPng} alt="Logo" height={customizer.TopbarHeight} />
        )}
      </LinkStyled>
    );
  }

  return (
    <LinkStyled to="/">
      {customizer.activeMode === 'dark' ? (
        <img src={LogoDarkRTLPng} alt="Logo" height={customizer.TopbarHeight} />
      ) : (
        <img src={LogoLightRTLPng} alt="Logo" height={customizer.TopbarHeight} />
      )}
    </LinkStyled>
  );
};

export default Logo;
