import React, { useState } from 'react';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { observer } from 'mobx-react';

import { IViewModel } from '../src/typings';
import { useViewModel } from '../src/useViewModel';
import { ViewModel } from '../src/viewModel';
import { BaseAnnotations } from '@storybook/addons';

export default {
  title: 'useViewModel',
  parameters: {
    docs: {
      page: null,
      description: {
        component: 'Base hook for creating stateful view-model instance',
      },
    },
  },
};
/// HOC

function LifecycleToggleHOC<T>(
  Cmp: React.FunctionComponent<T>
): React.FunctionComponent & BaseAnnotations<unknown, unknown> {
  return ((props: T) => {
    const [mount, setMount] = useState(true);

    return (
      <>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            left: 0,
            top: '8px',
            padding: '10px 20px',
            background: '#eee',
          }}
        >
          <label htmlFor="mount1">
            Mount:
            <input
              id="mount1"
              type="checkbox"
              checked={mount}
              onChange={() => setMount(v => !v)}
            />
          </label>{' '}
          (check the Console tab in devtools)
        </div>
        <br />
        <br />
        {mount && <Cmp {...(props as any)} />}
      </>
    );
  }) as React.FunctionComponent & BaseAnnotations<unknown, unknown>;
}

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

const SimplestExample = observer(() => {
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

export const Simplest = () => {
  return <SimplestExample />;
};
Simplest.parameters = {
  controls: { expanded: true },
  docs: {
    page: null,
    source: {
      code: `
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

const SimplestExample = observer(() => {
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
      `,
      language: 'jsx',
      type: 'auto',
    },
  },
};

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
    console.log('DisposableViewModel: do something on view mount');
  }

  @action
  setTitle(title: string) {
    this.title = title;
  }

  dispose() {
    console.log('DisposableViewModel: do something after view destroy');
  }
}

const WithLifecycleMethodsExample = observer(() => {
  const viewModel = useViewModel(DisposableViewModel);

  return (
    <>
      <input
        value={viewModel.title}
        onChange={e => viewModel.setTitle(e.target.value)}
        placeholder="Type title..."
      />
      <p>Title: {viewModel.title}</p>
    </>
  );
});

export const WithLifecycleMethods = LifecycleToggleHOC(
  WithLifecycleMethodsExample
);
WithLifecycleMethods.parameters = {
  docs: {
    source: {
      code: `
class DisposableViewModel implements IViewModel {
  @observable
  title: string = '';

  constructor() {
    makeObservable(this);
  }

  init() {
    console.log('DisposableViewModel: do something on view mount');
  }

  @action
  setTitle(title: string) {
    this.title = title;
  }

  dispose() {
    console.log('DisposableViewModel: do something after view destroy');
  }
}

const WithLifecycleMethodsExample = observer(() => {
  const viewModel = useViewModel(DisposableViewModel);

  return (
    <>
      <input
        value={viewModel.title}
        onChange={e => viewModel.setTitle(e.target.value)}
        placeholder="Type title..."
      />
      <p>Title: {viewModel.title}</p>
    </>
  );
});
      `,
      language: 'jsx',
      type: 'auto',
    },
  },
};

/// ------------------------------------------
// Example of view-model extends base ViewModel class
//
interface ExtendsBaseViewModelProps {
  firstName: string;
  lastName: string;
}
class ExtendsBaseViewModel extends ViewModel<ExtendsBaseViewModelProps> {
  constructor(props: ExtendsBaseViewModelProps) {
    super(props);

    this.disposers.push(
      () => {
        console.log('ExtendsBaseViewModel disposer 1');
      },
      () => {
        console.log('ExtendsBaseViewModel disposer 2');
      }
    );
  }

