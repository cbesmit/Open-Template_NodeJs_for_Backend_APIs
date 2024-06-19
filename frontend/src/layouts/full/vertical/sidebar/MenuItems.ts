import { uniqueId } from 'lodash';

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
import { IconFilePlus, IconList } from '@tabler/icons';

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

export default Menuitems;
