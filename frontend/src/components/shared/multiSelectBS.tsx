import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { bs_inputShowValue, bs_inputChangeData, bs_isSetNoEmpty, bs_updateErrorsForm } from '../../utils/general';

import { Tooltip, IconButton, Grid, Paper } from '@mui/material';

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
        checked: false
    }
]

*/

interface MultiSelectBSProps {
    title: string;
    placeholder: string;
    nameLabel: string;
    isEditing?: boolean;
    isLoading?: boolean;
    slcForSelectList: any[];
    onChangeSelectedList: (val: any) => void;   
}

export type MultiSelectBSRef = {
    clearSelectedList: () => void;
};


const MultiSelectBS = forwardRef<MultiSelectBSRef, MultiSelectBSProps >(({
    title = '',
    placeholder = '',
    nameLabel = '',
    isEditing = false,
    isLoading = false,
    slcForSelectList = [],
    onChangeSelectedList = (val: any) => { console.log(); },
}, ref) => {

    const [selectedList, setSelectedList] = useState<any[]>([]);
    const [searchList, setSearchList] = useState(null);

    const idInput = uuidv4();

    React.useEffect(() => {
        onChangeSelectedList(selectedList);
    }, [selectedList]);

    React.useEffect(() => {
        if(slcForSelectList.length > 0) {
            setSelectedList(slcForSelectList.filter((elemento: any) => {
                return elemento.checked;
            }));
        }
    }, [slcForSelectList]);

    useImperativeHandle(ref, () => ({
        clearSelectedList: () => setSelectedList([])
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
                                key={idInput +"-selected-"+row.id}
                            >
                                <TableCell component="th" scope="row">
                                    {row.label}
                                </TableCell>
                                {isEditing &&
                                    <TableCell align="right" style={{ width: '10%' }}>
                                        <Tooltip title="Eliminar" arrow>
                                            <IconButton
                                                onClick={() => {
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

export default MultiSelectBS;
