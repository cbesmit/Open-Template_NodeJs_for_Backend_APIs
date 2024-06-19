import React, { useState, useEffect } from 'react';
//import Menuitems from './MenuItems';
import { useLocation } from 'react-router';
import { Box, List, useMediaQuery } from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import { toggleMobileSidebar } from 'src/store/customizer/CustomizerSlice';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { AppState } from 'src/store/Store';
import { uniqueId } from 'lodash';
import { IconFilePlus, IconList } from '@tabler/icons';


import fetchServer from '../../../../utils/fetchServer';


interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
/*
const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: 'Requisiciones',
  },

  {
    id: uniqueId(),
    title: 'Nueva',
    icon: IconFilePlus,
    href: '/requisicion/nueva',
  },

  {
    id: uniqueId(),
    title: 'Listado',
    icon: IconList,
    href: '/requisicion/listado',
  },
];
*/

const SidebarItems = () => {
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: any = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const dispatch = useDispatch();

  const [Menuitems, setMenuitems] = useState<MenuitemsType[]>([]);

  async function loadMenu() {
    const accesos = [
      { seccion: 'principalMenu', accion: 'nuevaRequisicion' },
      { seccion: 'principalMenu', accion: 'listadoRequisicion' },
      
    ];
    await fetchServer.call('accesos/validate', 'POST', { accesos: accesos }).then(data => {
      if (data.error) { throw new Error(fetchServer.getErrorMessage(data, 'Error al obtener el menu')); }
      const menu: MenuitemsType[] = [];

      data.data.find((item: any) => {
        if (item.seccion == 'principalMenu' && item.accion === 'nuevaRequisicion' && item.permiso) {
          menu.push({
            id: uniqueId(),
            navlabel: true,
            subheader: 'Requisiciones',
          });
          menu.push({
            id: uniqueId(),
            title: 'Nueva',
            icon: IconFilePlus,
            href: '/requisicion/nueva',
          });
        }
        if (item.seccion == 'principalMenu' && item.accion === 'listadoRequisicion' && item.permiso) {
          const oFound = menu.find((item: any) => item.subheader === 'Requisiciones');
          if (!oFound) {
            menu.push({
              id: uniqueId(),
              navlabel: true,
              subheader: 'Requisiciones',
            });
          }
          menu.push({
            id: uniqueId(),
            title: 'Listado',
            icon: IconList,
            href: '/requisicion/listado',
          });
        }

      });
      setMenuitems(menu);
    }).catch(error => {
      const msgError = fetchServer.getErrorMessage(error, 'Error al obtener el menu');
      console.log(msgError);
      setMenuitems([]);
    });
  };

  useEffect(() => {
    (async () => {
      await loadMenu();
    })();
  }, []);

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={() => dispatch(toggleMobileSidebar())}
              />
            );

            // {/********If Sub No Menu**********/}
          } else {
            return (
              <NavItem item={item} key={item.id} pathDirect={pathDirect} hideMenu={hideMenu}
                onClick={() => dispatch(toggleMobileSidebar())} />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
