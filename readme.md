# 🧱 [composable-reducer](https://github.com/macarie/composable-reducer) [![Release Version](https://img.shields.io/npm/v/composable-reducer.svg?label=&color=0080FF)](https://www.npmjs.com/package/composable-reducer)

> Create composable reducers on the fly from objects

[![Build](https://github.com/macarie/composable-reducer/workflows/test/badge.svg)](https://github.com/macarie/composable-reducer/actions?query=workflow%3Atest) [![Coverage Status](https://codecov.io/gh/macarie/composable-reducer/branch/next/graph/badge.svg)](https://codecov.io/gh/macarie/composable-reducer) [![GitHub](https://img.shields.io/github/license/macarie/composable-reducer?color=42cdad)](https://github.com/macarie/composable-reducer/blob/master/license)

First and foremost, `composableReducer` is a _helper_ that lets developers create reducers on the fly from objects and their `key => value` pairs, where `key`s are the `dispatch` types, thus reducing the boilerplate you have to write while creating reducers to use with React's `useReducer` hook.

<a name="micro-reducers"></a>Each function returns only the piece of state it wants to modify. I call these _micro-reducers_.

<a name="composed-reducers"></a>Each micro-reducer can be used inside a _composed-reducer_ (hah! `composable-reducer`, who would've guessed?) creating a chain. These are just reducers that when called call their micro-reducers in the order they're defined. Every micro-reducer receives the full state mixed with the updated bits created by the previous micro-reducers, this way every micro-reducer can have access to an up-to-date state.

Throw in the mix the possibility to define aliases for micro-reducers and composed-reducers, the possibility to pass static arguments around (e.g. `addOne: 'add({ "amount": 1 })'`, where `add` is just a micro-reducer), and you have a pretty powerful utility in your hands<sup>☝🏼</sup>. The best part about the static-arguments thing? They have the highest priority (i.e. they can't be overridden), can be used in aliases for composed-reducers, and are thrown away after being used, so they don't pollute your micro-reducer chain!

<small>_☝🏼: Seriously, you can extract all the business logic from a component and add features just by adding micro-reducers and composed-reducers, give it a try!_</small>

## Features

- Create a reducer on the fly from an `object`'s `key`s and `value`s.
- Define [composed-reducers](#user-content-composed-reducers) using [micro-reducers](#user-content-micro-reducers).
- Create aliases for reducers, even for the composed ones.
- Use static arguments for aliases and elements of composed reducers.
- Throws an error at reducer-build-time if aliases mismatch.
- Throws an error when a `dispatch` type is not recognized.

## Install

```console
$ npm install composable-reducer
```

Or if you prefer using Yarn:

```console
$ yarn add composable-reducer
```

## Usage

```javascript
import { composableReducer } from "composable-reducer"

const reducer = composableReducer({
  setDiscountPercentage: (_, { percentage }) => ({
    percentage,
  }),
  percentage: ({ percentage, price }) => ({
    discount: (percentage / 100) * price,
  }),
  decrease: ({ discount, price }) => ({
    discountedPrice: price - discount,
  }),
  setLabel: (_, { label }) => ({
    label,
  }),
  setDiscountedPrice: [
    "setDiscountPercentage",
    "percentage",
    "decrease",
    'setLabel({ "label": "Sales!" })',
  ],
})

reducer({ price: 50 }, { type: "setDiscountedPrice", percentage: 20 })

// => { price: 50, percentage: 20, discount: 10, discountedPrice: 40, label: 'Sales!' }

const Component = ({ price }) => {
  const [{ price, discountedPrice = price }, dispatch] = useReducer(reducer, {
    price: price,
  })

  useTimeout(
    () => dispatch({ type: "setDiscountedPrice", percentage: 20 }),
    5000
  )

  return (
    <>
      {discountedPrice < price && <del>{price}</del>} {discountedPrice}
    </>
  )
}
```

## API

### composableReducer(object, options)

Create a reducer from `object` by using its `key => value` pairs, where `key`s are the `dispatch` types and `value`s are their handlers. Read more about [micro-reducers](#user-content-micro-reducers) and [composed-reducers](#user-content-composed-reducers) above.

#### object

Type: `object`

#### options

Type: `object`

##### options.actionKey

Type: `string`

Default Value: `"type"`

The `dispatch` property that should be used to distinguish between different `dispatch`es, by default it's `"type"`, e.g. `dispatch({ type: 'add' })`.

## Browser support

The latest version of Chrome, Firefox, Safari, and Edge. I think that Edge 12 is the lowest you can go.
