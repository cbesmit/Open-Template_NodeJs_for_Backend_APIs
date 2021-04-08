import { Router } from 'express';
import passport from "passport";
import { verifyAccess } from '../../app/role.middleware'
import * as authController from './controllers/auth.controller'

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/logoutAll', passport.authenticate("jwt", { session: false }), authController.logoutAll);
/*
router.post('/logout', [passport.authenticate("jwt", { session: false }), verifyAccess({
    modulo: 'rol',
    permisos: ['editar', 'crear']
})], authController.logout);
*/
export default router;