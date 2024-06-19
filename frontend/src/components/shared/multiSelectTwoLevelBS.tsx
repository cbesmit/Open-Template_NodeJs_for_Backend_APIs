import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { bs_inputShowValue, bs_inputChangeData, bs_isSetNoEmpty, bs_updateErrorsForm } from '../../utils/general';

import { Tooltip, IconButton, Grid, Paper, Typography } from '@mui/material';

import CustomFormLabel from "../forms/theme-elements/CustomFormLabel";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import CustomTextField from "../forms/theme-elements/CustomTextField";
import { IconX } from '@tabler/icons';

import { v4 as uuidv4 } from 'uuid';

/*
slcForSelectList[
    {
        id: '1',
        label: 'Opción 1'
        checked: false,
        childrens: [
            {
                id: '1.1',
                label: 'Opción 1.1'
                checked: false
            }
        ]
    }
]

*/

interface MultiSelectTwoLevelBSProps {
    title: string;
    placeholder: string;
    nameLabel: string;
    titleChild: string;
    placeholderChild: string;
    nameLabelChild: string;
    isEditing?: boolean;
    isLoading?: boolean;
    slcForSelectList: any[];
    onChangeSelectedList: (val: any) => void;   
}

export type MultiSelectTwoLevelBSRef = {
    clearSelectedList: () => void;
};

