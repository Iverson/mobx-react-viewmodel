/// ------------------------------------------
// Typings
//

export type IViewModel<
  P extends ViewModelProps | undefined = undefined
> = P extends {} ? ViewModelWithProps<P> : BaseViewModel;

// Базовый интерфейс view-модели
interface BaseViewModel {
  dispose?: () => void;
  init?: () => void;
}

// Интерфейс view-модели с реактивными Props из View
export type ViewModelProps = {};
export interface ViewModelWithProps<P extends ViewModelProps>
  extends BaseViewModel {
  // В моделях для props используем строго @observable.ref!
  // В реакт-компонентах объект props всегда имеет новую ссылку.
  // @observable.deep очень дорогой + крашится на Decimal-объектах в рантайме.
  props: P;
}

// Класс-конструктор для view-моделей
export type IViewModelClass<
  T extends IViewModel<P>,
  P extends ViewModelProps | undefined = undefined
> = P extends {} ? { new (props: P): T } : { new (): T };
