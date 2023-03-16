import React from 'react';
import { computed, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';

import { useViewModelFactory } from '../src/useViewModel';

export default {
  title: 'useViewModelFactory',
  parameters: {
    docs: {
      description: {
        component: `Advanced hook for creating stateful view-model instance manualy. You can pass custom arguments to the view-model constructor.
          It might be useful for Dependency Injection.`,
      },
    },
  },
};

/// ------------------------------------------
// Example of view-модели with Dependency Injection
//
type User = {
  id: string;
  name: string;
};
class UsersStore {
  private users: Record<string, User> = {
    'user-1-id': {
      id: 'user-1-id',
      name: 'user-1-name',
    },
  };

  getUser(id: string): User | undefined {
    return this.users[id];
  }
}
const userStore = new UsersStore();

interface AdvancedDIViewModelProps {
  userId: string;
}
class AdvancedDIViewModel {
  @observable.ref
  props: AdvancedDIViewModelProps;

  private usersStore: UsersStore;

  constructor(props: AdvancedDIViewModelProps, usersStore: UsersStore) {
    makeObservable(this);
    this.props = props;
    this.usersStore = usersStore;
  }

  @computed
  get user() {
    return this.usersStore.getUser(this.props.userId);
  }
}

const AdvancedDIExample = observer(function AdvancedDIExample$() {
  // Pass userStore to view-model via factory-hook
  const viewModel = useViewModelFactory(
    props => new AdvancedDIViewModel(props, userStore),
    { userId: 'user-1-id' }
  );

  return (
    <div>
      <p>User from UsersStore: </p>
      <pre>{viewModel.user ? JSON.stringify(viewModel.user) : '-'}</pre>
    </div>
  );
});

export const WithDependencyInjection = () => {
  return <AdvancedDIExample />;
};
WithDependencyInjection.parameters = {
  controls: { expanded: true },
  docs: {
    source: {
      code: `
type User = {
  id: string;
  name: string;
};
class UsersStore {
  private users: Record<string, User> = {
    'user-1-id': {
      id: 'user-1-id',
      name: 'user-1-name',
    },
  };

  getUser(id: string): User | undefined {
    return this.users[id];
  }
}
const userStore = new UsersStore();

interface AdvancedDIViewModelProps {
  userId: string;
}
class AdvancedDIViewModel {
  @observable.ref
  props: AdvancedDIViewModelProps;

  private usersStore: UsersStore;

  constructor(props: AdvancedDIViewModelProps, usersStore: UsersStore) {
    makeObservable(this);
    this.props = props;
    this.usersStore = usersStore;
  }

  @computed
  get user() {
    return this.usersStore.getUser(this.props.userId);
  }
}

const AdvancedDIExample = observer(function AdvancedDIExample$() {
  // Pass userStore to view-model via factory-hook
  const viewModel = useViewModelFactory(
    props => new AdvancedDIViewModel(props, userStore),
    { userId: 'user-1-id' }
  );

  return (
    <div>
      <p>User from UsersStore: </p>
      <pre>{viewModel.user ? JSON.stringify(viewModel.user) : '-'}</pre>
    </div>
  );
});
      `,
      language: 'jsx',
      type: 'auto',
    },
  },
};
