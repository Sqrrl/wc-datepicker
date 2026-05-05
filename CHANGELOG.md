# wc-datepicker

## 0.12.0

### Minor Changes

- [#75](https://github.com/Sqrrl/wc-datepicker/pull/75) [`eea4f33`](https://github.com/Sqrrl/wc-datepicker/commit/eea4f33acf47b457e3d3d2254962d42a89ec0cf6) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Disable the year stepper and month options according to the min-date and max-date attributes

## 0.11.0

### Minor Changes

- [#68](https://github.com/Sqrrl/wc-datepicker/pull/68) [`8ad11c5`](https://github.com/Sqrrl/wc-datepicker/commit/8ad11c58df947d891b5a07268b6a2e4d21709dbd) Thanks [@babielmam](https://github.com/babielmam)! - Add slots for buttons' content (customizability)

  > **Note**: The undocumented props `todayButtonContent` and `clearButtonContent` have been removed in favor of the new slots.

- [#67](https://github.com/Sqrrl/wc-datepicker/pull/67) [`dabc33e`](https://github.com/Sqrrl/wc-datepicker/commit/dabc33ee4dac7a4aa0bef8440689a2082c67bd8b) Thanks [@babielmam](https://github.com/babielmam)! - Add property to shift focus to start or end of week instead of month, when pressing Home or End (accessibility)

### Patch Changes

- [#67](https://github.com/Sqrrl/wc-datepicker/pull/67) [`ee15fc1`](https://github.com/Sqrrl/wc-datepicker/commit/ee15fc1c159b7a7f68bd52b12df5db906730614b) Thanks [@babielmam](https://github.com/babielmam)! - Set `aria-multiselectable` when `range`-option is used (accessibility)

- [#67](https://github.com/Sqrrl/wc-datepicker/pull/67) [`7f8c762`](https://github.com/Sqrrl/wc-datepicker/commit/7f8c762bbeb77e63fd34be433ef1b1bfc940e619) Thanks [@babielmam](https://github.com/babielmam)! - Set `aria-label` on `role=grid` (accessibility)

## 0.10.0

### Minor Changes

- [`499874d`](https://github.com/Sqrrl/wc-datepicker/commit/499874df7ea680ebd9272d1dd5cf7e35692f0a26) Thanks [@NovaCat35](https://github.com/NovaCat35)! - Add min-date and max-date attributes

## 0.9.5

### Patch Changes

- [`c84161a`](https://github.com/Sqrrl/wc-datepicker/commit/c84161a179ea70e08fab09bd230f6a4ffee141e8) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Fix selection of overflow dates via click

- [`3ed811e`](https://github.com/Sqrrl/wc-datepicker/commit/3ed811ebe4de1bfc7b0fbd025ed5d79b4c81a08c) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Remove name attributes from navigational month and year inputs

## 0.9.4

### Patch Changes

- [`9df4fca`](https://github.com/Sqrrl/wc-datepicker/commit/9df4fca6f886669470fb2f73b6185c4ae04eb4c1) Thanks [@boycarper](https://github.com/boycarper)! - Fix focus handling issue in AT browse mode

## 0.9.3

### Patch Changes

- [`9ea45dd`](https://github.com/Sqrrl/wc-datepicker/commit/9ea45dd00199764396d19d47d2d19b5de9fd09b5) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Let screen readers announce the year when navigating date cells; fix an issue causing VoiceOver to not announce the currently selected date when focused.

## 0.9.2

### Patch Changes

- [`b0b86c1`](https://github.com/Sqrrl/wc-datepicker/commit/b0b86c17401541a5c2f73c0b73397e3363f2820a) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Fix an issue preventing a user to change the month or year

## 0.9.1

### Patch Changes

- [#47](https://github.com/Sqrrl/wc-datepicker/pull/47) [`bae1ce1`](https://github.com/Sqrrl/wc-datepicker/commit/bae1ce1d53701f3b58b64448ce5172e013c6b4a6) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Make sure the calendar can retrieve focus, even if the current date is disabled.

## 0.9.0

### Minor Changes

- [`430ec92`](https://github.com/Sqrrl/wc-datepicker/commit/430ec9267f2b45374ced427a7850516c9d31faeb) Thanks [@Exigerr](https://github.com/Exigerr)! - Add "day" property to "changeMonth" event

## 0.8.1

### Patch Changes

- [`efdbea4`](https://github.com/Sqrrl/wc-datepicker/commit/efdbea41d7b9f11455b03374ffe693db3c053be3) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Limit weekday labels to 3 characters to prevent overflow

## 0.8.0

### Minor Changes

- [`975dea0`](https://github.com/Sqrrl/wc-datepicker/commit/975dea04c6b66bc78feadf37522a9d3d7234e63c) Thanks [@broileri](https://github.com/broileri)! - Add goToRangeStartOnSelect prop

## 0.7.0

### Minor Changes

- [`c75cb2b`](https://github.com/Sqrrl/wc-datepicker/commit/c75cb2bc3ea2fc7782a85ff73f6cf081e7881784) Thanks [@ilarne](https://github.com/ilarne)! - Add `aria-current="date"` to current date's cell.

## 0.6.0

### Minor Changes

- [`8717afd`](https://github.com/Sqrrl/wc-datepicker/commit/8717afd7b3a41c7b726cb61a711a02b0a1ea5cf7) Thanks [@remischwartz](https://github.com/remischwartz)! - Various accessibility improvements.

### Patch Changes

- [`8717afd`](https://github.com/Sqrrl/wc-datepicker/commit/8717afd7b3a41c7b726cb61a711a02b0a1ea5cf7) Thanks [@remischwartz](https://github.com/remischwartz)! - Prevent focus of disabled dates.

## 0.5.3

### Patch Changes

- [`e21bea2`](https://github.com/Sqrrl/wc-datepicker/commit/e21bea26065bf1f07659b8bcc03b630c45388f46) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Fix an issue causing months to be skipped when navigating

## 0.5.2

### Patch Changes

- [`c157337`](https://github.com/Sqrrl/wc-datepicker/commit/c157337123c9082b2af1cb77c7b37f8190f4a3d2) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Prevent input of years <0 or >9999 (fixes #13)

## 0.5.1

### Patch Changes

- [`bb577fe`](https://github.com/Sqrrl/wc-datepicker/commit/bb577fe3adbefc9358115cd6446b4eb405e11110) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Fix timezone adjustments

## 0.5.0

### Minor Changes

- [`a318e39`](https://github.com/Sqrrl/wc-datepicker/commit/a318e39b6bd824f8cc5dc57e056dd38307ae778c) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Add classes to mark start and end dates of a range selection

## 0.4.0

### Minor Changes

- [`e0e6f6d`](https://github.com/Sqrrl/wc-datepicker/commit/e0e6f6d7a1f51e88028c8a259a254ce030594008) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Add "disabled" property

## 0.3.0

### Minor Changes

- [`df53fd6`](https://github.com/Sqrrl/wc-datepicker/commit/df53fd6e213d6e462635c9eef1b5f9a3f04457a8) Thanks [@alexander-merz](https://github.com/alexander-merz)! - Add changeMonth event

## 0.2.0

### Minor Changes

- [`a1764d1`](https://github.com/Sqrrl/wc-datepicker/commit/a1764d185213b47569c4cf1efb1021a5f3fcbcda) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Add dark theme

## 0.1.0

### Minor Changes

- [`8304ab7`](https://github.com/Sqrrl/wc-datepicker/commit/8304ab72e7b0d4220ff6f22be23fdb4b7d6e005a) Thanks [@Sqrrl](https://github.com/Sqrrl)! - Initial release
