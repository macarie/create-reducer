# 🧱 [composable-reducer](https://github.com/macarie/composable-reducer) [![Release Version](https://img.shields.io/npm/v/composable-reducer.svg?label=&color=0080FF)](https://www.npmjs.com/package/composable-reducer)

> Create composable reducers on the fly from objects

[![Build](https://github.com/macarie/composable-reducer/workflows/test/badge.svg)](https://github.com/macarie/composable-reducer/actions?query=workflow%3Atest) [![Coverage Status](https://codecov.io/gh/macarie/composable-reducer/branch/next/graph/badge.svg)](https://codecov.io/gh/macarie/composable-reducer) [![GitHub](https://img.shields.io/github/license/macarie/composable-reducer?color=42cdad)](https://github.com/macarie/composable-reducer/blob/master/license)

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
