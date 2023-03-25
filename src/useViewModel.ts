import { useEffect, useState } from 'react';
import { comparer, runInAction } from 'mobx';
import {
  IViewModel,
  IViewModelClass,
  ViewModelProps,
  ViewModelArgs,
} from './typings';

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

/**
 * Hook for using view-models in React components
 * @argument viewModelClass - class of view-model
 * @argument props - props for view-model
 * @argument args - additional arguments for view-model
 * @returns instance of view-model
 * @param viewModelClass
 */
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
export function useViewModel<
  T extends IViewModel<P>,
  P extends ViewModelProps,
  Args extends ViewModelArgs
>(viewModelClass: IViewModelClass<T, P, Args>, props: P, args: Args): T;
export function useViewModel<
  T extends IViewModel<P>,
  P extends ViewModelProps,
  Args extends ViewModelArgs
>(viewModelClass: IViewModelClass<T, P, Args>, props?: P, args?: Args): T {
  // Instance view-model only once on Mount via class
  const [viewModel] = useState(() =>
    props
      ? Array.isArray(args)
        ? new viewModelClass(props, ...args)
        : new viewModelClass(props)
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
