# Aligner

This small TypeScript library statistically aligns correspondent tokens in parallel text data.

## Sample usage

```typescript
import {train, align} from "aligner/aligner.ts";

const data: Array<[string, string]> = [
  ['This is a very heavy horse', 'Це дуже важкий кінь'],
  ['The horse is not scary', 'Кінь не страшний'],
  ['This is not a scary teacher', 'Це не страшний учитель'],
  ['The teacher is very good', 'Учитель дуже хороший'],
  ['This is a ship', 'Це корабель'],
  ['The good ship is heavy', 'Хороший корабель важкий']
];

const tokenizer = (string: string) => string.split(' ');
const normalizer = (string: string) => string.toLowerCase();

const model = train(data, {
  tokenizer,
  normalizer,
  repeatIterations: 1, // How many times to rerun the algorithm on the data; the default is 0
  significanceLevel: 0.05 // The likelihood of a false token correspondence to be included; 0.05 is the default value
});

for (const [eng, ukr] of data) {
  const [alignment, weight] = align(eng, ukr, model, {
    tokenizer,
    normalizer
  });
  console.log(alignment);
}

/* Output:

[
  [ [ "this", "is" ], [ "це" ] ],
  [ [ "a" ], [] ],
  [ [ "very" ], [ "дуже" ] ],
  [ [ "heavy" ], [ "важкий" ] ],
  [ [ "horse" ], [ "кінь" ] ]
]
[
  [ [ "the" ], [] ],
  [ [ "horse" ], [ "кінь" ] ],
  [ [ "is" ], [] ],
  [ [ "not" ], [ "не" ] ],
  [ [ "scary" ], [ "страшний" ] ]
]
[
  [ [ "this", "is" ], [ "це" ] ],
  [ [ "not" ], [ "не" ] ],
  [ [ "a" ], [] ],
  [ [ "scary" ], [ "страшний" ] ],
  [ [ "teacher" ], [ "учитель" ] ]
]
[
  [ [ "the" ], [] ],
  [ [ "teacher" ], [ "учитель" ] ],
  [ [ "is" ], [] ],
  [ [ "very" ], [ "дуже" ] ],
  [ [ "good" ], [ "хороший" ] ]
]
[
  [ [ "this", "is" ], [ "це" ] ],
  [ [ "a" ], [] ],
  [ [ "ship" ], [ "корабель" ] ]
]
[
  [ [ "the" ], [] ],
  [ [ "good" ], [ "хороший" ] ],
  [ [ "ship" ], [ "корабель" ] ],
  [ [ "is" ], [] ],
  [ [ "heavy" ], [ "важкий" ] ]
]

*/
```

You can also store the learned model and restore it later:

```typescript
import {Model} from "aligner/model.ts";

const stringToStore = model.serialize();
const restoredModel = new Model(stringToStore);

{
  const [alignment, weight] = align('The good horse is not heavy', 'Хороший кінь не важкий', restoredModel, {
    tokenizer,
    normalizer
  });
  console.log(alignment, weight);
}

/* Output:

[
  [ [ "the" ], [] ],
  [ [ "good" ], [ "хороший" ] ],
  [ [ "horse" ], [ "кінь" ] ],
  [ [ "is" ], [] ],
  [ [ "not" ], [ "не" ] ],
  [ [ "heavy" ], [ "важкий" ] ]
]
16

*/

{
  const [alignment, weight] = align('This is not a scary teacher', 'Кінь не страшний', restoredModel, {
    tokenizer,
    normalizer
  });
  console.log(alignment, weight);
}

/* Output:

[
  [ [ "this", "is" ], [] ],
  [ [], [ "кінь" ] ],
  [ [ "not" ], [ "не" ] ],
  [ [ "a" ], [] ],
  [ [ "scary" ], [ "страшний" ] ],
  [ [ "teacher" ], [] ]
]
8

*/
```