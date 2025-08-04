import { render } from '@testing-library/react';

import UiDashboard from './ui-dashboard';

describe('UiDashboard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UiDashboard />);
    expect(baseElement).toBeTruthy();
  });
});
