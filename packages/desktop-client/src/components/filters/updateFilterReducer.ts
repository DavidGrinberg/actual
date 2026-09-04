import { currentDay } from '@actual-app/core/shared/months';
import { FIELD_TYPES, makeValue } from '@actual-app/core/shared/rules';
import type { RuleConditionEntity } from '@actual-app/core/types/models';

function isRange(value: unknown): value is { num1: unknown; num2: unknown } {
  return typeof value === 'object' && value !== null && 'num1' in value;
}

export function updateFilterReducer<T extends RuleConditionEntity>(
  state: Pick<T, 'op' | 'field'> & { value: T['value'] | null },
  action:
    | { type: 'set-op'; op: T['op'] }
    | { type: 'set-value'; value: T['value'] },
) {
  switch (action.type) {
    case 'set-op': {
      const type = FIELD_TYPES.get(state.field);
      let value = state.value;

      // `isbetween` holds a pair of bounds instead of a single value, so the
      // value has to be converted whenever the op moves in or out of it
      if (type === 'date' || type === 'number') {
        const empty = type === 'date' ? currentDay() : 0;

        if (action.op === 'isbetween' && !isRange(value)) {
          // New filters start out with an empty value
          const bound = value || empty;
          // @ts-expect-error - fix me
          value = { num1: bound, num2: bound };
        } else if (action.op !== 'isbetween' && isRange(value)) {
          value = (value.num1 || empty) as T['value'];
        }

        return { ...state, op: action.op, value };
      }

      if (
        (type === 'id' || type === 'string') &&
        state.field !== 'notes' &&
        (action.op === 'contains' ||
          action.op === 'matches' ||
          action.op === 'is' ||
          action.op === 'doesNotContain' ||
          action.op === 'isNot' ||
          action.op === 'hasTags' ||
          action.op === 'hasAnyTag' ||
          action.op === 'onBudget' ||
          action.op === 'offBudget')
      ) {
        // When switching to single-value operators, convert array to first element
        if (Array.isArray(value)) {
          value = value.length > 0 ? value[0] : null;
        }
      } else if (
        (type === 'id' || type === 'string') &&
        state.field !== 'notes' &&
        (action.op === 'oneOf' || action.op === 'notOneOf')
      ) {
        // Convert single value to array when switching to oneOf/notOneOf
        if (value === null || value === undefined) {
          value = [];
        } else if (!Array.isArray(value)) {
          // @ts-expect-error - fix me
          value = [value];
        }
      }
      return { ...state, op: action.op, value };
    }
    case 'set-value': {
      const { value } = makeValue(action.value, {
        type: FIELD_TYPES.get(state.field),
      });
      return { ...state, value };
    }
    default:
      // @ts-expect-error - fix me
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
