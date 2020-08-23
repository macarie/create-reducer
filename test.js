import test from 'ava'

import { composableReducer } from './index.js'

const state = {
  counter: 1,
  string: 'hello',
}

const reducerObject = {
  increase: ({ counter }, { amount = 1 }) => ({
    counter: counter + amount,
  }),
  decrease: ({ counter }, { amount = 1 }) => ({
    counter: counter - amount,
  }),
  double: ({ counter }) => ({
    counter: counter + counter,
  }),
  times: ({ counter }, { number = 0 }) => ({
    counter: counter * number,
  }),
  timesTwo: 'double',
  complex: ['increase', 'double', 'decrease', 'timesTwo'],
  repeatStringCounterTimes: [
    'increase',
    'double',
    ({ counter, string }) => ({
      string: string.repeat(counter),
    }),
  ],
  rsct: 'repeatStringCounterTimes',
  increaseByFour: 'increase({ "amount": 4 })',
  add: 'increase',
  customArguments: [
    'increase({ "amount": 4 })',
    'decrease({ "amount": 3 })',
    'times',
    'increaseByFour',
    'rsct({ "amount": 2 })',
    'add({ "amount": 2 })',
  ],
}

test('basic', (t) => {
  const reducer = composableReducer(reducerObject)

  t.deepEqual(
    reducer(state, {
      type: 'increase',
      amount: 5,
    }),
    { ...state, counter: state.counter + 5 }
  )

  t.deepEqual(
    reducer(state, {
      type: 'decrease',
      amount: 5,
    }),
    { ...state, counter: state.counter - 5 }
  )

  t.deepEqual(
    reducer(state, {
      type: 'double',
    }),
    { ...state, counter: state.counter * 2 }
  )
})

test('aliases', (t) => {
  const reducer = composableReducer(reducerObject)

  t.deepEqual(
    reducer(state, {
      type: 'timesTwo',
    }),
    { ...state, counter: state.counter * 2 }
  )
})

test('composability', (t) => {
  const reducer = composableReducer(reducerObject)

  t.deepEqual(reducer(state, { type: 'complex' }), {
    ...state,
    counter: ((state.counter + 1) * 2 - 1) * 2,
  })

  t.deepEqual(reducer(state, { type: 'repeatStringCounterTimes', amount: 4 }), {
    counter: (state.counter + 4) * 2,
    string: state.string.repeat((state.counter + 4) * 2),
  })
})

test('custom argument', (t) => {
  const reducer = composableReducer(reducerObject)

  t.deepEqual(reducer(state, { type: 'customArguments', number: 2 }), {
    counter: ((state.counter + 4 - 3) * 2 + 4 + 2) * 2 + 2,
    get string() {
      return state.string.repeat(this.counter - 2)
    },
  })
})

test('errors', (t) => {
  t.snapshot(
    t.throws(() => {
      composableReducer({ a: {} })
    })
  )

  t.snapshot(
    t.throws(() => {
      composableReducer({ a: [{}] })
    })
  )

  t.snapshot(
    t.throws(() => {
      composableReducer({ a: 'b', b: 'a' })
    })
  )

  t.snapshot(
    t.throws(() => {
      composableReducer({ a: 'b' })
    })
  )

  const reducer = composableReducer(reducerObject)

  t.snapshot(
    t.throws(() => {
      reducer(state, { type: 'degrease' })
    })
  )
})
