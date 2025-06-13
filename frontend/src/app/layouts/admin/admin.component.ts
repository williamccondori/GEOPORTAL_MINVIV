import {Component, inject} from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';

import {MenuItem} from 'primeng/api';
import {MenubarModule} from 'primeng/menubar';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [MenubarModule, RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  private readonly router = inject(Router);

  menus: MenuItem[] = [
    {
      title: 'Inicio',
      label: 'Inicio',
      icon: 'pi pi-home',
      command: () => this.router.navigate(['/admin']),
    },
    {
      title: 'Catálogos',
      label: 'Catálogos',
      icon: 'pi pi-book',
      items: [
        {
          title: 'Categorías',
          label: 'Categorías',
          command: () => this.router.navigate(['/admin/categories']),
        },
        {
          title: 'Capas',
          label: 'Capas',
          command: () => this.router.navigate(['/admin/layers']),
        },
        {
          title: 'Capas base',
          label: 'Capas base',
          command: () => this.router.navigate(['/admin/base-layers']),
        },
        {
          title: 'Capas WMS',
          label: 'Capas WMS',
          command: () => this.router.navigate(['/admin/wms-layers']),
        },
      ],
    },
    {
      title: 'Seguridad',
      label: 'Seguridad',
      icon: 'pi pi-lock',
      items: [
        {
          title: 'Roles',
          label: 'Roles',
          command: () => this.router.navigate(['/admin/roles']),
        },
        {
          title: 'Usuarios',
          label: 'Usuarios',
          command: () => this.router.navigate(['/admin/users']),
        },
      ],
    },
    {
      title: 'Configuración',
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        {
          title: 'Configuración inicial',
          label: 'Configuración inicial',
          command: () => this.router.navigate(['/admin/initial-settings']),
        },
      ],
    },
  ];
}
