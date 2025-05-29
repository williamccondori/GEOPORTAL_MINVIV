import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  Type,
} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComponentInjectorService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  createComponent<T>(component: Type<T>): {
    element: HTMLElement;
    ref: ComponentRef<T>;
  } {
    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
    });

    this.appRef.attachView(componentRef.hostView);
    const element = componentRef.location.nativeElement as HTMLElement;

    return { element, ref: componentRef };
  }

  destroyComponent<T>(ref: ComponentRef<T>): void {
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}
