import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
  Watch
} from '@stencil/core';
import {
  addDays,
  getDaysOfMonth,
  getFirstOfMonth,
  getISODateString,
  getLastOfMonth,
  getMonth,
  getMonths,
  getNextDay,
  getNextMonth,
  getNextYear,
  getPreviousDay,
  getPreviousMonth,
  getPreviousYear,
  getWeekDays,
  getYear,
  isDateInRange,
  isSameDay,
  removeTimezoneOffset,
  subDays
} from '../../utils/utils';

export type WCDatepickerLabels = {
  clearButton: string;
  monthSelect: string;
  nextMonthButton: string;
  nextYearButton: string;
  picker: string;
  previousMonthButton: string;
  previousYearButton: string;
  todayButton: string;
  yearSelect: string;
};

const defaultLabels: WCDatepickerLabels = {
  clearButton: 'Clear value',
  monthSelect: 'Select month',
  nextMonthButton: 'Next month',
  nextYearButton: 'Next year',
  picker: 'Choose date',
  previousMonthButton: 'Previous month',
  previousYearButton: 'Previous year',
  todayButton: 'Show today',
  yearSelect: 'Select year'
};

export interface MonthChangedEventDetails {
  month: number;
  year: number;
  day: number;
}

@Component({
  scoped: true,
  shadow: false,
  styleUrl: 'wc-datepicker.css',
  tag: 'wc-datepicker'
})
export class WCDatepicker {
  @Element() el: HTMLElement;

  @Prop() clearButtonContent?: string;
  @Prop() disabled?: boolean = false;
  @Prop() disableDate?: (date: Date) => boolean = () => false;
  @Prop() elementClassName?: string = 'wc-datepicker';
  @Prop() firstDayOfWeek?: number = 0;
  @Prop() range?: boolean;
  @Prop() labels?: WCDatepickerLabels = defaultLabels;
  @Prop() locale?: string = navigator?.language || 'en-US';
  @Prop() nextMonthButtonContent?: string;
  @Prop() nextYearButtonContent?: string;
  @Prop() previousMonthButtonContent?: string;
  @Prop() previousYearButtonContent?: string;
  @Prop() showClearButton?: boolean = false;
  @Prop() showMonthStepper?: boolean = true;
  @Prop() showTodayButton?: boolean = false;
  @Prop() showYearStepper?: boolean = false;
  @Prop() startDate?: string = getISODateString(new Date());
  @Prop() todayButtonContent?: string;
  @Prop({ mutable: true }) value?: Date | Date[];
  @Prop() maxSearchDays?: number = 365;
  @Prop() goToRangeStartOnSelect?: boolean = true;

  @State() currentDate: Date;
  @State() hoveredDate: Date;
  @State() weekdays: string[][];

  @Event() selectDate: EventEmitter<string | string[] | undefined>;
  @Event() changeMonth: EventEmitter<MonthChangedEventDetails>;

  private moveFocusAfterMonthChanged: Boolean;

  componentWillLoad() {
    this.init();
  }

  @Watch('firstDayOfWeek')
  watchFirstDayOfWeek() {
    this.updateWeekdays();
  }

  @Watch('locale')
  watchLocale() {
    if (!Boolean(this.locale)) {
      this.locale = navigator?.language || 'en-US';
    }

    this.updateWeekdays();
  }

  @Watch('range')
  watchRange() {
    this.value = undefined;
    this.selectDate.emit(undefined);
  }

  @Watch('startDate')
  watchStartDate() {
    this.currentDate = this.startDate
      ? removeTimezoneOffset(new Date(this.startDate))
      : new Date();
  }

  @Watch('value')
  watchValue() {
    if (!Boolean(this.value)) {
      return;
    }

    if (Array.isArray(this.value)) {
      this.currentDate =
        this.value.length > 1 && !this.goToRangeStartOnSelect
          ? this.value[1]
          : this.value[0];
    } else if (this.value instanceof Date) {
      this.currentDate = this.value;
    }
  }

  componentDidRender() {
    if (this.moveFocusAfterMonthChanged) {
      this.focusDate(this.currentDate);
      this.moveFocusAfterMonthChanged = false;
    }
  }

  private init = () => {
    this.currentDate = this.startDate
      ? removeTimezoneOffset(new Date(this.startDate))
      : new Date();
    this.updateWeekdays();
  };

