import { Router } from 'express';
import passport from "passport";
import { body } from 'express-validator';
import * as loginController from './controllers/login.controller'
import * as resetController from './controllers/login.reset.controller'

const router = Router();

router.post('/login',
    body('usuario').not().isEmpty().withMessage('No puede ser vacío').trim().escape(),
    body('password').not().isEmpty().withMessage('No puede ser vacío').trim().escape(),
    loginController.login
);

router.post('/logoutAll', passport.authenticate("jwt", { session: false }), loginController.logoutAll);

router.post('/reset',
    body('usuario').not().isEmpty().withMessage(' o correo no puede ser vacío').trim().escape(),
    resetController.reset
);

router.post('/resetValid',
    body('usuario').not().isEmpty().withMessage(' o correo no puede ser vacío').trim().escape(),
    body('pin').not().isEmpty().withMessage('No puede ser vacío').isLength({ min: 9, max: 9 }).withMessage('Deben ser 9 digitos').isNumeric().withMessage('Solo puede ser númerico').trim().escape(),
    resetController.resetValid
);

router.post('/resetValidChange',
    body('password').not().isEmpty().withMessage('No puede ser vacío').trim().escape(),
    body('usuario').not().isEmpty().withMessage(' o correo no puede ser vacío').trim().escape(),
    body('pin').not().isEmpty().withMessage('No puede ser vacío').isLength({ min: 9, max: 9 }).withMessage('Deben ser 9 digitos').isNumeric().withMessage('Solo puede ser númerico').trim().escape(),
    resetController.resetValidChange
);



/*
router.post('/signup', [passport.authenticate("jwt", { session: false }), verifyAccess({
    modulo: 'users',
    permisos: ['crear']
})], loginController.signup);
*/


export default router;