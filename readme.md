# 🧱 [composable-reducer](https://github.com/macarie/composable-reducer) [![Release Version](https://img.shields.io/npm/v/composable-reducer.svg?label=&color=0080FF)](https://www.npmjs.com/package/composable-reducer)

> Create composable reducers on the fly from objects

![Build](https://github.com/macarie/composable-reducer/workflows/test/badge.svg) ![Coverage Status](https://img.shields.io/codecov/c/github/macarie/composable-reducer) [![License](https://img.shields.io/npm/l/composable-reducer?color=42cdad)](https://github.com/macarie/compatto/blob/master/license)

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
```
