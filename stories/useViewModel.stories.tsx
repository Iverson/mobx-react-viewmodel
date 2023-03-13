import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { action as logAction } from '@storybook/addon-actions';

import { IViewModel } from '../src/typings';
import { useViewModel } from '../src/useViewModel';
import { ViewModel } from '../src/viewModel';

export default {
  title: 'useViewModel',
};

export const Simplest = () => {
  /// ------------------------------------------
  // Example of a simple view-model without props and life-cycle methods
  //
  class SimplestViewModel {
    @observable
    title: string = '';

    constructor() {
      makeObservable(this);
    }

    @action
    setTitle(title: string) {
      this.title = title;
    }
  }

  const SimplestExample = observer(function SimplestExample$() {
    const viewModel = useViewModel(SimplestViewModel);

    return (
      <div>
        <input
          type="text"
          value={viewModel.title}
          onChange={e => viewModel.setTitle(e.target.value)}
          placeholder="Type title..."
        />
        <p>Title: {viewModel.title}</p>
      </div>
    );
  });

  return <SimplestExample />;
};

export const WithLifecycleMethods = () => {
  /// ------------------------------------------
  // Example of view-model with init() and dispose() life-cycle methods
  //
  class DisposableViewModel implements IViewModel {
    @observable
    title: string = '';

    constructor() {
      makeObservable(this);
    }

    init() {
      logAction('DisposableViewModel')('do something on view mount');
    }

    @action
    setTitle(title: string) {
      this.title = title;
    }

    dispose() {
      logAction('DisposableViewModel')('do something after view destroy');
    }
  }

  const WithLifecycleMethodsExample = observer(
    function WithLifecycleMethodsExample$() {
      const viewModel = useViewModel(DisposableViewModel);

      return (
        <>
          <p>Look in the Actions tab after closing this story</p>
          <br />
          <br />
          <input
            value={viewModel.title}
            onChange={e => viewModel.setTitle(e.target.value)}
            placeholder="Type title..."
          />
          <p>Title: {viewModel.title}</p>
        </>
      );
    }
  );

  return <WithLifecycleMethodsExample />;
};

export const WithReactiveProps = (args: any) => {
  /// ------------------------------------------
  // Example of view-модели with dispose() and reactive-props
  //
  type DeliveryMethod = 'pickup' | 'delivery';

  interface ExampleComponentProps {
    productName: string;
    productPrice: number;
    deliveryPrice: number;
  }

  class AdvancedViewModel implements IViewModel<ExampleComponentProps> {
    @observable.ref
    props: ExampleComponentProps;

    @observable
    deliveryMethod: DeliveryMethod = 'pickup';

    private disposers: (() => void)[] = [];

    constructor(props: ExampleComponentProps) {
      this.props = props;
      makeObservable(this);

      this.disposers.push(
        reaction(
          () => this.totalPrice,
          totalPrice => logAction('totalPriceChanged:')(totalPrice)
        )
      );
    }

    @computed
    get productName() {
      return this.props.productName;
    }

    @computed
    get productPrice() {
      return this.props.productPrice;
    }

    @computed
    get deliveryPrice() {
      return this.props.deliveryPrice;
    }

    @computed
    get totalPrice() {
      return this.deliveryMethod === 'delivery'
        ? this.productPrice + this.props.deliveryPrice
        : this.productPrice;
    }

    @action
    setDeliveryMethod(value: DeliveryMethod) {
      this.deliveryMethod = value;
    }

    dispose() {
      logAction('AdvancedViewModel')('dispose');
      this.disposers.forEach(disposer => disposer());
    }
  }

  const ReactivePropsExampleComponent = observer(
    function ReactivePropsExampleComponent$(props: ExampleComponentProps) {
      const viewModel = useViewModel(AdvancedViewModel, props);

      return (
        <div>
          <p>Name: {props.productName}</p>
          <p>Price: {viewModel.productPrice}</p>

          <p>
            Delivery Method:
            <label htmlFor="pickup">
              <input
                name="delivery_method"
                id="pickup"
                type="radio"
                value="pickup"
                checked={viewModel.deliveryMethod === 'pickup'}
                onChange={() => viewModel.setDeliveryMethod('pickup')}
              />{' '}
              Pickup
            </label>
            <label htmlFor="delivery">
              <input
                id="delivery"
                name="delivery_method"
                type="radio"
                value="delivery"
                checked={viewModel.deliveryMethod === 'delivery'}
                onChange={() => viewModel.setDeliveryMethod('delivery')}
              />
              Delivery
            </label>
          </p>

          {viewModel.deliveryMethod === 'delivery' ? (
            <p>Delivery Price: {viewModel.deliveryPrice}</p>
          ) : null}

          <p>Total Price: {viewModel.totalPrice}</p>
        </div>
      );
    }
  );

  return <ReactivePropsExampleComponent {...args} />;
};

WithReactiveProps.args = {
  productName: 'MacBook Pro',
  productPrice: 100000,
  deliveryPrice: 500,
};

export const InheritanceBaseViewModel = (args: any) => {
  /// ------------------------------------------
  // Example of view-model inherited from base ViewModel class
  //
  interface InheritanceViewModelProps {
    firstName: string;
    lastName: string;
  }
  class InheritanceViewModel extends ViewModel<InheritanceViewModelProps> {
    constructor(props: InheritanceViewModelProps) {
      super(props);

      this.disposers.push(
        () => {
          logAction('InheritanceViewModel disposer')(1);
        },
        () => {
          logAction('InheritanceViewModel disposer')(2);
        }
      );
    }

    init() {
      logAction('InheritanceViewModel')('init');
    }

    @computed
    get name() {
      if (this.props.firstName) {
        return `${this.props.firstName[0]}. ${this.props.lastName}`;
      } else {
        return this.props.lastName;
      }
    }
  }

  const InheritanceViewModelExampleComponent = observer(
    function AdvancedDIExample$(props: InheritanceViewModelProps) {
      const viewModel = useViewModel(InheritanceViewModel, props);

      return (
        <div>
          <p>Hello, {viewModel.name}!</p>
        </div>
      );
    }
  );

  return <InheritanceViewModelExampleComponent {...args} />;
};
InheritanceBaseViewModel.args = {
  firstName: 'John',
  lastName: 'Gold',
};
