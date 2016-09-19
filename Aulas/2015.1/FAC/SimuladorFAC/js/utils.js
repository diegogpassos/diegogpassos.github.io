function completeWithLeftZeros(value, numberOfDigits) {

    var zerosToAdd = numberOfDigits - value.length;

    for (var i = 0; i < zerosToAdd; i++) {

        value = "0" + value;
    }

    return(value);
}

function completeWithLeftOnes(value, numberOfDigits) {

    var onesToAdd = numberOfDigits - value.length;

    for (var i = 0; i < onesToAdd; i++) {

        value = "1" + value;
    }

    return(value);
}

/*
 * Puts a numeric javascript type into a string with the 
 * Two Complements representation.
 */
function toTwoComplement(number, bits) {

    var representation;

    if (number >= 0) {

        representation = completeWithLeftZeros(number.toString(2), bits);    
    }
    else {

        number = Math.pow(2, bits) + number;
        representation = number.toString(2);
    }
    
    return(representation);
}

/*
 * Takes a positive (non-negative, actually) numeric javascript 
 * type and computes another positive numeric javascript type which
 * has a binary representation with 'bits' bits corresponding to
 * the two's complement of the original number.
 */
function twoComplement(number, bits) {

    if (number == 0) return(0);
    else return(Math.pow(2, bits) - number);
}
