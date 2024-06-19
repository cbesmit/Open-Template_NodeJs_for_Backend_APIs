import { Box, Typography, useMediaQuery } from '@mui/material';
import { useSelector } from 'src/store/Store';
import { AppState } from 'src/store/Store';

const SySVersion = () => {
    const customizer = useSelector((state: AppState) => state.customizer);
    const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
    const hideMenu = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';

    return (
        <Box
            display={'flex'}
            alignItems="center"
            gap={2}
            sx={{ m: 2, p: 1, bgcolor: `${'secondary.light'}` }}
        >
            {!hideMenu ? (
                <>
                    <Box>
                        <Typography variant="h5">Sistema</Typography>
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: 'right' }}>
                        <Typography variant="caption">v.1.1710.23</Typography>
                    </Box>
                </>
            ) : (
                ''
            )}
        </Box>
    );
};

export default SySVersion;