import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseLayer } from '../models/base-layer.model';
import { Category, CategoryNode } from '../models/category.model';
import { InitialSettings } from '../models/initial-settings.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { WmsLayer } from '../models/wms-layer.model';

import { ApiService } from './api.service';
import { Layer, LayerForm } from '../models/layer.model';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private readonly apiService = inject(ApiService);

  getApiUrl(): string {
    return this.apiService.getApiUrl();
  }

  getInitialSettings(): Observable<InitialSettings> {
    return this.apiService.get<InitialSettings>(`admin/initial-settings/`);
  }

  updateInitialSettings(initialSettings: InitialSettings): Observable<string> {
    return this.apiService.put<string>(
      `admin/initial-settings/`,
      initialSettings
    );
  }

  // Base layers

  createBaseLayer(baseLayer: BaseLayer): Observable<string> {
    return this.apiService.post<string>(`admin/base-layers/`, baseLayer);
  }

  updateBaseLayer(
    baseLayerId: string,
    baseLayer: BaseLayer
  ): Observable<string> {
    return this.apiService.put<string>(
      `admin/base-layers/${baseLayerId}/`,
      baseLayer
    );
  }

  getAllBaseLayers(): Observable<BaseLayer[]> {
    return this.apiService.get<BaseLayer[]>(`admin/base-layers/`);
  }

  getBaseLayerById(userId: string): Observable<BaseLayer> {
    return this.apiService.get<BaseLayer>(`admin/base-layers/${userId}/`);
  }

  deleteBaseLayer(baseLayerId: string): Observable<string> {
    return this.apiService.delete<string>(`admin/base-layers/${baseLayerId}/`);
  }

  // WMS layers

  createWmsLayer(wmsLayer: WmsLayer): Observable<string> {
    return this.apiService.post<string>(`admin/wms-layers/`, wmsLayer);
  }

  updateWmsLayer(wmsLayerId: string, wmsLayer: WmsLayer): Observable<string> {
    return this.apiService.put<string>(
      `admin/wms-layers/${wmsLayerId}/`,
      wmsLayer
    );
  }

  getAllWmsLayers(): Observable<WmsLayer[]> {
    return this.apiService.get<BaseLayer[]>(`admin/wms-layers/`);
  }

  getWmsLayerById(wmsLayerId: string): Observable<WmsLayer> {
    return this.apiService.get<BaseLayer>(`admin/wms-layers/${wmsLayerId}/`);
  }

  deleteWmsLayer(wmsLayerId: string): Observable<string> {
    return this.apiService.delete<string>(`admin/wms-layers/${wmsLayerId}/`);
  }

  // Roles

  createRole(role: Role): Observable<string> {
    return this.apiService.post<string>(`admin/roles/`, role);
  }

  updateRole(roleId: string, role: Role): Observable<string> {
    return this.apiService.put<string>(`admin/roles/${roleId}/`, role);
  }

  getAllRoles(): Observable<Role[]> {
    return this.apiService.get<Role[]>(`admin/roles/`);
  }

  getRoleById(roleId: string): Observable<Role> {
    return this.apiService.get<Role>(`admin/roles/${roleId}/`);
  }

  deleteRole(roleId: string): Observable<string> {
    return this.apiService.delete<string>(`admin/roles/${roleId}/`);
  }

  // Users

  createUser(user: User): Observable<string> {
    return this.apiService.post<string>(`admin/users/`, user);
  }

  updateUser(userId: string, user: User): Observable<string> {
    return this.apiService.put<string>(`admin/users/${userId}/`, user);
  }

  getAllUsers(): Observable<User[]> {
    return this.apiService.get<User[]>(`admin/users/`);
  }

  getUserById(userId: string): Observable<User> {
    return this.apiService.get<User>(`admin/users/${userId}/`);
  }

  deleteUser(userId: string): Observable<string> {
    return this.apiService.delete<string>(`admin/users/${userId}/`);
  }

  // Categories

  createCategory(category: Category): Observable<string> {
    return this.apiService.post<string>(`admin/categories/`, category);
  }

  deleteCategory(categoryId: string): Observable<string> {
    return this.apiService.delete<string>(`admin/categories/${categoryId}/`);
  }

  updateCategory(categoryId: string, category: Category): Observable<string> {
    return this.apiService.put<string>(
      `admin/categories/${categoryId}/`,
      category
    );
  }

  getCatalogStructure(): Observable<CategoryNode[]> {
    return this.apiService.get<CategoryNode[]>(`admin/categories/structure/`);
  }

  getCategoryById(categoryId: string): Observable<Category> {
    return this.apiService.get<Category>(`admin/categories/${categoryId}/`);
  }

  // Layers

  getAllLayers(): Observable<Layer[]> {
    return this.apiService.get<Layer[]>(`admin/layers/`);
  }

  createLayer(layer: LayerForm): Observable<string> {
    return this.apiService.post<string>(`admin/layers/`, layer);
  }

  updateLayer(layerId: string, layer: LayerForm): Observable<string> {
    return this.apiService.put<string>(`admin/layers/${layerId}/`, layer);
  }

  deleteLayer(layerId: string): Observable<string> {
    return this.apiService.delete<string>(`admin/layers/${layerId}/`);
  }
}
