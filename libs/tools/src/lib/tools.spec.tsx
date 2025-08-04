import { render } from '@testing-library/react';

import Tools from './tools';

describe('Tools', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Tools />);
    expect(baseElement).toBeTruthy();
  });
});
