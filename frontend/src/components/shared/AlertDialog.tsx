import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons';
//tipo = 'info' | 'confirm' | 'error'
const AlertDialog = (props: any) => {
    const { onClose, title, content, tipo = 'info' } = props;
    const [openDialog, setOpenDialog] = React.useState(false);

    const handleClickOpen = () => {
        setOpenDialog(true);
    };

    const handleClose = (status = false) => {
        setOpenDialog(false);
        onClose(status);
    };

    useEffect(() => {
        handleClickOpen();
    }, []);

    const iconAlertStyle = {
        color: 'rgb(255 5 5 / 64%)',
        marginRight: '8px',
        fontSize: '2rem',
        verticalAlign: 'middle',
    };

    const iconConfirmStyle = {
        color: 'rgb(255 123 5 / 78%)',
        marginRight: '8px',
        fontSize: '2rem',
        verticalAlign: 'middle',
    };

    const iconInfoStyle = {
        color: 'rgb(5 134 255 / 78%)',
        marginRight: '8px',
        fontSize: '2rem',
        verticalAlign: 'middle',
    };

    return (
        <>
            <Dialog fullWidth={true} maxWidth="xs"
                open={openDialog}
                onClose={() => { handleClose(false); }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle>
                    {tipo === 'info' && <IconCircleCheck style={iconInfoStyle} />}
                    {tipo === 'error' && <IconAlertTriangle style={iconAlertStyle} />}
                    {tipo === 'confirm' && <HelpIcon style={iconConfirmStyle} />}
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {tipo === 'info' && <Button color="primary" variant="contained" onClick={() => { handleClose(true); }}>Aceptar</Button>}
                    {tipo === 'error' && <Button color="error" variant="contained" onClick={() => { handleClose(false); }}>Cerrar</Button>}
                    {tipo === 'confirm' && 
                    <>
                        <Button color="error" variant="contained" onClick={() => { handleClose(false); }}>Cancelar</Button>                 
                        <Button color="primary" variant="contained" onClick={() => { handleClose(true); }}>Confirmar</Button>
                    </>
                    }
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AlertDialog;
