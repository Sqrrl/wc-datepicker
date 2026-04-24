import { newSpecPage, SpecPage } from '@stencil/core/testing';
import {
  getDaysOfMonth,
  getISODateString,
  getMonth,
  getWeekDays,
  getYear
} from '../../utils/utils';
import { WCDatepicker } from './wc-datepicker';

function getDisplayedDates(page: SpecPage) {
  return Array.from(
    page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
  ).map((el) => +(el.children[0] as HTMLElement).innerText);
}

function getSelectedMonth(page: SpecPage) {
  return +Array.from(
    page.root
      .querySelector<HTMLSelectElement>('.wc-datepicker__month-select')
      .querySelectorAll('option')
  )
    .find((option) => option.getAttribute('selected') === '')
    .getAttribute('value');
}

function getSelectedYear(page: SpecPage) {
  return +page.root.querySelector<HTMLInputElement>(
    '.wc-datepicker__year-select'
  ).value;
}

function getWeekdaysHeader(page: SpecPage) {
  return Array.from(
    page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__weekday')
  ).map((el) => el.innerText);
}

function triggerKeyDown(page: SpecPage, code: string) {
  page.root
    .querySelector('.wc-datepicker__calendar')
    .dispatchEvent(new KeyboardEvent('keydown', { code }));
}

