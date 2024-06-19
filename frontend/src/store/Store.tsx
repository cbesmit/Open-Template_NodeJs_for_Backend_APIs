import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
  TypedUseSelectorHook,
} from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

//Reductores
import CustomizerReducer from './customizer/CustomizerSlice';
import LoginReducer from '../modules/login/reducers/loginSlice'

export const store = configureStore({
  reducer: {
    customizer: persistReducer  <any, any> (
      {
        key: 'customizer', 
        storage, 
      },
      CustomizerReducer
    ),
    loginReducer: persistReducer <any, any> (
      {
        key: 'loginReducer', 
        storage, 
      },
      LoginReducer
    ),
    //usuariosReducer: UsuariosReducer,


    

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),  
});

const rootReducer = combineReducers({
  customizer: CustomizerReducer,
  loginReducer: LoginReducer,
  //usuariosReducer: UsuariosReducer,

  
});


export type AppDispatch = typeof store.dispatch;
export const { dispatch } = store;
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<AppState> = useAppSelector;

export const persistor = persistStore(store);
export type AppState = ReturnType<typeof rootReducer>;
export default store;