const MultiSelectTwoLevelBS = forwardRef<MultiSelectTwoLevelBSRef, MultiSelectTwoLevelBSProps >(({
    title = '',
    placeholder = '',
    nameLabel = '',
    titleChild = '',
    placeholderChild = '',
    nameLabelChild = '',
    isEditing = false,
    isLoading = false,
    slcForSelectList = [],
    onChangeSelectedList = (val: any) => { console.log(); },
}, ref) => {

    const [selectedList, setSelectedList] = useState<any[]>([]);
    const [searchList, setSearchList] = useState(null);  
    const idInput = uuidv4();


    const [selectedListChild, setSelectedListChild] = useState<any[]>([]);
    const [searchListChild, setSearchListChild] = useState(null);  
    const idInputChild = uuidv4();


    React.useEffect(() => {
        let tmpSelectedList = JSON.parse(JSON.stringify(selectedList));
        tmpSelectedList = tmpSelectedList.map((elemento: any) => {
            const tmpSelectedListChild = JSON.parse(JSON.stringify(selectedListChild));
            const oFound = tmpSelectedListChild.find((item: any) => item.idParent === elemento.id);
            elemento.childrens = [];
            if(oFound) {
                elemento.childrens = oFound.childrens;            
            }
            return elemento;
        });
        onChangeSelectedList(tmpSelectedList);
    }, [selectedListChild, selectedList]);

    React.useEffect(() => {
        if(slcForSelectList.length > 0) {
            const tmpSlcForSelectList = JSON.parse(JSON.stringify(slcForSelectList));
            let list:any = [];
            const listChildrens:any = [];

            list = tmpSlcForSelectList.filter((elemento: any) => {
                return elemento.checked;
            });
            list = list.map((elemento: any) => {
                if (elemento.childrens) {
                    elemento.childrens = elemento.childrens.filter((child: any) => {
                        return child.checked;
                    });
                    listChildrens.push({
                        idParent: elemento.id,
                        childrens: elemento.childrens
                    });
                }
                return elemento;
            });

            setSelectedList(prevState => {
                return list;
            });
            setSelectedListChild(prevState => {
                return listChildrens;
            });
        }
    }, [slcForSelectList]);

    useImperativeHandle(ref, () => ({
        clearSelectedList: () => {
            setSelectedList([]);
            setSelectedListChild([]);
        }
    }));

    return (
        <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} lg={12} sm={12} alignItems="stretch">
            <CustomFormLabel>{title}</CustomFormLabel>

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {isEditing &&
                                    <Autocomplete
                                        options={
                                            slcForSelectList.filter((elemento: any) => {
                                                return !selectedList.find((item: any) => item.id === elemento.id);
                                            })
                                        }
                                        id={idInput}
                                        value={searchList}
                                        onChange={(event: any, newValue: any | null) => {
                                            if (bs_isSetNoEmpty(newValue?.id)) {
                                                const list = JSON.parse(JSON.stringify(selectedList));
                                                const oFound = list.find((elemento: any) => elemento.id === newValue.id);
                                                if (!oFound) {
                                                    const items = JSON.parse(JSON.stringify(slcForSelectList));
                                                    const oFound = items.find((elemento: any) => elemento.id === newValue.id);
                                                    list.push(oFound);
                                                    setSelectedList(list);
                                                }
                                            }
                                            setSearchList(null);
                                            const elementInput = document.getElementById(idInput) as HTMLInputElement;
                                            if (elementInput) {
                                                elementInput.value = '';
                                                elementInput.blur();
                                            }
                                        }}
                                        disabled={isLoading || slcForSelectList.length == 0 || !isEditing}
                                        fullWidth
                                        renderInput={(params) => (
                                            <CustomTextField
                                                {...params}
                                                placeholder={placeholder}
                                                aria-label={placeholder}
                                                label={placeholder}
                                            />
                                        )}
                                    />
                                }
                                {!isEditing && <><b>{nameLabel}</b></>}</TableCell>
                            {isEditing && <TableCell align="right" style={{ width: '10%' }}><b>Acciones</b></TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedList.map((row: any, index: number) => (
                            <TableRow
                                key={idInput +"-parent-"+row.id}
                            >
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2" component="p">
                                        <b>{row.label}</b>
                                    </Typography>


            <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 3,marginLeft: 5 }}>
                <b>{titleChild}</b>
                <Table size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {isEditing &&
                                    <Autocomplete
                                    options={(function() {
                                            const oFoundList = slcForSelectList.find((elemento: any) => {
                                                return elemento.id === row.id;
                                            });
                                            if(!oFoundList.childrens){
                                                return [];
                                            }

                                            return oFoundList.childrens?.filter((child: any) => {
                                                const oFound = selectedListChild.find((item: any) => item.idParent === row.id);
                                                if(!oFound) return true;
                                                return !oFound.childrens?.find((item: any) => item.id === child.id);
                                            });
                                    })()}
                                    id={idInputChild}
                                        value={searchListChild}
                                        onChange={(event: any, newValue: any | null) => {
                                            if (bs_isSetNoEmpty(newValue?.id)) {
                                                const listChild = JSON.parse(JSON.stringify(selectedListChild));
                                                let oFoundListChild = listChild.find((item: any) => item.idParent === row.id);
                                                if(!oFoundListChild) {
                                                    listChild.push({
                                                        idParent: row.id,
                                                        childrens: []
                                                    });
                                                    oFoundListChild = listChild.find((item: any) => item.idParent === row.id);
                                                }
                                                const oFoundCheck = oFoundListChild.childrens?.find((elemento: any) => elemento.id === newValue.id);
                                                if(!oFoundCheck){
                                                    if(!oFoundListChild.childrens) oFoundListChild.childrens = [];
                                                    oFoundListChild.childrens.push(newValue);
                                                    setSelectedListChild(listChild);
                                                }

                                            }
                                            setSearchListChild(null);
                                            const elementInput = document.getElementById(idInputChild) as HTMLInputElement;
                                            if (elementInput) {
                                                elementInput.value = '';
                                                elementInput.blur();
                                            }
                                        }}
                                        disabled={isLoading || slcForSelectList.length == 0 || !isEditing}
                                        fullWidth
                                        renderInput={(params) => (
                                            <CustomTextField
                                                {...params}
                                                placeholder={placeholderChild}
                                                aria-label={placeholderChild}
                                                label={placeholderChild}
                                            />
                                        )}
                                    />
                                }
                                {!isEditing && <><b>{nameLabelChild}</b></>}</TableCell>
                            {isEditing && <TableCell align="right" style={{ width: '10%' }}><b>Acciones</b></TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        
                        
                        {selectedListChild.find((item: any) => item.idParent === row.id) && selectedListChild.find((item: any) => item.idParent === row.id).childrens.map((rowChild: any, index: number) => (
                            <TableRow
                                key={idInputChild +"-child-"+rowChild.id}
                            >
                                <TableCell component="th" scope="row">
                                    {rowChild.label}
                                </TableCell>
                                {isEditing &&
                                    <TableCell align="right" style={{ width: '10%' }}>
                                        <Tooltip title="Eliminar" arrow>
                                            <IconButton
                                                onClick={() => {
                                                    const listChild = JSON.parse(JSON.stringify(selectedListChild));
                                                    const oFoundListChild = listChild.find((item: any) => item.idParent === row.id);
                                                    const idx = oFoundListChild.childrens.findIndex((elemento: any) => elemento.id === rowChild.id);
                                                    oFoundListChild.childrens.splice(idx, 1);
                                                    setSelectedListChild(listChild);
                                                }}
                                            >
                                                <IconX />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


                                </TableCell>
                                {isEditing &&
                                    <TableCell align="right" style={{ width: '10%' }}>
                                        <Tooltip title="Eliminar" arrow>
                                            <IconButton
                                                onClick={() => {
                                                    const listChild = JSON.parse(JSON.stringify(selectedListChild));
                                                    const idx = listChild.findIndex((elemento: any) => elemento.idParent === row.id);
                                                    listChild.splice(idx, 1);
                                                    setSelectedListChild(listChild);

                                                    const list = JSON.parse(JSON.stringify(selectedList));
                                                    list.splice(index, 1);
                                                    setSelectedList(list);
                                                }}
                                            >
                                                <IconX />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                }
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>

        </Grid>
    );
});

export default MultiSelectTwoLevelBS;
