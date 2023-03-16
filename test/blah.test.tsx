import { render } from '@testing-library/react';

import * as useViewModelStories from '../stories/useViewModel.stories';
import React from 'react';
import * as useViewModelFactoryStories from '../stories/useViewModelFactory.stories';

describe('Thing', () => {
  it('renders without crashing', () => {
    const _stories: Omit<typeof useViewModelStories, 'default'> = {
      ...useViewModelStories,
      ...useViewModelFactoryStories,
    };

    Object.entries(_stories)
      .filter(([name]) => name !== 'default')
      .forEach(([_, story]) => {
        const Story: any = story;
        const args = Story['args'];
        const result = render(<Story {...args} />);

        expect(result).toBeDefined();
      });
  });
});
