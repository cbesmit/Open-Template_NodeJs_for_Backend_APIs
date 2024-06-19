import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchServer from '../../utils/fetchServer';
import { bs_inputShowValue, bs_inputChangeData, bs_isSetNoEmpty, bs_updateErrorsForm } from '../../utils/general';

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Grid, Toolbar, Typography, Paper, Checkbox, IconButton, Chip, Tooltip, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';

import CustomTextField from "../forms/theme-elements/CustomTextField";
import AlertDialog from './AlertDialog'
import { IconUpload, IconTrash, IconPaperclip, IconDownload, IconDeviceFloppy, IconX, IconArrowForwardUp, IconAlertTriangle } from '@tabler/icons';
import { findIndex } from 'lodash';
import { parse } from 'path';

import { IconArrowUp, IconArrowDown, IconArrowsSort, IconSearch, IconRefresh } from '@tabler/icons';
import ClearIcon from '@mui/icons-material/Clear';

import { alpha } from '@mui/material/styles';


const ShowSearchInputRow = React.memo((props: any) => {
    const { id, listHeadSearch, dataListBody, onSearch, showSearchValue } = props;
    const head = listHeadSearch.find((item: any) => item.id == id);
    let uniqStatusList: any[] = [];
    switch (head.type) {
        case 'date':
            return (
                <CustomTextField
                    label={head.label}
                    variant="standard"
                    size="small"
                    fullWidth
                    type="date"
                    onChange={(e: any) => {
                        onSearch(e.target.value, head.type, head.id);
                    }}
                    value={showSearchValue(head.id)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => {
                                    onSearch('', head.type, head.id);
                                }}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            );
        case 'select':
            uniqStatusList = [];
            for (const body of dataListBody) {
                if (!uniqStatusList.includes(body[head.id])) {
                    uniqStatusList.push(body[head.id]);
                }
            }
            return (
                <FormControl variant="standard" sx={{ minWidth: '100%' }}>
                    <InputLabel id={head.id}>{head.label}</InputLabel>
                    <Select
                        labelId={head.id}
                        label={head.label}
                        onChange={(e: any) => {
                            onSearch(e.target.value, head.type, head.id);
                        }}
                        value={showSearchValue(head.id)}
                    >
                        <MenuItem value="">Todo</MenuItem>
                        {uniqStatusList.map((item: any) => (
                            <MenuItem key={'input-select-' + item} value={item}>{item}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        case 'active':
            uniqStatusList = ['Activo', 'Inactivo'];
            return (
                <FormControl variant="standard" sx={{ minWidth: '100%' }}>
                    <InputLabel id={head.id}>{head.label}</InputLabel>
                    <Select
                        labelId={head.id}
                        label={head.label}
                        onChange={(e: any) => {
                            onSearch(e.target.value, head.type, head.id);
                        }}
                        value={showSearchValue(head.id)}
                    >
                        <MenuItem value="">Todo</MenuItem>
                        {uniqStatusList.map((item: any) => (
                            <MenuItem key={'input-select-' + item} value={item}>{item}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );

        case 'currency':
        case 'float':
        case 'number':
            return (
                <CustomTextField
                    label={head.label}
                    variant="standard"
                    size="small"
                    fullWidth
                    type="number"
                    onChange={(e: any) => {
                        onSearch(e.target.value, head.type, head.id);
                    }}
                    value={showSearchValue(head.id)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => {
                                    onSearch('', head.type, head.id);
                                }}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            );

        default:
            //sirve para type text
            return (
                <CustomTextField
                    label={head.label}
                    variant="standard"
                    size="small"
                    fullWidth
                    type="text"
                    onChange={(e: any) => {
                        onSearch(e.target.value, head.type, head.id);
                    }}
                    value={showSearchValue(head.id)}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => {
                                    onSearch('', head.type, head.id);
                                }}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            );

    }
});


interface TableListBSProps {
    headTitle?: string;
    dataListHead: any[];
    dataListBody: any[];
    urlDetail: string;
    disabledDetail?: boolean;
    isLoading?: boolean;
    refreshFunction?: () => void;
}

const TableListBS: React.FC<TableListBSProps> = ({
    headTitle = '',
    dataListHead = [],
    dataListBody = [],
    urlDetail = '',
    disabledDetail = false,
    isLoading = false,
    refreshFunction,
}) => {
    const [oAlertDialog, setOAlertDialog] = useState({
        title: '',
        content: '',
        open: false,
        tipo: 'info',
        onCallback: () => { console.log(); }
    });
    const navigate = useNavigate();

    const [listBody, setListBody] = useState<any[]>([]);
    const [listHead, setListHead] = useState<any[]>([]);
    const [listHeadSearch, setListHeadSearch] = useState<any[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const [page, setPage] = React.useState(0);

    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        if (dataListBody.length > 0 && dataListHead.length > 0) {
            //setListBody(JSON.parse(JSON.stringify(dataListBody)));
            setListBody([...dataListBody]);
            const head: any[] = [];

            for (const item of dataListHead) {
                head.push({
                    ...item,
                    sort: false,
                    sortType: 'asc',
                    canSort: typeof item.canSort == 'boolean' ? item.canSort : true,
                    canSearch: typeof item.canSearch == 'boolean' ? item.canSort : true,
                });

            }
            if (!disabledDetail) {
                head.push({
                    id: 'actions',
                    label: '',
                    type: 'actionsDetail',
                    sort: false,
                    sortType: 'asc',
                    canSort: false,
                    canSearch: false,
                    search: ''
                });
            }
            setListHead(JSON.parse(JSON.stringify(head)));
            setListHeadSearch(JSON.parse(JSON.stringify(head)));
        } else {
            setListBody([]);
            setListHead([]);
            setListHeadSearch([]);
        }
    }, [dataListBody]);

    const showDataRow = (row: any, id: string) => {
        //        console.log('row', row);
        const val = row[id];
        const head = listHead.find(item => item.id == id);
        switch (head.type) {
            case 'date':
                if (!val) return '';
                const valDate = val.replace(/T/g, ' ').replace(/Z/g, '');
                const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
                const fecha = new Date(valDate);
                return fecha.toLocaleDateString("es-MX", options);
            case 'text':
                return val;
            case 'float':
                if (!val) return '';
                return parseFloat(val);
            case 'number':
                if (!val) return '';
                return parseInt(val);
            case 'currency':
                if (!val) return '';
                return val.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
            case 'active':
                if (typeof val != 'boolean') return '';
                return (
                    <>
                        {val && <Chip label="Activo" color="primary" />}
                        {!val && <Chip label="Inactivo" color="error" />}
                    </>
                );
            case 'select':
                if (!val) return '';
                //      'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning',
                const colorChip: any = {
                    'completado': 'success',
                    'aprobado': 'primary',
                    'aplicado': 'primary',
                    'rechazado': 'error',
                    'cancelado': 'error',

                    'accion': 'primary',
                    'error': 'error',
                    'evento': 'warning',

                };

                return (<Chip label={val.replace(/^\w/, (c: string) => c.toUpperCase())} color={colorChip[val.toLowerCase()] ? colorChip[val.toLowerCase()] : 'default'} />);
            case 'actions':
                return (
                    <Box>
                        <IconButton
                            onClick={() => {
                                val(row._id);
                            }}
                            aria-label="delete"
                            size="large"
                            disabled={isLoading}
                        >
                            <ListAltIcon />
                        </IconButton>
                    </Box>
                );
            case 'actionsDetail':
                return (
                    <Box>
                        <IconButton
                            onClick={() => {
                                navigate(urlDetail + row._id);
                            }}
                            aria-label="delete"
                            size="large"
                            disabled={isLoading}
                        >
                            <ListAltIcon />
                        </IconButton>
                    </Box>
                );
            default:
                return val;
        }
    };

    const btnSort = (id: string) => {
        const index = findIndex(listHead, { id });
        if (index > -1) {
            const head = listHead[index];
            if (head.canSort) {
                if (!head.sort) {
                    return (
                        <IconArrowsSort color="#ddd" onClick={() => { onSort(id); }} />
                    );
                }
                if (head.sortType == 'asc') {
                    return (
                        <IconArrowDown color="#5D87FF" onClick={() => { onSort(id); }} />
                    );
                }
                if (head.sortType == 'desc') {
                    return (
                        <IconArrowUp color="#5Daa87" onClick={() => { onSort(id); }} />
                    );
                }
            }
        } else {
            return undefined;
        }
    };

    const onSort = (id: string) => {
        const index = findIndex(listHead, { id });
        if (index > -1) {
            const head = JSON.parse(JSON.stringify(listHead));
            head.map((item: any) => {
                if (item.id != id) {
                    item.sort = false;
                }
            });
            head[index].sortType = head[index].sortType == 'asc' ? 'desc' : 'asc';
            head[index].sort = true;
            setListHead(head);
            onSortListBody(id, head[index].sortType);
        }
    };

    function extractdNumbersFromString(str: string) {
        const numberPattern = /\d+/g;
        const numbers = str.match(numberPattern);
        return numbers ? parseInt(numbers.join(''), 10) : NaN;
    };

    const onSortListBody = (id: string, sortType: string) => {
        const index = findIndex(listHead, { id });
        if (index > -1) {
            //const body = JSON.parse(JSON.stringify(listBody));
            const body = [...listBody];
            const foundHead = listHead.find(item => item.id == id);
            body.sort((a: any, b: any) => {
                let valA = typeof a[id] == 'string' ? a[id].toLowerCase() : a[id];
                let valB = typeof b[id] == 'string' ? b[id].toLowerCase() : b[id];
                if (foundHead?.sortID) {
                    valA = extractdNumbersFromString(a[id]);
                    valB = extractdNumbersFromString(b[id]);
                }
                if (sortType == 'asc') {
                    if (valA > valB) {
                        return 1;
                    }
                    if (valA < valB) {
                        return -1;
                    }
                }
                if (sortType == 'desc') {
                    if (valA < valB) {
                        return 1;
                    }
                    if (valA > valB) {
                        return -1;
                    }
                }
                return 0;
            });
            setListBody(body);
            setPage(0);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    function EnhancedTableToolbar() {
        return (
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                }}
            >
                <Typography
                    sx={{ flex: '1 1 100%' }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    {refreshFunction &&
                        <IconButton onClick={() => {
                            if (showSearch) {
                                setShowSearch(false);
                            } else {
                                resetForSearch();
                            }
                            refreshFunction();
                        }}>
                            <IconRefresh />
                        </IconButton>
                    }
                    {headTitle}
                </Typography>
                <Tooltip title="Mostrar busqueda">
                    <IconButton onClick={() => { setShowSearch(!showSearch); }}>
                        <IconSearch />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        );
    }


    async function resetForSearch() {
        //if (showSearch) {
        const head = JSON.parse(JSON.stringify(listHead));
        head.map((item: any) => {
            item.search = '';
            item.sort = false;
        });
        setListHead(head);
        //const body = JSON.parse(JSON.stringify(dataListBody));
        const body = [...dataListBody];
        setListBody(body);
        setPage(0);
        //}    
    }

    useEffect(() => {
        resetForSearch();
    }, [showSearch]);

    const showSearchValue = (id: any) => {
        const head = listHead.find(item => item.id == id);
        if (!head || !head.search) {
            return '';
        }
        return head.search;
    }

    const onSearch = (value: string, type: string, id: any) => {
        const head = JSON.parse(JSON.stringify(listHead));
        //let body = JSON.parse(JSON.stringify(dataListBody));
        let body = [...dataListBody];
        for (const item of head) {
            item.sort = false;
            if (item.id == id) {
                item.search = value;
            }
            if (item.search != '') {
                switch (item.type) {
                    case 'date':
                        body = body.filter((itemBody: any) => {
                            const val = itemBody[item.id].split('T')[0];
                            return val == item.search;
                        });
                        break;
                    case 'text':
                        body = body.filter((itemBody: any) => {
                            const val = itemBody[item.id].toLowerCase();
                            return val.includes(item.search.toLowerCase());
                        });
                        break;
                    case 'currency':
                    case 'float':
                    case 'number':
                        body = body.filter((itemBody: any) => {
                            //console.log('itemBody', typeof itemBody[item.id], itemBody[item.id]);
                            //console.log('item.search', typeof item.search, item.search);
                            const val = String(itemBody[item.id]);
                            return val.includes(String(item.search));
                        });
                        break;
                    case 'active':
                        body = body.filter((itemBody: any) => {
                            const val = itemBody[item.id];
                            const search = item.search.toLowerCase();
                            return val == (search == 'activo' ? true : false);
                        });
                        break;
                    case 'select':
                        body = body.filter((itemBody: any) => {
                            const val = itemBody[item.id].toLowerCase();
                            return val == item.search.toLowerCase();
                        });
                        break;
                    default:
                        body = body.filter((itemBody: any) => {
                            const val = itemBody[item.id].toLowerCase();
                            return val.includes(item.search.toLowerCase());
                        });
                        break;
                }
            }
        }
        setListBody(body);
        setListHead(head);
        setPage(0);
    };

    return (

        <Paper variant="outlined" sx={{ mx: 2, mt: 1 }}>
            <EnhancedTableToolbar />

            {showSearch && <Grid container spacing={3} sx={{ p: 2, mb: 2 }}>
                {listHeadSearch.length > 0 && listHeadSearch.map((row: any) => (
                    <Grid key={'grid-search-' + row.id} item xs={12} lg={4} sm={4} alignItems="stretch">
                        {row.canSearch && <ShowSearchInputRow id={row.id} dataListBody={dataListBody} listHeadSearch={listHeadSearch} onSearch={onSearch} showSearchValue={showSearchValue} />}
                    </Grid>
                ))}
            </Grid>
            }

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {listHead.length > 0 && listHead.map((row: any) => (
                                <TableCell
                                    key={'table-head-' + row.id}
                                    align="left"
                                    sx={{ minWidth: row.width ? row.width : 50 }}
                                >
                                    <Chip sx={{ border: 'none' }} avatar={btnSort(row.id) || undefined} label={row.label} variant="outlined" />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listBody.length > 0 && listBody.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any) => (
                            <TableRow
                                key={'table-body-' + row._id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >

                                {listHead.length > 0 && listHead.map((rowHead: any) => (
                                    <TableCell key={'table-body-' + row._id + '-' + rowHead.id} align={rowHead.align ? rowHead.align : 'left'}>{showDataRow(row, rowHead.id)}</TableCell>
                                ))}

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 20, 30, 50, 100]}
                component="div"
                count={listBody.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>

    );
};

export default TableListBS;
