import { useEffect, useState } from 'react';
import { comparer, runInAction } from 'mobx';
import { IViewModel, IViewModelClass, ViewModelProps } from './typings';

/// ------------------------------------------
// Hooks
//
type AnyModel = {};

function useViewModelInternal<P extends ViewModelProps>(
  viewModel: IViewModel<P>,
  props?: P
): void {
  useEffect(() => {
    if (props && !comparer.shallow(props, viewModel.props)) {
      runInAction(() => {
        // If props changed - update it in view-model to trigger mobx-reactions
        viewModel.props = props;
      });
    }
  }, [viewModel, props]);

  useEffect(() => {
    viewModel.init?.();
    // Call dispose() on Unmount
    return () => viewModel.dispose?.();
  }, [viewModel]);
}

export function useViewModel<T extends AnyModel>(viewModelClass: {
  new (): T;
}): T;
export function useViewModel<T extends IViewModel>(
  viewModelClass: IViewModelClass<T>
): T;
export function useViewModel<T extends IViewModel<P>, P extends ViewModelProps>(
  viewModelClass: IViewModelClass<T, P>,
  props: P
): T;
export function useViewModel<T extends IViewModel<P>, P extends ViewModelProps>(
  viewModelClass: IViewModelClass<T, P>,
  props?: P
): T {
  // Instance view-model only once on Mount via class
  const [viewModel] = useState(() =>
    props
      ? new viewModelClass(props)
      : new (viewModelClass as IViewModelClass<T>)()
  );
  useViewModelInternal(viewModel, props);

  return viewModel;
}

export function useViewModelFactory<T extends IViewModel | AnyModel>(
  factory: () => T
): T;
export function useViewModelFactory<T extends IViewModel<P>, P extends {}>(
  factory: (props: P) => T,
  props: P
): T;
export function useViewModelFactory<T extends IViewModel<P>, P extends {}>(
  factory: (props?: P) => T,
  props?: P
): T {
  // Instance view-model only once on Mount via factory-function
  const [viewModel] = useState(() => factory(props));
  useViewModelInternal(viewModel, props);

  return viewModel;
}
