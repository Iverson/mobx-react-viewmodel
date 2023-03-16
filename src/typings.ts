/// ------------------------------------------
// Typings
//

export type IViewModel<
  P extends ViewModelProps | undefined = undefined
> = P extends {} ? ViewModelWithProps<P> : BaseViewModel;

// Base view-model interface
interface BaseViewModel {
  dispose?: () => void;
  init?: () => void;
}

// View-model interface with reactive Props from React component
export type ViewModelProps = {};
export interface ViewModelWithProps<P extends ViewModelProps>
  extends BaseViewModel {
  // You should use @observable.ref for props in your view-model classes
  props: P;
}

// Класс-конструктор для view-моделей
export type IViewModelClass<
  T extends IViewModel<P>,
  P extends ViewModelProps | undefined = undefined
> = P extends {} ? { new (props: P): T } : { new (): T };
