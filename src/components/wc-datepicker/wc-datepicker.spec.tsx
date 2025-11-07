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
});
