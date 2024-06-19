import { createSlice } from '@reduxjs/toolkit';

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    nombre: '',
    email: '',
    token: '',
  },
  reducers: {
    loginReducer: (state, action) => {
      if (action.payload.nombre) state.nombre = action.payload.nombre;
      if (action.payload.email) state.email = action.payload.email;
      if (action.payload.token) state.token = action.payload.token;
    },
    logoutReducer: state => {
      state.nombre = '';
      state.email = '';
      state.token = '';
    },
  },
});

export const { loginReducer, logoutReducer } = loginSlice.actions;
export default loginSlice.reducer;
