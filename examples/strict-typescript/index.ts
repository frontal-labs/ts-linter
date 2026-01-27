// This file will trigger multiple errors in 'strict-typing' ruleset
const a: any = 10; // noExplicitAny

function doSomething(x) { // noImplicitAny (if checked by biome)
    console.log(x);
}

const data = {
    id: 1,
    metadata: {
        tags: ["ts", "linter"]
    }
};

// Use non-null assertion (warned in strict)
console.log(data.metadata!.tags); 