  private updateWeekdays() {
    this.weekdays = getWeekDays(
      this.firstDayOfWeek === 0 ? 7 : this.firstDayOfWeek,
      this.locale
    );
  }

  private getClassName(element?: string) {
    return Boolean(element)
      ? `${this.elementClassName}__${element}`
      : this.elementClassName;
  }

  private getCalendarRows(): Date[][] {
    const daysOfMonth = getDaysOfMonth(
      this.currentDate,
      true,
      this.firstDayOfWeek === 0 ? 7 : this.firstDayOfWeek
    );

    const calendarRows: Date[][] = [];

    for (let i = 0; i < daysOfMonth.length; i += 7) {
      const row = daysOfMonth.slice(i, i + 7);
      calendarRows.push(row);
    }

    return calendarRows;
  }

  private getTitle() {
    if (!Boolean(this.value)) {
      return;
    }

    if (this.isRangeValue(this.value)) {
      const startDate = Intl.DateTimeFormat(this.locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(this.value[0]);
      const endDate = this.value[1]
        ? Intl.DateTimeFormat(this.locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(this.value[1])
        : undefined;

      if (Boolean(endDate)) {
        return `${startDate} - ${endDate}`;
      } else {
        return startDate;
      }
    } else {
      return Intl.DateTimeFormat(this.locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(this.value);
    }
  }

  private focusDate(date: Date) {
    this.el
      .querySelector<HTMLTableCellElement>(
        `[data-date="${getISODateString(date)}"]`
      )
      ?.focus();
  }

  private updateCurrentDate(date: Date, moveFocus?: boolean) {
    const month = date.getMonth();
    const year = date.getFullYear();

    if (year > 9999 || year < 0) {
      return;
    }

    const monthChanged =
      month !== this.currentDate.getMonth() ||
      year !== this.currentDate.getFullYear();

    if (monthChanged) {
      this.changeMonth.emit({
        month: getMonth(date),
        year: getYear(date),
        day: date.getDate()
      });

      if (moveFocus) {
        this.moveFocusAfterMonthChanged = true;
      }
    }

    this.currentDate = date;

    if (moveFocus) {
      this.focusDate(this.currentDate);
    }
  }

  private onSelectDate(date: Date) {
    if (this.disableDate(date)) {
      return;
    }

    if (this.isRangeValue(this.value)) {
      const newValue =
        this.value?.[0] === undefined || this.value.length === 2
          ? [date]
          : [this.value[0], date];

      if (newValue.length === 2 && newValue[0] > newValue[1]) {
        newValue.reverse();
      }

      const isoValue =
        newValue[1] === undefined
          ? [getISODateString(newValue[0])]
          : [getISODateString(newValue[0]), getISODateString(newValue[1])];

      this.value = newValue;
      this.selectDate.emit(isoValue);
    } else {
      if (this.value?.getTime() === date.getTime()) {
        return;
      }

      this.value = date;
      this.selectDate.emit(getISODateString(date));
    }
  }

  // @ts-ignore
  private isRangeValue(value: Date | Date[]): value is Date[] {
    return this.range;
  }

  private getAvailableDate = (
    date: Date,
    direction:
      | 'previousDay'
      | 'nextDay'
      | 'previousSameWeekDay'
      | 'nextSameWeekDay'
      | 'firstOfMonth'
      | 'lastOfMonth'
      | 'previousMonth'
      | 'nextMonth'
      | 'previousYear'
      | 'nextYear'
  ) => {
    let potentialDate;
    let outOfRange = false;

    switch (direction) {
      case 'previousDay':
        potentialDate = getPreviousDay(date);
        break;
      case 'nextDay':
        potentialDate = getNextDay(date);
        break;
      case 'previousSameWeekDay':
        potentialDate = subDays(date, 7);
        break;
      case 'nextSameWeekDay':
        potentialDate = addDays(date, 7);
        break;
      case 'firstOfMonth':
        potentialDate = getFirstOfMonth(date);
        break;
      case 'lastOfMonth':
        potentialDate = getLastOfMonth(date);
        break;
      case 'previousMonth':
        potentialDate = getPreviousMonth(date);
        break;
      case 'nextMonth':
        potentialDate = getNextMonth(date);
        break;
      case 'previousYear':
        potentialDate = getPreviousYear(date);
        break;
      case 'nextYear':
        potentialDate = getNextYear(date);
        break;
    }

    while (this.disableDate(potentialDate) && !outOfRange) {
      switch (direction) {
        case 'previousDay':
        case 'lastOfMonth':
          potentialDate = getPreviousDay(potentialDate);
          break;
        case 'nextDay':
        case 'firstOfMonth':
        case 'previousMonth':
        case 'nextMonth':
        case 'previousYear':
        case 'nextYear':
          potentialDate = getNextDay(potentialDate);
          break;
        case 'previousSameWeekDay':
          potentialDate = subDays(potentialDate, 7);
          break;
        case 'nextSameWeekDay':
          potentialDate = addDays(potentialDate, 7);
          break;
      }

      switch (direction) {
        case 'firstOfMonth':
        case 'lastOfMonth':
        case 'previousYear':
        case 'nextYear':
          outOfRange = potentialDate.getMonth() !== date.getMonth();
          break;
        case 'previousMonth':
          outOfRange = potentialDate.getMonth() !== date.getMonth() - 1;
          break;
        case 'nextMonth':
          outOfRange = potentialDate.getMonth() !== date.getMonth() + 1;
          break;
        default:
          outOfRange = !isDateInRange(potentialDate, {
            from: subDays(date, this.maxSearchDays),
            to: addDays(date, this.maxSearchDays)
          });
          break;
      }
    }

    if (outOfRange) {
      return date;
    }

    return potentialDate;
  };

  private nextMonth = () => {
    this.updateCurrentDate(getNextMonth(this.currentDate));
  };

  private nextYear = () => {
    this.updateCurrentDate(getNextYear(this.currentDate));
  };

  private previousMonth = () => {
    this.updateCurrentDate(getPreviousMonth(this.currentDate));
  };

  private previousYear = () => {
    this.updateCurrentDate(getPreviousYear(this.currentDate));
  };

  private showToday = () => {
    this.updateCurrentDate(new Date());
  };

  private clear = () => {
    this.value = undefined;
    this.selectDate.emit(undefined);
  };

  private onClick = (event: Event) => {
    if (this.disabled) {
      return;
    }

    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-date]'
    );

    if (!Boolean(target)) {
      return;
    }

    const date = removeTimezoneOffset(new Date(target.dataset.date));

    this.updateCurrentDate(date);
    this.onSelectDate(date);
  };

  private onMonthSelect = (event: Event) => {
    const month = +(event.target as HTMLSelectElement).value - 1;
    const currentDay = this.currentDate.getDate();
    const targetDate = new Date(this.currentDate.getFullYear(), month, 1);
    const lastDayOfTargetMonth = getLastOfMonth(targetDate).getDate();
    const clampedDay = Math.min(currentDay, lastDayOfTargetMonth);
    const updatedDate = new Date(
      this.currentDate.getFullYear(),
      month,
      clampedDay
    );

    this.updateCurrentDate(updatedDate);
  };

  private onYearSelect = (event: Event) => {
    let year = +(event.target as HTMLSelectElement).value;
    const input = event.target as HTMLInputElement;

    if (isNaN(year)) {
      year = new Date().getFullYear();
      input.value = String(year);
    } else if (year < 0) {
      year = 0;
      input.value = String(year);
    } else if (year > 9999) {
      year = 9999;
      input.value = String(year);
    }

    const currentDay = this.currentDate.getDate();
    const currentMonth = this.currentDate.getMonth();
    const targetDate = new Date();

    targetDate.setFullYear(year, currentMonth, 1);

    const lastDayOfTargetMonth = getLastOfMonth(targetDate).getDate();
    const clampedDay = Math.min(currentDay, lastDayOfTargetMonth);
    const updatedDate = new Date();

    updatedDate.setFullYear(year, currentMonth, clampedDay);

    this.updateCurrentDate(updatedDate);
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.disabled) {
      return;
    }

    if (event.code === 'ArrowLeft') {
      event.preventDefault();
      this.updateCurrentDate(
        this.getAvailableDate(this.currentDate, 'previousDay'),
        true
      );
    } else if (event.code === 'ArrowRight') {
      event.preventDefault();
      this.updateCurrentDate(
        this.getAvailableDate(this.currentDate, 'nextDay'),
        true
      );
    } else if (event.code === 'ArrowUp') {
      event.preventDefault();
      this.updateCurrentDate(
        this.getAvailableDate(this.currentDate, 'previousSameWeekDay'),
        true
      );
    } else if (event.code === 'ArrowDown') {
      event.preventDefault();
      this.updateCurrentDate(
        this.getAvailableDate(this.currentDate, 'nextSameWeekDay'),
        true
      );
    } else if (event.code === 'PageUp') {
      event.preventDefault();

      if (event.shiftKey) {
        this.updateCurrentDate(
          this.getAvailableDate(this.currentDate, 'previousYear'),
          true
        );
      } else {
        this.updateCurrentDate(
          this.getAvailableDate(this.currentDate, 'previousMonth'),
          true
        );
      }
    } else if (event.code === 'PageDown') {
      event.preventDefault();

      if (event.shiftKey) {
        this.updateCurrentDate(
          this.getAvailableDate(this.currentDate, 'nextYear'),
          true
        );
      } else {
        this.updateCurrentDate(
          this.getAvailableDate(this.currentDate, 'nextMonth'),
          true
        );
      }
    } else if (event.code === 'Home') {
      event.preventDefault();
      this.updateCurrentDate(
        this.getAvailableDate(this.currentDate, 'firstOfMonth'),
        true
      );
    } else if (event.code === 'End') {
      event.preventDefault();
      this.updateCurrentDate(
        this.getAvailableDate(this.currentDate, 'lastOfMonth'),
        true
      );
    } else if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.onSelectDate(this.currentDate);
    }
  };

  private onMouseEnter = (event: MouseEvent) => {
    if (this.disabled) {
      return;
    }

    const date = removeTimezoneOffset(
      new Date((event.target as HTMLElement).closest('td').dataset.date)
    );

    this.hoveredDate = date;
  };

  private onMouseLeave = () => {
    this.hoveredDate = undefined;
  };

  private onFocus = (event: FocusEvent) => {
    const date = new Date((event.target as HTMLElement).dataset.date);

    if (!isSameDay(date, this.currentDate)) {
      this.updateCurrentDate(date);
    }
  };

  render() {
    const showFooter = this.showTodayButton || this.showClearButton;

    return (
      <Host>
        <div
          aria-disabled={String(this.disabled)}
          aria-label={this.labels.picker}
          class={{
            [this.getClassName()]: true,
            [`${this.getClassName()}--disabled`]: this.disabled
          }}
          role="group"
        >
          <div class={this.getClassName('header')}>
            <span aria-atomic="true" aria-live="polite" class="visually-hidden">
              {this.getTitle()}
            </span>
            {this.showYearStepper && (
              <button
                aria-label={this.labels.previousYearButton}
                class={this.getClassName('previous-year-button')}
                disabled={this.disabled}
                innerHTML={this.previousYearButtonContent || undefined}
                onClick={this.previousYear}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="11 17 6 12 11 7"></polyline>
                  <polyline points="18 17 13 12 18 7"></polyline>
                </svg>
              </button>
            )}
            {this.showMonthStepper && (
              <button
                aria-label={this.labels.previousMonthButton}
                class={this.getClassName('previous-month-button')}
                disabled={this.disabled}
                innerHTML={this.previousMonthButtonContent || undefined}
                onClick={this.previousMonth}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}
            <span class={this.getClassName('current-month')}>
              <select
                title={this.labels.monthSelect}
                aria-label={this.labels.monthSelect}
                class={this.getClassName('month-select')}
                disabled={this.disabled}
                name="month"
                onChange={this.onMonthSelect}
              >
                {getMonths(this.locale).map((month, index) => (
                  <option
                    key={month}
                    selected={this.currentDate.getMonth() === index}
                    value={index + 1}
                  >
                    {month}
                  </option>
                ))}
              </select>
              <input
                title={this.labels.yearSelect}
                aria-label={this.labels.yearSelect}
                class={this.getClassName('year-select')}
                disabled={this.disabled}
                max={9999}
                maxLength={4}
                min={1}
                name="year"
                onChange={this.onYearSelect}
                type="number"
                value={this.currentDate.getFullYear()}
              />
            </span>
            {this.showMonthStepper && (
              <button
                aria-label={this.labels.nextMonthButton}
                class={this.getClassName('next-month-button')}
                disabled={this.disabled}
                innerHTML={this.nextMonthButtonContent || undefined}
                onClick={this.nextMonth}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
            {this.showYearStepper && (
              <button
                aria-label={this.labels.nextYearButton}
                class={this.getClassName('next-year-button')}
                disabled={this.disabled}
                innerHTML={this.nextYearButtonContent || undefined}
                onClick={this.nextYear}
                type="button"
              >
                <svg
                  fill="none"
                  height="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <polyline points="13 17 18 12 13 7"></polyline>
                  <polyline points="6 17 11 12 6 7"></polyline>
                </svg>
              </button>
            )}
          </div>

          <div class={this.getClassName('body')}>
            <table
              class={this.getClassName('calendar')}
              onKeyDown={this.onKeyDown}
              role="grid"
            >
              <thead class={this.getClassName('calendar-header')}>
                <tr class={this.getClassName('weekday-row')}>
                  {this.weekdays.map((weekday) => (
                    <th
                      aria-label={weekday[1]}
                      abbr={weekday[1]}
                      class={this.getClassName('weekday')}
                      key={weekday[0]}
                      scope="col"
                    >
                      <span>{weekday[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {this.getCalendarRows().map((calendarRow) => {
                  const rowKey = `row-${calendarRow[0].getMonth()}-${calendarRow[0].getDate()}`;

                  return (
                    <tr class={this.getClassName('calendar-row')} key={rowKey}>
                      {calendarRow.map((day) => {
                        const isCurrent = isSameDay(day, this.currentDate);

                        const isOverflowing =
                          day.getMonth() !== this.currentDate.getMonth();

                        const isSelected = Array.isArray(this.value)
                          ? isSameDay(day, this.value[0]) ||
                            isSameDay(day, this.value[1])
                          : isSameDay(day, this.value);

                        const isInRange = !this.isRangeValue
                          ? false
                          : isDateInRange(day, {
                              from: this.value?.[0],
                              to:
                                this.value?.[1] ||
                                this.hoveredDate ||
                                this.currentDate
                            });

                        const orderedValues = Boolean(this.value?.[0])
                          ? [
                              this.value?.[0],
                              this.value?.[1] || this.hoveredDate
                            ].sort((a, b) => a - b)
                          : [];

                        const isStart =
                          this.range && isSameDay(orderedValues[0], day);

                        const isEnd =
                          this.range && isSameDay(orderedValues[1], day);

                        const isToday = isSameDay(day, new Date());

                        const isDisabled = this.disableDate(day);

                        const cellKey = `cell-${day.getMonth()}-${day.getDate()}`;

                        const className = {
                          [this.getClassName('date')]: true,
                          [this.getClassName('date--current')]: isCurrent,
                          [this.getClassName('date--disabled')]: isDisabled,
                          [this.getClassName('date--overflowing')]:
                            isOverflowing,
                          [this.getClassName('date--today')]: isToday,
                          [this.getClassName('date--selected')]: isSelected,
                          [this.getClassName('date--in-range')]: isInRange,
                          [this.getClassName('date--start')]: isStart,
                          [this.getClassName('date--end')]: isEnd
                        };

                        const Tag = isSelected
                          ? 'strong'
                          : isToday
                          ? 'em'
                          : 'span';

                        return (
                          <td
                            aria-disabled={String(isDisabled)}
                            aria-selected={isSelected ? 'true' : undefined}
                            /**
                             * MacOS VoiceOver has a known issue with
                             * announcing aria-selected on gridcells. We are
                             * setting aria-current as a workaround to make
                             * sure selected dates are announced.
                             */
                            aria-current={
                              isToday ? 'date' : isSelected ? 'true' : undefined
                            }
                            class={className}
                            data-date={getISODateString(day)}
                            key={cellKey}
                            onClick={this.onClick}
                            onMouseEnter={this.onMouseEnter}
                            onMouseLeave={this.onMouseLeave}
                            onFocus={this.onFocus}
                            role="gridcell"
                            tabIndex={
                              isSameDay(day, this.currentDate) && !this.disabled
                                ? 0
                                : -1
                            }
                          >
                            <Tag aria-hidden="true">{day.getDate()}</Tag>
                            <span class="visually-hidden">
                              {Intl.DateTimeFormat(this.locale, {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              }).format(day)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {showFooter && (
            <div class={this.getClassName('footer')}>
              {this.showTodayButton && (
                <button
                  class={this.getClassName('today-button')}
                  disabled={this.disabled}
                  innerHTML={this.todayButtonContent || undefined}
                  onClick={this.showToday}
                  type="button"
                >
                  {this.labels.todayButton}
                </button>
              )}
              {this.showClearButton && (
                <button
                  class={this.getClassName('clear-button')}
                  disabled={this.disabled}
                  innerHTML={this.clearButtonContent || undefined}
                  onClick={this.clear}
                  type="button"
                >
                  {this.labels.clearButton}
                </button>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
