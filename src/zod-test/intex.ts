import { z } from 'zod'

const myObject = z.object({
    name: z.string(),
    age: z.number()
})

console.log(myObject.safeParse({ name: 'asd', age: 30 }))

// const elso = new Set([1, 2, 3])
// const masodik = new Set([2, 4, 1])
// console.log(elso.intersection(masodik))
const odds = new Set([1, 3, 5, 7, 9])
const squares = new Set([1, 4, 9])

function intersection(set1: Set<number>, set2: Set<number>) {
    return new Set([...set1].filter((x) => set2.has(x)))
}

console.log(intersection(odds, squares))