  init() {
    console.log('ExtendsBaseViewModel: init');
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

const ExtendsBaseViewModelExampleComponent = observer(
  (props: ExtendsBaseViewModelProps) => {
    const viewModel = useViewModel(ExtendsBaseViewModel, props);

    return (
      <div>
        <p>Hello, {viewModel.name}!</p>
      </div>
    );
  }
);

export const WithBaseViewModelExtends = LifecycleToggleHOC(
  ExtendsBaseViewModelExampleComponent
);
WithBaseViewModelExtends.args = {
  firstName: 'John',
  lastName: 'Gold',
};
WithBaseViewModelExtends.parameters = {
  docs: {
    source: {
      code: `
interface ExtendsBaseViewModelProps {
  firstName: string;
  lastName: string;
}
class ExtendsBaseViewModel extends ViewModel<ExtendsBaseViewModelProps> {
  constructor(props: ExtendsBaseViewModelProps) {
    super(props);

    this.disposers.push(
      () => {
        console.log('ExtendsBaseViewModel disposer 1');
      },
      () => {
        console.log('ExtendsBaseViewModel disposer 2');
      }
    );
  }

  init() {
    console.log('ExtendsBaseViewModel: init');
  }

  @computed
  get name() {
    if (this.props.firstName) {
      return \`\${this.props.firstName[0]}. \${this.props.lastName}\`;
    } else {
      return this.props.lastName;
    }
  }
}

const ExtendsBaseViewModelExampleComponent = observer(
  (props: ExtendsBaseViewModelProps) => {
    const viewModel = useViewModel(ExtendsBaseViewModel, props);

    return (
      <div>
        <p>Hello, {viewModel.name}!</p>
      </div>
    );
  }
);
      `,
      language: 'jsx',
      type: 'auto',
    },
  },
};

/// ------------------------------------------
// Example of view-модели with dispose() and reactive-props
//
type DeliveryMethod = 'pickup' | 'delivery';

interface ExampleComponentProps {
  productName: string;
  deliveryMethod: DeliveryMethod;
}

class AdvancedViewModel implements IViewModel<ExampleComponentProps> {
  @observable.ref
  props: ExampleComponentProps;

  @observable
  productPrice: number = 10000;

  @observable
  deliveryPrice: number = 300;

  private disposers: (() => void)[] = [];

  constructor(props: ExampleComponentProps) {
    this.props = props;
    makeObservable(this);

    this.disposers.push(
      reaction(
        () => this.totalPrice,
        totalPrice => console.log(`totalPriceChanged: ${totalPrice}`)
      )
    );
  }

  @computed
  get productName() {
    return this.props.productName;
  }

  @computed
  get deliveryMethod() {
    return this.props.deliveryMethod;
  }

  @computed
  get totalPrice() {
    return this.deliveryMethod === 'delivery'
      ? this.productPrice + this.deliveryPrice
      : this.productPrice;
  }

  @action
  setProductPrice(value: number) {
    this.productPrice = value;
  }

  @action
  setdDeliveryPrice(value: number) {
    this.deliveryPrice = value;
  }

  dispose() {
    console.log('AdvancedViewModel: dispose');
    this.disposers.forEach(disposer => disposer());
  }
}

const ReactivePropsExampleComponent = observer(
  (props: ExampleComponentProps) => {
    const viewModel = useViewModel(AdvancedViewModel, props);

    return (
      <div>
        <p>Name: {props.productName}</p>
        <p>
          Price:
          <input
            type="number"
            value={viewModel.productPrice}
            onChange={e => viewModel.setProductPrice(Number(e.target.value))}
          />
        </p>

        {viewModel.deliveryMethod === 'delivery' ? (
          <p>
            Delivery Price:
            <input
              type="number"
              value={viewModel.deliveryPrice}
              onChange={e =>
                viewModel.setdDeliveryPrice(Number(e.target.value))
              }
            />
          </p>
        ) : null}

        <p>Total Price: {viewModel.totalPrice}</p>
      </div>
    );
  }
);

export const WithReactiveProps = () => {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    'pickup'
  );

  return (
    <>
      <p>
        Delivery Method:
        <label htmlFor="pickup">
          <input
            name="delivery_method"
            id="pickup"
            type="radio"
            value="pickup"
            checked={deliveryMethod === 'pickup'}
            onChange={() => setDeliveryMethod('pickup')}
          />{' '}
          Pickup
        </label>
        <label htmlFor="delivery">
          <input
            id="delivery"
            name="delivery_method"
            type="radio"
            value="delivery"
            checked={deliveryMethod === 'delivery'}
            onChange={() => setDeliveryMethod('delivery')}
          />
          Delivery
        </label>
      </p>

      <ReactivePropsExampleComponent
        productName="MacBook Pro"
        deliveryMethod={deliveryMethod}
      />
    </>
  );
};

WithReactiveProps.parameters = {
  docs: {
    source: {
      code: `
type DeliveryMethod = 'pickup' | 'delivery';

interface ExampleComponentProps {
  productName: string;
  deliveryMethod: DeliveryMethod;
}

class AdvancedViewModel implements IViewModel<ExampleComponentProps> {
  @observable.ref
  props: ExampleComponentProps;

  @observable
  productPrice: number = 10000;

  @observable
  deliveryPrice: number = 300;

  private disposers: (() => void)[] = [];

  constructor(props: ExampleComponentProps) {
    this.props = props;
    makeObservable(this);

    this.disposers.push(
      reaction(
        () => this.totalPrice,
        totalPrice => console.log(\`totalPriceChanged: \${totalPrice}\`)
      )
    );
  }

  @computed
  get productName() {
    return this.props.productName;
  }

  @computed
  get deliveryMethod() {
    return this.props.deliveryMethod;
  }

  @computed
  get totalPrice() {
    return this.deliveryMethod === 'delivery'
      ? this.productPrice + this.deliveryPrice
      : this.productPrice;
  }

  @action
  setProductPrice(value: number) {
    this.productPrice = value;
  }

  @action
  setdDeliveryPrice(value: number) {
    this.deliveryPrice = value;
  }

  dispose() {
    console.log('AdvancedViewModel: dispose');
    this.disposers.forEach(disposer => disposer());
  }
}

const ReactivePropsExampleComponent = observer(
  (props: ExampleComponentProps) => {
    const viewModel = useViewModel(AdvancedViewModel, props);

    return (
      <div>
        <p>Name: {props.productName}</p>
        <p>
          Price:
          <input
            type="number"
            value={viewModel.productPrice}
            onChange={e => viewModel.setProductPrice(Number(e.target.value))}
          />
        </p>

        {viewModel.deliveryMethod === 'delivery' ? (
          <p>
            Delivery Price:
            <input
              type="number"
              value={viewModel.deliveryPrice}
              onChange={e =>
                viewModel.setdDeliveryPrice(Number(e.target.value))
              }
            />
          </p>
        ) : null}

        <p>Total Price: {viewModel.totalPrice}</p>
      </div>
    );
  }
);

export const WithReactiveProps = () => {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    'pickup'
  );

  return (
    <>
      <p>
        Delivery Method:
        <label htmlFor="pickup">
          <input
            name="delivery_method"
            id="pickup"
            type="radio"
            value="pickup"
            checked={deliveryMethod === 'pickup'}
            onChange={() => setDeliveryMethod('pickup')}
          />{' '}
          Pickup
        </label>
        <label htmlFor="delivery">
          <input
            id="delivery"
            name="delivery_method"
            type="radio"
            value="delivery"
            checked={deliveryMethod === 'delivery'}
            onChange={() => setDeliveryMethod('delivery')}
          />
          Delivery
        </label>
      </p>

      <ReactivePropsExampleComponent
        productName="MacBook Pro"
        deliveryMethod={deliveryMethod}
      />
    </>
  );
};
      `,
      language: 'jsx',
      type: 'auto',
    },
  },
};
