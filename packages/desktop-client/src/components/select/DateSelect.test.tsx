import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestProviders } from '#mocks';

import { DateSelect } from './DateSelect';

// August 2020 starts on a Saturday and ends on a Monday, so a Sunday-first
// grid shows July 26-31 in the first row and September 1-5 in the last one.
function renderPicker() {
  const onSelect = vi.fn();
  render(
    <DateSelect
      value="2020-08-10"
      dateFormat="MM/dd/yyyy"
      embedded
      onSelect={onSelect}
    />,
    { wrapper: TestProviders },
  );
  return { onSelect };
}

describe('DateSelect calendar', () => {
  it('selects a day from the previous month', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPicker();

    await user.click(
      screen.getByRole('button', { name: 'Friday, July 31, 2020' }),
    );

    expect(onSelect).toHaveBeenCalledWith('2020-07-31');
  });

  it('selects a day from the next month', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPicker();

    await user.click(
      screen.getByRole('button', { name: 'Tuesday, September 1, 2020' }),
    );

    expect(onSelect).toHaveBeenCalledWith('2020-09-01');
  });

  it('still selects a day from the visible month', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPicker();

    await user.click(
      screen.getByRole('button', { name: /Friday, August 14, 2020/ }),
    );

    expect(onSelect).toHaveBeenCalledWith('2020-08-14');
  });
});
