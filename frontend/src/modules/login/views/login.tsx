import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

import { bs_inputShowValue, bs_inputChangeData, bs_isSetNoEmpty, bs_updateErrorsForm } from '../../../utils/general';
import fetchServer from '../../../utils/fetchServer';
import { loginReducer } from '../reducers/loginSlice';
import { AppState } from '../../../store/Store';



import { Grid, Box, Stack, Typography, LinearProgress, Button } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import img1 from 'src/assets/images/backgrounds/login_background.jpg';
import Logo from 'src/layouts/full/shared/logo/Logo';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import AlertDialog from '../../../components/shared/AlertDialog'

export default function Login() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((state: AppState) => state.loginReducer.token);

  const [isLoading, setIsLoading] = useState(false);
  const [oAlertDialog, setOAlertDialog] = useState({
    title: '',
    content: '',
    open: false,
    tipo: 'info',
    onCallback: () => { console.log(); }
  });


  const [dataForm, setDataForm] = useState({
    usuario: { val: '', err: '' },
    pass: { val: '', err: '' },
  });

  const schema = Yup.object().shape({
    //usuario: Yup.string().email('Ingrese un formato de correo válido').required('El usuario es necesario'),
    usuario: Yup.string().required('El usuario es necesario'),
    pass: Yup.string().required('La contraseña es necesaria'),
  });

  function onChangeInput(val: string, path = '') {
    const objDatToChange = (path === '') ? val : bs_inputChangeData(val, JSON.parse(JSON.stringify(dataForm)), path.split('.'));
    const hasError = Object.values(objDatToChange).some((field: any) => field.err !== '');
    if (hasError) {
      const data = bs_updateErrorsForm(objDatToChange, schema);
      setDataForm(data?.dataR);
    } else {
      setDataForm(objDatToChange);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const data = bs_updateErrorsForm(JSON.parse(JSON.stringify(dataForm)), schema);
    if (data?.error) {
      setDataForm(data.dataR);

      return;
    }

    setIsLoading(true);
    const dataSend = {
      usuario: dataForm.usuario.val,
      password: dataForm.pass.val,
    };
    await fetchServer.call('auth/login', 'POST', dataSend).then(data => {
      if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al buscar el usuario')); }
      dispatch(loginReducer({
        nombre: data.data.nombre,
        email: data.data.correo,
        token: data.data.token,
      }));
      navigate('/home');
    }).catch(error => {
      const msgError = fetchServer.getErrorMessage(error, 'Error al buscar el usuario');
      setOAlertDialog((prevState) => ({
        ...prevState,
        title: 'Acceso al sistema',
        content: msgError,
        open: true,
        tipo: 'error',
        onCallback: () => { console.log(); }
      }));
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (token) {
      navigate('/home');
    }
  }, [token]);

  return (
    <PageContainer title="Acceso" description="Acceso a sistema">
      

      <Box p={4}>
            <form onSubmit={handleLogin}>
              <Box px={3} mb={3} style={{ textAlign: 'center', minWidth: '300px' }} >
                <Logo />
              </Box>
              <Typography fontWeight="700" variant="h3" mb={1}>
                Sistema
              </Typography>
              {isLoading && <LinearProgress />}

              <Stack mt={3} my={3}>

                <Box>
                  <CustomFormLabel htmlFor="username">Correo</CustomFormLabel>
                  <CustomTextField
                    fullWidth
                    id="username"
                    name="username"
                    value={bs_inputShowValue('usuario.val', dataForm)}
                    onChange={(event: any) => onChangeInput(event.target.value, 'usuario.val')}
                    InputProps={{
                      readOnly: isLoading,
                    }}
                    disabled={isLoading}
                    error={bs_isSetNoEmpty(bs_inputShowValue('usuario.err', dataForm))}
                    helperText={bs_inputShowValue('usuario.err', dataForm)}
                  />
                </Box>
                <Box>
                  <CustomFormLabel htmlFor="password">Contraseña</CustomFormLabel>
                  <CustomTextField
                    fullWidth
                    id="password"
                    name="password"
                    type="password"
                    value={bs_inputShowValue('pass.val', dataForm)}
                    onChange={(event: any) => onChangeInput(event.target.value, 'pass.val')}
                    InputProps={{
                      readOnly: isLoading,
                    }}
                    disabled={isLoading}
                    error={bs_isSetNoEmpty(bs_inputShowValue('pass.err', dataForm))}
                    helperText={bs_inputShowValue('pass.err', dataForm)}
                  />
                </Box>

              </Stack>
              <Box>
                <Button
                  color="primary"
                  variant="contained"
                  size="large"
                  fullWidth
                  type="submit"
                  disabled={isLoading}
                >
                  Ingresar
                </Button>
              </Box>
            </form>
          </Box>      

      {oAlertDialog.open ? (
        <AlertDialog title={oAlertDialog.title} tipo={oAlertDialog.tipo} content={oAlertDialog.content} onClose={(status = false) => { setOAlertDialog((prevState) => ({ ...prevState, open: false, })); if (status) { oAlertDialog.onCallback(); } }} />
      ) : <></>}

    </PageContainer>
  );

};