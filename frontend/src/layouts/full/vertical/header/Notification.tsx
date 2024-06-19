import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Button,
  Chip,
  Stack
} from '@mui/material';
import fetchServer from '../../../../utils/fetchServer';
import { logoutReducer } from '../../../../modules/login/reducers/loginSlice';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';

import { IconBellRinging } from '@tabler/icons';
import { Link, useNavigate } from 'react-router-dom';
import { IconBellRinging2 } from '@tabler/icons';

const Notifications = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsDot, setNotificationsDot] = useState(false);
  const [notificationsNew, setNotificationsNew] = useState(0);

  const [anchorEl2, setAnchorEl2] = useState(null);

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  function loadNotificaciones () {
    fetchServer.call('notificaciones/list?limit=6&createdAt[sort]=desc', 'GET').then(data => {
      if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al obtener las notificaciones')); }
      const elementosNoVistos = data.data.filter((elemento:any) => elemento.visto === false);
      setNotificationsNew(elementosNoVistos.length);
      setNotificationsDot(elementosNoVistos.length > 0);
      setNotifications(data.data);
    }).catch(error => {
      const msgError = fetchServer.getErrorMessage(error, 'Error al obtener las notificaciones');
      console.log(msgError);
      try {
        const parseError = typeof msgError == 'string' ? JSON.parse(msgError) : {};
        if(parseError.status === 401) {
          dispatch(logoutReducer());
          navigate('/auth/login');
        }          
      } catch (error) {
      }
    });
  };

  useEffect(() => {
    loadNotificaciones();
    //CBSToDo   #TODO: hacer que cada x tiempo este ejecutando la funcion loadNotificaciones, porque ahora si se pone setInterval y cambio de bista en el menú de la izquierda se vuelve a ejecutar
    //setInterval(loadNotificaciones, 10000);
  }, []);

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="Ver notificaciones"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? 'primary.main' : 'text.secondary',
        }}
        onClick={handleClick2}
      >
        {!notificationsDot &&
          <IconBellRinging size="21" stroke="1.5" />
        }
        {notificationsDot &&
        <Badge variant="dot" color="error">
          <IconBellRinging size="21" stroke="2" />
        </Badge>  
        }
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
          },
        }}
      >
        <Stack direction="row" py={2} px={4} justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notificaciones</Typography>
          <Chip label={notificationsNew + " nuevas"} color="primary" size="small" />
        </Stack>
        <Scrollbar sx={{ height: '385px' }}>
          {notifications.map((notification, index) => (
            <Box key={index}>
              <MenuItem sx={{ py: 2, px: 4 }} onClick={()=>{ navigate('/notificaciones/ver/' + notification._id); }} selected={!notification.visto}>
                <Stack direction="row" spacing={2}>
                  <IconBellRinging2 size="26"/>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      fontWeight={600}
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {notification.titulo}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: '240px',
                      }}
                      noWrap
                    >
                      {notification.subtitulo}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            </Box>
          ))}
        </Scrollbar>
        <Box p={3} pb={1}>
          <Button to="/notificaciones/listar" variant="outlined" component={Link} color="primary" fullWidth>
            Ver todas las notificaciones
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;