describe('wc-datepicker', () => {
  it('initially shows the current month', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    const selectedMonth = getSelectedMonth(page);
    const selectedYear = getSelectedYear(page);
    const displayedDates = getDisplayedDates(page);

    expect(selectedMonth).toBe(getMonth(new Date()));
    expect(selectedYear).toBe(getYear(new Date()));

    expect(displayedDates).toEqual(
      getDaysOfMonth(new Date(), true, 7).map((date) => date.getDate())
    );
  });

  it('shows configured start date', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    page.root.startDate = new Date('1989-05-16');
    await page.waitForChanges();

    const selectedMonth = getSelectedMonth(page);
    const selectedYear = getSelectedYear(page);

    expect(selectedMonth).toBe(5);
    expect(selectedYear).toBe(1989);
  });

  it('shows weekday header', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    const weekdaysHeader1 = getWeekdaysHeader(page);

    expect(weekdaysHeader1).toEqual(
      getWeekDays(0, 'en-US').map((weekday) => weekday[0])
    );

    page.root.setAttribute('first-day-of-week', '1');
    await page.waitForChanges();

    const weekdaysHeader2 = getWeekdaysHeader(page);

    expect(weekdaysHeader2).toEqual(
      getWeekDays(1, 'en-US').map((weekday) => weekday[0])
    );

    page.root.setAttribute('locale', 'de-DE');
    await page.waitForChanges();

    const weekdaysHeader3 = getWeekdaysHeader(page);

    expect(weekdaysHeader3).toEqual(
      getWeekDays(1, 'de-DE').map((weekday) => weekday[0])
    );
  });

  it('fires selectDate events', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();

    page.root.startDate = new Date('2022-01-01');
    page.root.addEventListener('selectDate', spy);

    await page.waitForChanges();

    page.root
      .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
      .click();

    triggerKeyDown(page, 'ArrowRight');
    triggerKeyDown(page, 'Space');

    triggerKeyDown(page, 'ArrowDown');
    triggerKeyDown(page, 'Enter');

    triggerKeyDown(page, 'ArrowUp');
    triggerKeyDown(page, 'Enter');

    triggerKeyDown(page, 'ArrowLeft');
    triggerKeyDown(page, 'Enter');

    expect(spy.mock.calls[0][0].detail).toEqual('2021-12-26');
    expect(spy.mock.calls[1][0].detail).toEqual('2021-12-27');
    expect(spy.mock.calls[2][0].detail).toEqual('2022-01-03');
    expect(spy.mock.calls[3][0].detail).toEqual('2021-12-27');
    expect(spy.mock.calls[4][0].detail).toEqual('2021-12-26');

    page.root.setAttribute('range', 'true');
    await page.waitForChanges();

    page.root
      .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
      .click();

    triggerKeyDown(page, 'ArrowRight');
    triggerKeyDown(page, 'Space');

    expect(spy.mock.calls[5][0].detail).toEqual(undefined);
    expect(spy.mock.calls[6][0].detail).toEqual(['2021-11-28']);
    expect(spy.mock.calls[7][0].detail).toEqual(['2021-11-28', '2021-11-29']);

    page.root
      .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
      .click();

    expect(spy.mock.calls[6][0].detail).toEqual(['2021-11-28']);
  });

  it('highlights current date with keyboard selection', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    page.root.startDate = new Date('2022-01-01');

    await page.waitForChanges();

    triggerKeyDown(page, 'ArrowRight');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('2');

    triggerKeyDown(page, 'ArrowRight');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('3');

    triggerKeyDown(page, 'ArrowDown');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('10');

    triggerKeyDown(page, 'ArrowLeft');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('9');

    triggerKeyDown(page, 'ArrowUp');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('2');

    triggerKeyDown(page, 'End');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('31');

    triggerKeyDown(page, 'Home');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('1');

    triggerKeyDown(page, 'PageDown');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('1');

    triggerKeyDown(page, 'PageUp');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('1');
  });

  it('highlights current date with keyboard selection in navigate-weeks mode', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker navigate-weeks></wc-datepicker>`,
      language: 'en'
    });

    page.root.startDate = new Date('2026-04-08');

    await page.waitForChanges();

    triggerKeyDown(page, 'End');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('11');

    triggerKeyDown(page, 'Home');
    await page.waitForChanges();

    expect(
      page.root.querySelector('.wc-datepicker__date--current').children[0]
        .innerHTML
    ).toBe('5');
  });

  it('resets value after range prop is changed', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();

    page.root.addEventListener('selectDate', spy);
    page.root.value = new Date('1989-05-16');

    page.root.setAttribute('range', 'true');

    expect(page.root.value).toBeUndefined();
    expect(spy.mock.calls[0][0].detail).toBeUndefined();
  });

  it('disables dates', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();

    page.root.addEventListener('selectDate', spy);
    page.root.setAttribute('start-date', '2022-01-01');
    page.root.disableDate = (date: Date) =>
      getISODateString(date) === '2022-01-01';

    await page.waitForChanges();

    const dateCell = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-01');

    dateCell.click();

    expect(dateCell.getAttribute('aria-disabled')).toBe('true');
    expect(spy).not.toHaveBeenCalled();
  });

  it('changes months', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('changeMonth', spy);

    const monthSelect = page.root.querySelector<HTMLSelectElement>(
      '.wc-datepicker__month-select'
    );
    const previousMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__previous-month-button'
    );

    const nextMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__next-month-button'
    );

    monthSelect.value = '5';
    monthSelect.dispatchEvent(new Event('change'));

    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({
      month: 5,
      year: 2022,
      day: 1
    });

    previousMonthButton.click();
    await page.waitForChanges();

    expect(spy.mock.calls[1][0].detail).toEqual({
      month: 4,
      year: 2022,
      day: 1
    });

    nextMonthButton.click();
    await page.waitForChanges();

    expect(spy.mock.calls[2][0].detail).toEqual({
      month: 5,
      year: 2022,
      day: 1
    });
  });

  it('clamps date when switching month and date is no longer valid', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-31"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('changeMonth', spy);

    const monthSelect = page.root.querySelector<HTMLSelectElement>(
      '.wc-datepicker__month-select'
    );

    expect(getSelectedMonth(page)).toBe(1);
    expect(getSelectedYear(page)).toBe(2022);

    monthSelect.value = '2';
    monthSelect.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({
      month: 2,
      year: 2022,
      day: 28
    });
  });

  it('clamps date when switching year and date is no longer valid (leap years)', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2020-02-29"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('changeMonth', spy);

    const yearSelect = page.root.querySelector<HTMLInputElement>(
      '.wc-datepicker__year-select'
    );

    yearSelect.value = '2021';
    yearSelect.dispatchEvent(new Event('change'));
    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({
      month: 2,
      year: 2021,
      day: 28
    });
  });

  it('changes year', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker show-year-stepper="true" start-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('changeMonth', spy);

    const yearSelect = page.root.querySelector<HTMLInputElement>(
      '.wc-datepicker__year-select'
    );

    const previousYearButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__previous-year-button'
    );

    const nextYearButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__next-year-button'
    );

    expect(yearSelect.value).toEqual('2022');

    yearSelect.value = '1989';
    yearSelect.dispatchEvent(new Event('change'));

    await page.waitForChanges();

    expect(spy.mock.calls[0][0].detail).toEqual({
      month: 1,
      year: 1989,
      day: 1
    });

    previousYearButton.click();
    await page.waitForChanges();

    expect(yearSelect.value).toEqual('1988');
    expect(spy.mock.calls[1][0].detail).toEqual({
      month: 1,
      year: 1988,
      day: 1
    });

    nextYearButton.click();
    await page.waitForChanges();

    expect(yearSelect.value).toEqual('1989');
    expect(spy.mock.calls[2][0].detail).toEqual({
      month: 1,
      year: 1989,
      day: 1
    });
  });

  it('jumps to current month', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker show-today-button="true" start-date="1989-01-01"></wc-datepicker>`,
      language: 'en'
    });

    const todayButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__today-button'
    );

    const today = new Date();

    const yearSelect = page.root.querySelector<HTMLInputElement>(
      '.wc-datepicker__year-select'
    );

    expect(yearSelect.value).toEqual('1989');

    todayButton.click();
    await page.waitForChanges();

    expect(yearSelect.value).toEqual(today.getFullYear().toString());
  });

  it('clears its value', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker show-clear-button="true" start-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();

    const clearButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__clear-button'
    );

    page.root.addEventListener('selectDate', spy);

    page.root
      .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
      .click();

    expect(spy.mock.calls[0][0].detail).toBe('2021-12-26');

    clearButton.click();
    await page.waitForChanges();

    expect(spy.mock.calls[1][0].detail).toBe(undefined);
  });

  it('can be disabled', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker disabled></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();

    page.root.startDate = new Date('2022-01-01');
    page.root.addEventListener('selectDate', spy);
    page.root.addEventListener('changeMonth', spy);

    await page.waitForChanges();

    page.root
      .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
      .click();

    triggerKeyDown(page, 'ArrowRight');
    triggerKeyDown(page, 'Space');

    expect(
      page.root.children[0].classList.contains('wc-datepicker--disabled')
    ).toBeTruthy();

    expect(spy).not.toHaveBeenCalled();
  });

  it('resets invalid years', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker></wc-datepicker>`,
      language: 'en'
    });

    const yearSelect = page.root.querySelector<HTMLInputElement>(
      '.wc-datepicker__year-select'
    );

    yearSelect.value = '100000';
    yearSelect.dispatchEvent(new Event('change'));

    await page.waitForChanges();

    expect(yearSelect.value).toBe('9999');

    yearSelect.value = '-1';
    yearSelect.dispatchEvent(new Event('change'));

    await page.waitForChanges();

    expect(yearSelect.value).toBe('0');
  });

  it('respects goToRangeStartOnSelect by jumping to start or end of range', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker range></wc-datepicker>`,
      language: 'en'
    });

    const jan1 = new Date('2022-01-01');
    const mar1 = new Date('2022-03-01');

    page.root.goToRangeStartOnSelect = true;
    page.root.value = [jan1, mar1];
    await page.waitForChanges();

    expect(getSelectedMonth(page)).toBe(1);
    expect(getSelectedYear(page)).toBe(2022);

    page.root.goToRangeStartOnSelect = false;
    page.root.value = [jan1, mar1];
    await page.waitForChanges();

    expect(getSelectedMonth(page)).toBe(3);
    expect(getSelectedYear(page)).toBe(2022);
  });

  it('handles mouse hover events for date cells', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker range start-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const mockTarget = {
      closest: jest.fn().mockReturnValue({
        dataset: { date: '2022-01-05' }
      })
    };

    const component = page.rootInstance as WCDatepicker;
    const mockEvent = { target: mockTarget } as unknown as MouseEvent;

    component['onMouseEnter'](mockEvent);
    await page.waitForChanges();

    expect(component['hoveredDate']).toBeDefined();
    expect(component['hoveredDate'].toISOString()).toContain('2022-01-05');

    component['onMouseLeave']();
    await page.waitForChanges();

    expect(component['hoveredDate']).toBeUndefined();
  });

  it('ignores mouse events when disabled', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker disabled range start-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const component = page.rootInstance as WCDatepicker;

    expect(component.disabled).toBe(true);

    const mockTarget = {
      closest: jest.fn().mockReturnValue({
        dataset: { date: '2022-01-05' }
      })
    };

    const mockEvent = { target: mockTarget } as unknown as MouseEvent;

    component['onMouseEnter'](mockEvent);
    await page.waitForChanges();

    expect(component['hoveredDate']).toBeUndefined();
  });

  it('updates current date on focus event', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const component = page.rootInstance as WCDatepicker;
    const initialCurrentDate = component['currentDate'];

    expect(initialCurrentDate.toISOString()).toContain('2022-01-01');

    const mockTarget = {
      dataset: { date: '2022-01-15' }
    };

    const mockEvent = { target: mockTarget } as unknown as FocusEvent;

    component['onFocus'](mockEvent);
    await page.waitForChanges();

    expect(component['currentDate']).toBeDefined();
    expect(component['currentDate'].toISOString()).toContain('2022-01-15');
  });

  it('disables dates before minDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" min-date="2022-01-10"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const jan5 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-05');

    const jan15 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-15');

    expect(jan5.getAttribute('aria-disabled')).toBe('true');
    expect(jan15.getAttribute('aria-disabled')).toBe('false');
  });

  it('disables dates after maxDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" max-date="2022-01-20"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const jan25 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-25');

    const jan15 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-15');

    expect(jan25.getAttribute('aria-disabled')).toBe('true');
    expect(jan15.getAttribute('aria-disabled')).toBe('false');
  });

  it('prevents selecting a date before minDate via click', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" min-date="2022-01-10"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('selectDate', spy);

    await page.waitForChanges();

    const jan5 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-05');

    jan5.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('prevents selecting a date after maxDate via click', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" max-date="2022-01-20"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('selectDate', spy);

    await page.waitForChanges();

    const jan25 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-25');

    jan25.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('prevents selecting an out-of-range date via keyboard', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-10" min-date="2022-01-10" max-date="2022-01-10"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('selectDate', spy);

    await page.waitForChanges();

    triggerKeyDown(page, 'ArrowLeft');
    triggerKeyDown(page, 'Space');

    expect(spy).not.toHaveBeenCalled();

    triggerKeyDown(page, 'ArrowRight');
    triggerKeyDown(page, 'ArrowRight');
    triggerKeyDown(page, 'Enter');

    expect(spy).not.toHaveBeenCalled();
  });

  it('snaps currentDate forward to minDate when startDate is before minDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-01" min-date="2022-03-15"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    expect(getSelectedMonth(page)).toBe(3);
    expect(getSelectedYear(page)).toBe(2022);
  });

  it('snaps currentDate back to maxDate when startDate is after maxDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-06-01" max-date="2022-03-15"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    expect(getSelectedMonth(page)).toBe(3);
    expect(getSelectedYear(page)).toBe(2022);
  });

  it('snaps currentDate when minDate prop changes dynamically', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15"></wc-datepicker>`,
      language: 'en'
    });

    expect(getSelectedMonth(page)).toBe(1);

    page.root.setAttribute('min-date', '2022-06-01');
    await page.waitForChanges();

    expect(getSelectedMonth(page)).toBe(6);
    expect(getSelectedYear(page)).toBe(2022);
  });

  it('snaps currentDate when maxDate prop changes dynamically', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-06-15"></wc-datepicker>`,
      language: 'en'
    });

    expect(getSelectedMonth(page)).toBe(6);

    page.root.setAttribute('max-date', '2022-03-01');
    await page.waitForChanges();

    expect(getSelectedMonth(page)).toBe(3);
    expect(getSelectedYear(page)).toBe(2022);
  });

  it('disables the previous month button when navigating would go below minDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" min-date="2022-01-01"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const previousMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__previous-month-button'
    );

    expect(previousMonthButton.hasAttribute('disabled')).toBe(true);
  });

  it('does not disable the previous month button when previous month contains dates >= minDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-02-15" min-date="2022-01-20"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const previousMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__previous-month-button'
    );

    expect(previousMonthButton.hasAttribute('disabled')).toBe(false);
  });

  it('disables the next month button when navigating would go above maxDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" max-date="2022-01-31"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const nextMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__next-month-button'
    );

    expect(nextMonthButton.hasAttribute('disabled')).toBe(true);
  });

  it('does not disable the next month button when next month contains dates <= maxDate', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" max-date="2022-02-10"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const nextMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__next-month-button'
    );

    expect(nextMonthButton.hasAttribute('disabled')).toBe(false);
  });

  it('works with both minDate and maxDate together', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" min-date="2022-01-10" max-date="2022-01-20"></wc-datepicker>`,
      language: 'en'
    });

    await page.waitForChanges();

    const jan5 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-05');

    const jan15 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-15');

    const jan25 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-25');

    expect(jan5.getAttribute('aria-disabled')).toBe('true');
    expect(jan15.getAttribute('aria-disabled')).toBe('false');
    expect(jan25.getAttribute('aria-disabled')).toBe('true');

    const previousMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__previous-month-button'
    );
    const nextMonthButton = page.root.querySelector<HTMLButtonElement>(
      '.wc-datepicker__next-month-button'
    );

    expect(previousMonthButton.hasAttribute('disabled')).toBe(true);
    expect(nextMonthButton.hasAttribute('disabled')).toBe(true);
  });

  it('allows selecting dates on the minDate and maxDate boundaries', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" min-date="2022-01-10" max-date="2022-01-20"></wc-datepicker>`,
      language: 'en'
    });

    const spy = jest.fn();
    page.root.addEventListener('selectDate', spy);

    await page.waitForChanges();

    const jan10 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-10');

    const jan20 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-20');

    expect(jan10.getAttribute('aria-disabled')).toBe('false');
    expect(jan20.getAttribute('aria-disabled')).toBe('false');

    jan10.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail).toBe('2022-01-10');

    jan20.click();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0].detail).toBe('2022-01-20');
  });

  it('combines minDate/maxDate with the disableDate callback', async () => {
    const page = await newSpecPage({
      components: [WCDatepicker],
      html: `<wc-datepicker start-date="2022-01-15" min-date="2022-01-10" max-date="2022-01-20"></wc-datepicker>`,
      language: 'en'
    });

    page.root.disableDate = (date: Date) =>
      getISODateString(date) === '2022-01-15';

    await page.waitForChanges();

    const jan15 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-15');

    const jan9 = Array.from(
      page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
    ).find((el) => el.dataset.date === '2022-01-09');

    expect(jan15.getAttribute('aria-disabled')).toBe('true');
    expect(jan9.getAttribute('aria-disabled')).toBe('true');
  });

  describe('multi selection', () => {
    it('emits sorted ISO strings for non-consecutive dates', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="multiple" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      const spy = jest.fn();

      page.root.addEventListener('selectDate', spy);
      await page.waitForChanges();

      const jan3 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-03');
      const jan10 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-10');
      const jan1 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-01');

      jan3.click();
      expect(spy.mock.calls[0][0].detail).toEqual(['2022-01-03']);

      jan10.click();
      expect(spy.mock.calls[1][0].detail).toEqual(['2022-01-03', '2022-01-10']);

      jan1.click();
      expect(spy.mock.calls[2][0].detail).toEqual([
        '2022-01-01',
        '2022-01-03',
        '2022-01-10'
      ]);
    });

    it('deselects when clicking a selected date and emits remaining dates sorted', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="multiple" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      const spy = jest.fn();

      page.root.addEventListener('selectDate', spy);
      await page.waitForChanges();

      const jan5 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-05');
      const jan12 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-12');

      jan12.click();
      jan5.click();
      expect(spy.mock.calls[1][0].detail).toEqual(['2022-01-05', '2022-01-12']);

      jan5.click();
      expect(spy.mock.calls[2][0].detail).toEqual(['2022-01-12']);
    });

    it('toggles selection with Space/Enter in multiple mode', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="multiple" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      const spy = jest.fn();

      page.root.addEventListener('selectDate', spy);
      await page.waitForChanges();

      page.root
        .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
        .click();
      expect(spy.mock.calls[0][0].detail).toEqual(['2021-12-26']);

      triggerKeyDown(page, 'ArrowRight');
      triggerKeyDown(page, 'Space');
      expect(spy.mock.calls[1][0].detail).toEqual(['2021-12-26', '2021-12-27']);

      triggerKeyDown(page, 'Enter');
      expect(spy.mock.calls[2][0].detail).toEqual(['2021-12-26']);
    });

    it('sets aria-multiselectable and aria-selected in multiple mode', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="multiple" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      await page.waitForChanges();

      const calendar = page.root.querySelector('.wc-datepicker__calendar');
      expect(calendar.getAttribute('aria-multiselectable')).toBe('true');

      const jan4 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-04');

      jan4.click();
      await page.waitForChanges();

      const jan4After = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-04');

      expect(jan4After.getAttribute('aria-selected')).toBe('true');
    });

    it('resets value when selectionMode changes', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="multiple" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      const spy = jest.fn();

      page.root.addEventListener('selectDate', spy);
      await page.waitForChanges();

      page.root
        .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
        .click();

      expect(spy).toHaveBeenCalled();

      page.root.selectionMode = 'single';
      await page.waitForChanges();

      expect(page.root.value).toBeUndefined();
      expect(
        spy.mock.calls[spy.mock.calls.length - 1][0].detail
      ).toBeUndefined();
    });

    it('does not apply range-only date classes in multiple mode', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="multiple" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      await page.waitForChanges();

      const jan3 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-03');
      const jan10 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-10');

      jan3.click();
      jan10.click();
      await page.waitForChanges();

      const jan5 = Array.from(
        page.root.querySelectorAll<HTMLTableCellElement>('.wc-datepicker__date')
      ).find((el) => el.dataset.date === '2022-01-05');

      expect(jan5.classList.contains('wc-datepicker__date--in-range')).toBe(
        false
      );
      expect(jan5.classList.contains('wc-datepicker__date--start')).toBe(false);
      expect(jan5.classList.contains('wc-datepicker__date--end')).toBe(false);
    });

    it('selectionMode="range" matches two-click range selection', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker selection-mode="range" start-date="2022-01-01"></wc-datepicker>`,
        language: 'en'
      });

      const spy = jest.fn();

      page.root.addEventListener('selectDate', spy);
      await page.waitForChanges();

      page.root
        .querySelector<HTMLTableCellElement>('.wc-datepicker__date')
        .click();

      triggerKeyDown(page, 'ArrowRight');
      triggerKeyDown(page, 'Space');

      expect(spy.mock.calls[0][0].detail).toEqual(['2021-12-26']);
      expect(spy.mock.calls[1][0].detail).toEqual(['2021-12-26', '2021-12-27']);
    });
  });

  describe('slots', () => {
    const slotHtml = {
      nextYear: `<span slot="button-year-next">next year</span>`,
      prevYear: `<span slot="button-year-prev">prev year</span>`,
      nextMonth: `<span slot="button-month-next">next month</span>`,
      prevMonth: `<span slot="button-month-prev">prev month</span>`,
      clear: `<span slot="button-clear">clear</span>`,
      today: `<span slot="button-today">today</span>`
    };

    it('contains slot content if given', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker show-year-stepper show-month-stepper show-clear-button show-today-button>
  ${slotHtml.nextYear}
  ${slotHtml.prevYear}
  ${slotHtml.nextMonth}
  ${slotHtml.prevMonth}
  ${slotHtml.clear}
  ${slotHtml.today}
</wc-datepicker>`,
        language: 'en'
      });

      await page.waitForChanges();

      expect(
        page.root.querySelector('.wc-datepicker__previous-year-button')
          .innerHTML
      ).toContain(slotHtml.prevYear);
      expect(
        page.root.querySelector('.wc-datepicker__previous-month-button')
          .innerHTML
      ).toContain(slotHtml.prevMonth);
      expect(
        page.root.querySelector('.wc-datepicker__next-year-button').innerHTML
      ).toContain(slotHtml.nextYear);
      expect(
        page.root.querySelector('.wc-datepicker__next-month-button').innerHTML
      ).toContain(slotHtml.nextMonth);
      expect(
        page.root.querySelector('.wc-datepicker__today-button').innerHTML
      ).toContain(slotHtml.today);
      expect(
        page.root.querySelector('.wc-datepicker__clear-button').innerHTML
      ).toContain(slotHtml.clear);
    });

    it('not contains slot content if not given', async () => {
      const page = await newSpecPage({
        components: [WCDatepicker],
        html: `<wc-datepicker show-year-stepper show-month-stepper show-clear-button show-today-button></wc-datepicker>`,
        language: 'en'
      });

      await page.waitForChanges();

      expect(
        page.root.querySelector('.wc-datepicker__previous-year-button')
          .innerHTML
      ).not.toContain(slotHtml.prevYear);
      expect(
        page.root.querySelector('.wc-datepicker__previous-month-button')
          .innerHTML
      ).not.toContain(slotHtml.prevMonth);
      expect(
        page.root.querySelector('.wc-datepicker__next-year-button').innerHTML
      ).not.toContain(slotHtml.nextYear);
      expect(
        page.root.querySelector('.wc-datepicker__next-month-button').innerHTML
      ).not.toContain(slotHtml.nextMonth);
      expect(
        page.root.querySelector('.wc-datepicker__today-button').innerHTML
      ).not.toContain(slotHtml.today);
      expect(
        page.root.querySelector('.wc-datepicker__clear-button').innerHTML
      ).not.toContain(slotHtml.clear);
    });
  });
});
