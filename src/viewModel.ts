import { makeObservable, observable } from 'mobx';
import { ViewModelProps } from './typings';

/// ------------------------------------------
// Base ViewModel
//
export abstract class ViewModel<
  P extends ViewModelProps | undefined = undefined
> {
  @observable.ref
  props: P;

  protected disposers: (() => void)[] = [];

  constructor(props: P) {
    this.props = props;
    makeObservable(this);
  }

  init() {}

  dispose() {
    this.disposers.forEach(dispose => dispose());
  }
}
