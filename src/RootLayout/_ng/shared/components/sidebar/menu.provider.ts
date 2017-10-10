// How to use
// menus = (new MenuProvider()).menus
// Then you will get menus will sub menus json object

export interface MENUITEM {
    sort:number,
    name:string,
    parent?:string,
    level?:number,
    item:{
        link:string,
        icon:string, 
        title:string,
        submenu?:[any],
        items?:[any],
        name?:string  //do not set here, it will set from up level's name
    }
}

export class MenuProvider {
    private constructor() {}
    public static parseMenus(MENUS_DEFINES, extraMenus?:any[]) {
        let rawMenus = MENUS_DEFINES[0];
        for(let i:number=1; i<MENUS_DEFINES.length; i++) {
            rawMenus = rawMenus.concat(MENUS_DEFINES[i]);
        }

        if (extraMenus) {
            for(let i:number=0; i<extraMenus.length; i++) {
                rawMenus = rawMenus.concat(extraMenus[i]);
            }
        }
   
        if (rawMenus === undefined) {
            return [];
        }

        let tmpMenus = {};
        let menusNameSortMap = {}
        for(let value of rawMenus) {
            let menu:MENUITEM = <MENUITEM>value;
            menu.level = (menu.parent === undefined ? 0 : 1);
            if (tmpMenus[menu.sort] != undefined) {
                menu.sort = menu.sort +1;
            }
            tmpMenus[menu.sort] = menu;
            menusNameSortMap[menu.name] = menu.sort;
        }

        for(let key in tmpMenus) {
            let menu = tmpMenus[key];
            if (menu.level > 0) {
                let key = menusNameSortMap[menu.parent];
                let parent = tmpMenus[key];
                if (parent !== undefined) {
                    if (parent.item.submenu ===undefined) {
                        parent.item.submenu = {};
                    }
                    menu.level = parent.level + 1;
                    parent.item.submenu[menu.sort] = menu; 
                }
            }
        }

        return MenuProvider.sortMenu(tmpMenus, 0);
    }

    private static sortMenu(rawmenus, level:number) {
        let menus = []
        for(let key in rawmenus) {
            let menu = rawmenus[key];
            if (menu.level == level) {
                if (menu.item.submenu != undefined) {
                    menu.item.submenu = MenuProvider.sortMenu(menu.item.submenu, 1+level);
                }
                menu.item['name'] = menu.name;
                menus.push(menu.item);
            }
        }
        return menus;
    }
}