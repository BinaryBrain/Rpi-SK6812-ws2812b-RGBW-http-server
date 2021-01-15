const array = [
    'r1', 'g1', 'b1', 'w1',
    'r2', 'g2', 'b2', 'w2',
    'r3', 'g3', 'b3', 'w3',
    'r4', 'g4', 'b4', 'w4',
    'r5', 'g5', 'b5', 'w5',
];

function translateRGBW(a) {
    const newArray = [];
    for (let i = 0; i < a.length; i += 3) {
        const j = i / 3;
        newArray[j] = [a[i], a[i+1], a[i+2]];
    }

    return newArray;
}

function translateGRBW(a) {
    const newArray = [];
    for (let i = 0; i < a.length; i += 3) {
        const j = i / 3;
        switch(j % 4) {
            case 0:
                newArray[j] = [a[i+1], a[i], a[i+2]];
                break;
            case 1:
                newArray[j] = [a[i], a[i+2], a[i+1]];
                break;
            case 2:
                newArray[j] = [a[i], a[i+1], a[i+3]];
                break;
            case 3:
                newArray[j] = [a[i-1], a[i+1], a[i+2]];
                break;
        }
    }

    return newArray;
}

console.log(translateGRBW(array));
