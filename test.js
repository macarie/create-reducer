import test from 'ava'

import composableReducer from './index.js'

const state = {
  result: 5,
}

const add = ({ result }, { addend }) => ({
  result: result + addend,
})

const multiply = ({ result }, { multiplicand }) => ({
  result: result * multiplicand,
})

test('basic', (t) => {
  const r = composableReducer({ add })

  t.snapshot(r(state, { type: 'add', addend: 10 }), 'basic')
})

test('alias', (t) => {
  const r = composableReducer({ add, alias: 'add' })

  t.snapshot(r(state, { type: 'alias', addend: 10 }), 'alias')
})

test('composed', (t) => {
  const r = composableReducer({ add, multiply, mix: ['add', 'multiply'] })

  t.snapshot(r(state, { type: 'mix', addend: 5, multiplicand: 10 }), 'composed')
})

test('alias:nested', (t) => {
  const r = composableReducer({
    add,
    thirdAlias: 'secondAlias',
    secondAlias: 'firstAlias',
    firstAlias: 'add',
  })

  t.snapshot(r(state, { type: 'thirdAlias', addend: 10 }), 'nested alias')
})

test('alias:composed', (t) => {
  const r = composableReducer({
    add,
    multiply,
    addAlias: 'add',
    mix: ['addAlias', 'multiply'],
    mixAlias: 'mix',
    nestedMixAlias: 'mixAlias',
    composedMix: ['add', 'nestedMixAlias'],
  })

  t.snapshot(
    r(state, { type: 'mix', addend: 5, multiplicand: 10 }),
    'alias inside composed'
  )
  t.snapshot(
    r(state, { type: 'mixAlias', addend: 5, multiplicand: 10 }),
    'alias to composed'
  )
  t.snapshot(
    r(state, { type: 'nestedMixAlias', addend: 5, multiplicand: 10 }),
    'nested alias to composed'
  )
  t.snapshot(
    r(state, { type: 'composedMix', addend: 5, multiplicand: 10 }),
    'nested alias to composed inside composed'
  )
})

test('alias:arguments', (t) => {
  const r = composableReducer({
    add,
    multiply,
    add5: 'add({ "addend": 5 })',
    addThenMultiply: ['add', 'multiply'],
    add10Multiply99: 'addThenMultiply({ "addend": 10, "multiplicand": 99 })',
  })

  t.snapshot(r(state, { type: 'add5' }), 'alias with arguments')
  t.snapshot(
    r(state, { type: 'add10Multiply99' }),
    'alias with arguments to composed'
  )
})

test('composed:arguments', (t) => {
  const r = composableReducer({
    add,
    multiply,
    mix: ['add({ "addend": 10 })', 'multiply({ "multiplicand": 10 })'],
  })

  t.snapshot(r(state, { type: 'mix' }), 'composed with arguments')
})

test('composed:functions', (t) => {
  const r = composableReducer({ add, mix: ['add', multiply] })

  t.snapshot(
    r(state, { type: 'mix', addend: 10, multiplicand: 10 }),
    'composed with function'
  )
})

test('action-key', (t) => {
  const r = composableReducer({ add }, { actionKey: 'action' })

  t.snapshot(r(state, { action: 'add', addend: 5 }), 'custom action key')
})

test('errors', (t) => {
  t.snapshot(
    t.throws(() => composableReducer({ wrongType: {} })),
    'reducer must be (function | string | array)'
  )

  t.snapshot(
    t.throws(() => composableReducer({ add, mix: [add, {}] })),
    'composed reducers must be (function | string)'
  )

  t.snapshot(
    t.throws(() => composableReducer({ cycle: 'infinite', infinite: 'cycle' })),
    'alias cycles must throw'
  )

  t.snapshot(
    t.throws(() => composableReducer({ unresolved: 'dunno' })),
    'unresolved reducers must throw'
  )

  t.snapshot(
    t.throws(() =>
      composableReducer({ add, mul: 'add' })(state, { type: 'multiply' })
    ),
    'dispatching an unknown reducer type should throw and suggest a close match'
  )
})
