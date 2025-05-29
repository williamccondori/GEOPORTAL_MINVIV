import { Routes } from '@angular/router';

import { authGuard } from './auth.guard';
import { AdminComponent } from './layouts/admin/admin.component';
import { loginGuard } from './login.guard';
import { BaseLayerPageComponent } from './pages/admin/base-layer-page/base-layer-page.component';
import { CategoryPageComponent } from './pages/admin/category-page/category-page.component';
import { IndexPageComponent } from './pages/admin/index-page/index-page.component';
import { InitialSettingsPageComponent } from './pages/admin/initial-settings-page/initial-settings-page.component';
import { LayerPageComponent } from './pages/admin/layer-page/layer-page.component';
import { RolePageComponent } from './pages/admin/role-page/role-page.component';
import { UserPageComponent } from './pages/admin/user-page/user-page.component';
import { WmsLayerPageComponent } from './pages/admin/wms-layer-page/wms-layer-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { MapPageComponent } from './pages/map-page/map-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MapPageComponent,
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    component: LoginPageComponent,
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminComponent,
    children: [
      {
        path: '',
        component: IndexPageComponent,
      },
      {
        path: 'base-layers',
        component: BaseLayerPageComponent,
      },
      {
        path: 'categories',
        component: CategoryPageComponent,
      },
      {
        path: 'layers',
        component: LayerPageComponent,
      },
      {
        path: 'wms-layers',
        component: WmsLayerPageComponent,
      },
      {
        path: 'roles',
        component: RolePageComponent,
      },
      {
        path: 'users',
        component: UserPageComponent,
      },
      {
        path: 'initial-settings',
        component: InitialSettingsPageComponent,
      },
    ],
  },
];
