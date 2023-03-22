# mobx-react-viewmodel

Tiny package (~0.9 KB) which can make a huge difference for your React/Mobx app architecture.

Simple hooks `useViewModel` and `useViewModelFactory` allow you to move all component's state and logic from the render function to a separate stateful view-model class. Which unleashes the full power of Mobx and helps you escape React Hooks Hell. 

Written in TypeScript and 100% type-safe 🎯

## Installation

```
npm install mobx-react-viewmodel --save
```

or 

```
yarn add mobx-react-viewmodel
```

## Simple Example

```typescript
import { observer } from 'mobx-react'
import { useViewModel } from 'mobx-react-viewmodel'

class MyViewModel {
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

const MyComponent = observer(() => {
  const viewModel = useViewModel(MyViewModel); // MyViewModel instance will be created only once on first render 

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
```

## Benefits

- View-layer (component's render function) stays clean and contains only rendering code
- Taking full advantage of Mobx using `@observable / @computed / @action / reaction / when` primitives for powerful reactive programming
- No need to use `useState / useEffects / useCallback / useMemo` anymore (goodbye spaghetti code, `stale closure` bugs and dependency list for every hook)
- At some point, if you need to move some component's state to a global Mobx-store, you don't have to rewrite old hooks-code with Mobx. You can just cut and paste what you need from view-model class to the store class

## Advanced Example

```typescript
// MyPageViewModel.ts

import { action, comparer, computed, makeObservable, observable, reaction } from 'mobx';
import { User, UsersStore } from 'our/users/module'

interface MyPageViewModelProps {
  userId: string;
}

class MyPageViewModel extends ViewModel<MyPageViewModelProps> {
  @observable
  user?: User;

  constructor(props: MyPageViewModelProps, private usersStore: UsersStore) {
    super(props);
    makeObservable(this);

    this.disposers.push(
      reaction(
        () => this.props.userId,
        userId => this.getUserFromStore(userId),
        { fireImmediately: true }
      )
    );
  }

  @action
  updateField = (field: keyof User, value: string) => {
    if (!this.user) return;
    this.user[field] = value;
  }

  @action
  save = () => {
    if (!this.user) return;
    this.usersStore.updateUser(this.user);
  }

  @computed
  isPristine() {
    const storeUser = this.usersStore.getUser(this.props.userId);
    return this.user && storeUser && comparer.shallow(this.user, storeUser);
  }

  @action
  private getUserFromStore = (userId: string) => {
    const user = this.usersStore.getUser(userId);
    if (user) {
      this.user = { ...user };
    } else {
      console.error(`Couldn't find user: ${userId}`);
    }
  }
}
```

```typescript
// MyPage.tsx

import { observer } from 'mobx-react'
import { useViewModel } from 'mobx-react-viewmodel'
import { useParams } from 'react-router-dom';

const MyPage = observer(() => {
  // Get the userId param from the URL.
  const { userId } = useParams();
  const viewModel = useViewModelFactory(
    props => new MyPageViewModel(props, userStore), // Factory-function will be called only once on first render
    { userId } // These `props` are reactive. It will be passed and updated in view-model every time it changes without creating new instance of view-model 
  );

  return (
    <div>
      <input
        type="text"
        value={viewModel.user.first_name}
        onChange={e => viewModel.updateField('first_name', e.target.value)}
        placeholder="First Name"
      />
      
      <input
        type="text"
        value={viewModel.user.last_name}
        onChange={e => viewModel.updateField('last_name', e.target.value)}
        placeholder="Last Name"
      />
      
      <button type="button" disabled={viewModel.isPristine} onClick={viewModel.save}>Save</button>
    </div>
  );
});
```

You can find more examples [here](https://iverson.github.io/mobx-react-viewmodel).

## API documentation

### `useViewModel(ViewModelClass, props?)`

Basic hook that creates an instance of the `ViewModelClass` on the first render and keeps it alive during all further renders.
If `props` is passed, it will be set to the ViewModelClass instance `props` property every time it changes.
If `ViewModelClass` implements `init()` or `dispose()` methods, they will be called on the component's `mount` and `unmount` events. 

### `useViewModelFactory(factoryFn, props?)`

Hook for more advanced view-model instantiation. It allows to inject extra dependencies to the view-model constructor inside the custom `factoryFn`. Life-cycle and `props` update logic is the same as with `useViewModel`

### `ViewModel`

Base class with observable `props` property which is automatically updated by `useViewModel` or `useViewModelFactory`. Also, it has a built-in `disposers` array for storing all disposer-functions from `reaction`, `when`, or any other custom ones that you need to call on `unmount`. You can extend your custom view-model classes from this class for cutting down boilerplate code.
