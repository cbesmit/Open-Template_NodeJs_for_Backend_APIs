import React, { useState, ChangeEvent } from 'react';
import fetchServer from '../../utils/fetchServer';
import { bs_inputShowValue, bs_inputChangeData, bs_isSetNoEmpty, bs_updateErrorsForm } from '../../utils/general';

import { Button, Box, Fab, TextField, InputAdornment, Typography, Divider, Grid, FormControlLabel, FormControl, Paper, LinearProgress, Stack, Avatar, IconButton, Alert } from '@mui/material';
import CustomTextField from "../forms/theme-elements/CustomTextField";
import AlertDialog from './AlertDialog'
import { IconUpload, IconTrash, IconPaperclip, IconDownload, IconDeviceFloppy, IconX, IconArrowForwardUp, IconAlertTriangle } from '@tabler/icons';
import { findIndex } from 'lodash';


interface FileUploaderBSProps {
    seccion: string;
    accion?: { accion: string, callback: (error: any) => void };
    identificador?: string;
    disabledUpload?: boolean;
    disabledDelete?: boolean;
    disabledDownload?: boolean;
    maxSizeMB?: number;
    types?: string;
    maxFiles?: number;
    showButtonSave?: boolean;
    showOnlyIcons?: boolean;
    actualNumberFiles: (val: any) => void;
}

const FileUploaderBS: React.FC<FileUploaderBSProps> = ({
    seccion = '',
    accion = { accion: '', callback: (error: any) => { console.log(); } },
    identificador = '',
    disabledUpload = false,
    disabledDelete = false,
    disabledDownload = false,
    maxSizeMB = 5,
    types = 'jpg,png,jpeg,gif,pdf,doc,docx,xls,xlsx,txt',
    maxFiles = 1,
    showButtonSave = false,
    showOnlyIcons = false,
    actualNumberFiles
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [oAlertDialog, setOAlertDialog] = useState({
        title: '',
        content: '',
        open: false,
        tipo: 'info',
        onCallback: () => { console.log(); }
    });
    const [apiErrros, setApiErrros] = useState<string[]>([]);
    const [execCallback, setExecCallback] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filesUpload, setFilesUpload] = useState<File[]>([]);
    const [filesList, setFilesList] = useState<{ id: string, nombre: string, idOneDrive: string, size: number, forDelete: boolean, error: boolean }[]>([]);

    const uploadButtonClick = () => {
        const fileInput = document.getElementById('inputFileUploaderBSProps') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    };

    const fileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile: any = e.target.files?.[0];
        if (selectedFile) {
            const fileSize = selectedFile.size / 1024 / 1024;
            if (fileSize <= maxSizeMB) {
                const fileExtension = selectedFile.name.split('.').pop();
                const typesArray = types.split(',');
                if (fileExtension && typesArray.some((type: string) => type.toLowerCase() === fileExtension.toLowerCase())) {
                    //console.log('selectedFile', selectedFile);
                    selectedFile.error = false;
                    setFilesUpload([...filesUpload, selectedFile]);
                    setSelectedFile(null);
                } else {
                    setOAlertDialog((prevState) => ({
                        ...prevState,
                        title: 'Adjuntos',
                        content: 'Tipo de archivo no permitido.',
                        open: true,
                        tipo: 'error',
                        onCallback: () => { console.log(); }
                    }));
                }
            } else {
                setOAlertDialog((prevState) => ({
                    ...prevState,
                    title: 'Adjuntos',
                    content: 'El archivo excede el tamaño máximo permitido.',
                    open: true,
                    tipo: 'error',
                    onCallback: () => { console.log(); }
                }));
            }
        }
    };

    const deleteNewFiles = (index: number) => {
        const newFiles = [...filesUpload];
        newFiles.splice(index, 1);
        setFilesUpload(newFiles);
    };

    const deleteListFiles = (id: string) => {
        const newFiles = [...filesList];
        const fileIndex = newFiles.findIndex(a => a.id === id);
        if (fileIndex !== -1) {
            if (newFiles[fileIndex].forDelete && maxFiles <= (filesUpload.length + filesList.filter(a => !a.forDelete).length)) {
                setOAlertDialog((prevState) => ({
                    ...prevState,
                    title: 'Adjuntos',
                    content: 'No se pueden agregar más archivos.',
                    open: true,
                    tipo: 'error',
                    onCallback: () => { console.log(); }
                }));
                return;
            }
            newFiles[fileIndex].forDelete = !newFiles[fileIndex].forDelete;
            setFilesList(newFiles);
        }
    }

    const downloadListFiles = async (id: string) => {
        setIsLoading(true);
        await fetchServer.call('gestorArchivos/download/' + seccion + '/' + id, 'GET').then(data => {
            //console.log('data', data);
            //            data: { base64: base64WithMime, filename: filename, mimeType: mimeType }
            //descargar el archivo

            if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al obtener el archivo')); }


            const a = document.createElement('a');
            a.href = data.data.base64;
            a.download = data.data.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);


        }).catch(error => {
            const msgError = fetchServer.getErrorMessage(error, 'Error al obtener el archivo');
            setOAlertDialog((prevState) => ({
                ...prevState,
                title: 'Adjuntos',
                content: msgError,
                open: true,
                tipo: 'error',
                onCallback: () => { console.log(); }
            }));
        });
        setIsLoading(false);
    }

    const getFilesList = async (isAction = false) => {
        if (!bs_isSetNoEmpty(identificador) || !bs_isSetNoEmpty(seccion)) { return; }
        const errorForSet: Array<any> = [];
        setIsLoading(true);
        await fetchServer.call('gestorArchivos/listar/' + seccion + '/' + identificador, 'GET').then(data => {
            if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al obtener los adjuntos')); }
            //const files = [{ id: '1', nombre: 'archivo1.jpg', size: 1024, idOneDrive:'',forDelete: false },
            setFilesList(data.data);
        }).catch(error => {
            const msgError = fetchServer.getErrorMessage(error, 'Error al obtener los adjuntos');
            errorForSet.push(msgError);
            setFilesList([]);
        });
        setIsLoading(false);
        setApiErrros(prevErrors => errorForSet);
        if (isAction && accion.callback !== undefined) {
            setExecCallback(true);
        }
    }

    const deleteFilesServer = async () => {
        if (!bs_isSetNoEmpty(identificador) || !bs_isSetNoEmpty(seccion)) { return; }
        const files = filesList.filter(a => a.forDelete);
        if (files.length == 0) { return; }
        const newFilesList: any[] = [...filesList];
        newFilesList.map(a => a.error = false)
        for (const item of files) {
            await fetchServer.call('gestorArchivos/borrar/${seccion}/${identificador}/${item.id}', 'DELETE').then(data => {
                if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al borrar el adjunto')); }
                const findIndex = newFilesList.findIndex(b => b.id === item.id);
                if (findIndex !== -1) {
                    newFilesList.splice(findIndex, 1);
                }
            }).catch(error => {
                const findIndex = newFilesList.findIndex(b => b.id === item.id);
                if (findIndex !== -1) {
                    newFilesList[findIndex].error = true;
                }
                const msgError = fetchServer.getErrorMessage(error, 'Error al borrar el adjunto');
                setApiErrros(prevErrors => [...prevErrors, msgError]);
            });
        }
        setFilesList(newFilesList);
    }

    const uploadFilesServer = async () => {
        if (!bs_isSetNoEmpty(identificador) || !bs_isSetNoEmpty(seccion)) { return; }
        if (filesUpload.length == 0) { return; }
        const newFiles: any[] = [...filesUpload];
        newFiles.map(a => a.error = false)
        for (const [index, item] of filesUpload.entries()) {
            const formData = new FormData();
            formData.append('files', item);
            await fetchServer.call('gestorArchivos/upload/' + seccion + '/' + identificador, 'POST', formData).then(data => {
                if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al subir el adjunto')); }
                newFiles.splice(index, 1);
            }).catch(error => {
                newFiles[index].error = true;
                const msgError = fetchServer.getErrorMessage(error, 'Error al subir el adjunto');
                setApiErrros(prevErrors => [...prevErrors, msgError]);
            });
        };
        setFilesUpload(newFiles);
    }

    const modificarArchivos = async (isAction = false) => {
        setIsLoading(true);
        setApiErrros(prevErrors => []);
        if (filesList.filter(a => a.forDelete).length > 0) {
            await deleteFilesServer();
        }
        if (filesUpload.length > 0) {
            await uploadFilesServer();
        }
        setIsLoading(false);
        if (isAction && accion.callback !== undefined) {
            setExecCallback(true);
        }
    }

    /*
    React.useEffect(() => {
        getFilesList();
    }, []);
    */

    React.useEffect(() => {
        if (execCallback) {
            setExecCallback(false);
            accion.callback(apiErrros);
        }
    }, [execCallback]);

    React.useEffect(() => {
        if (accion.accion === 'modificarArchivos') {
            accion.accion = '';
            modificarArchivos(true);
        }
        if (accion.accion === 'getFilesList') {
            accion.accion = '';
            getFilesList(true);
        }
    }, [accion.accion]);

    React.useEffect(() => {
        const numberFiles = filesUpload.length + filesList.filter(a => !a.forDelete).length;
        actualNumberFiles(numberFiles);
    }, [filesUpload, filesList]);

    return (
        <Grid container spacing={1} >
            <Grid item xs={12} lg={12} sm={12} alignItems="stretch">
                {isLoading && <LinearProgress />}
                {(!disabledUpload && maxFiles > (filesUpload.length + filesList.filter(a => !a.forDelete).length)) &&
                    <>
                        <CustomTextField
                            id="inputFileUploaderBSProps"
                            type="file"
                            variant="outlined"
                            fullWidth
                            value={selectedFile?.name || ''}
                            onChange={fileChange}
                            disabled={disabledUpload || isLoading}
                            style={{ display: 'none' }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <Button disabled={isLoading} color="primary" fullWidth startIcon={<IconUpload width={18} />} onClick={uploadButtonClick}> Seleccionar archivo </Button>
                    </>
                }
            </Grid>
            <Grid item xs={12} lg={12} sm={12} alignItems="stretch">

                {filesUpload.map((fileItem: any, index) => {
                    return (

                        <Paper key={index} sx={{ p: 2, mb: 1 }} variant="outlined">
                            <Grid container direction="row" justifyContent="space-between" alignItems="stretch" spacing={2} >
                                <Grid item alignItems="stretch">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: '48px',
                                            height: '48px',
                                            bgcolor: '#6688ea',
                                        }}
                                    >
                                        <IconUpload />
                                    </Avatar>
                                </Grid>
                                {!showOnlyIcons &&
                                    <Grid item xs={7} lg={7} sm={7} alignItems="stretch">
                                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                            {fileItem.error && <IconAlertTriangle style={{ color: 'rgb(236 77 77)' }} />} {fileItem.name}
                                        </Typography>
                                        <Typography variant="body2">{(fileItem.size / 1024 / 1024).toFixed(2)} MB</Typography>

                                    </Grid>
                                }
                                <Grid item alignItems="stretch" >
                                    <IconButton disabled={isLoading} onClick={() => deleteNewFiles(index)}>
                                        <IconTrash stroke={1.5} size="20" />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>
                    );
                })}


                {filesList.filter(file => !file.forDelete).map((fileItem, index) => {
                    return (

                        <Paper key={index} sx={{ p: 2, mb: 1 }} variant="outlined">
                            <Grid container direction="row" justifyContent="space-between" alignItems="stretch" spacing={2} >
                                <Grid item alignItems="stretch">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: '48px',
                                            height: '48px',
                                            bgcolor: '#5c5c5c',
                                        }}
                                    >
                                        <IconPaperclip />
                                    </Avatar>
                                </Grid>
                                {!showOnlyIcons &&
                                    <Grid item xs={7} lg={7} sm={7} alignItems="stretch">

                                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                            {fileItem.nombre}
                                        </Typography>
                                        <Typography variant="body2">{(fileItem.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                    </Grid>
                                }
                                <Grid item alignItems="stretch" >
                                    {!disabledDelete &&
                                        <IconButton disabled={isLoading} onClick={() => deleteListFiles(fileItem.id)}>
                                            <IconTrash stroke={1.5} size="20" />
                                        </IconButton>
                                    }
                                    {!disabledDownload &&
                                        <IconButton disabled={isLoading} onClick={() => downloadListFiles(fileItem.idOneDrive)}>
                                            <IconDownload stroke={1.5} size="20" />
                                        </IconButton>
                                    }
                                </Grid>
                            </Grid>
                        </Paper>
                    );
                })}

                {filesList.filter(file => file.forDelete).map((fileitem, index) => {
                    return (

                        <Paper key={index} sx={{ p: 2, mb: 1 }} variant="outlined">
                            <Grid container direction="row" justifyContent="space-between" alignItems="stretch" spacing={2} >
                                <Grid item alignItems="stretch">
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: '48px',
                                            height: '48px',
                                            bgcolor: '#ea8666',
                                        }}
                                    >
                                        <IconX />
                                    </Avatar>
                                </Grid>
                                {!showOnlyIcons &&
                                    <Grid item xs={7} lg={7} sm={7} alignItems="stretch">

                                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                            {fileitem.nombre}
                                        </Typography>
                                        <Typography variant="body2">{(fileitem.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                    </Grid>
                                }
                                <Grid item alignItems="stretch" >
                                    {!disabledDelete && maxFiles > (filesUpload.length + filesList.filter(a => !a.forDelete).length) &&
                                        <IconButton disabled={isLoading} onClick={() => deleteListFiles(fileitem.id)}>
                                            <IconArrowForwardUp stroke={1.5} size="20" />
                                        </IconButton>
                                    }
                                    {!disabledDownload &&
                                        <IconButton disabled={isLoading} onClick={() => downloadListFiles(fileitem.idOneDrive)}>
                                            <IconDownload stroke={1.5} size="20" />
                                        </IconButton>
                                    }
                                </Grid>
                            </Grid>
                        </Paper>
                    );
                })}

            </Grid>
            {!disabledUpload && maxFiles > 0 && maxSizeMB > 0 &&
                <Grid item xs={12} lg={12} sm={12} alignItems="stretch">
                    <Typography variant="body2">
                        Máximo {(filesUpload.length + filesList.filter(a => !a.forDelete).length)} de {maxFiles} archivos de {maxSizeMB} MB<br />
                        Tipos permitidos: {types}
                    </Typography>
                </Grid>
            }
            {apiErrros.length > 0 &&
                <Grid item xs={12} lg={12} sm={12} alignItems="stretch">
                    {apiErrros.map((a, index) => {
                        return (
                            <Alert key={index} sx={{ mb: 1 }} severity="error">{a}</Alert>
                        );
                    })
                    }
                </Grid>
            }

            {showButtonSave &&
                <Grid item xs={12} lg={12} sm={12} alignItems="stretch">
                    <Button disabled={isLoading} color="primary" startIcon={<IconDeviceFloppy width={18} />} onClick={() => { modificarArchivos() }}> Modificar Archivos </Button>
                </Grid>
            }

            {oAlertDialog.open ? (
                <AlertDialog title={oAlertDialog.title} tipo={oAlertDialog.tipo} content={oAlertDialog.content} onClose={(status = false) => { setOAlertDialog((prevState) => ({ ...prevState, open: false, })); if (status) { oAlertDialog.onCallback(); } }} />
            ) : <></>}

        </Grid>
    );
};

export default FileUploaderBS;
