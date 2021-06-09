exports.handler = async (event) => {
    const formatResponse = value => {
        return ({statusCode:200, body: typeof value === 'string' ? value : JSON.stringify(value)});
    }
    const qs = decodeURIComponent(event.rawQueryString);
    
    if (!qs) return {statusCode: 200, body: JSON.stringify('error')};
    const question = qs.split('q=')[1];
    if (!question) return {statusCode: 200, body: JSON.stringify('error')};
    
    const matchAddition = question.match(/(\d+)(?=[\s\+=\?]+)/g);
    const matchConsonants = question.match(/^([a-zA-Z]+)+/g);
    const matchNumberPuzzle = question.match(/^<[0-9\s]+>$/g);
    const matchLetterPuzzle = question.match(/^\s.+/g);

    const isAddition = matchAddition != null && matchAddition.length;
    const isMatchConsonants = matchConsonants != null && matchConsonants.length;
    const isMatchNumberPuzzle = matchNumberPuzzle != null && matchNumberPuzzle.length;
    const isMatchLetterPuzzle = matchLetterPuzzle != null && matchLetterPuzzle.length;
    const isPing = question === 'PING';
    const isName = question === 'What is your name?';
    const isQuest = question === 'What is your quest?';
    const isRepo = question === 'Source code for this exercise?';
    
    if (isPing) return formatResponse('PONG');
    if (isName) return formatResponse('Nick Vrdoljak');
    if (isQuest) return formatResponse('coding');
    if (isRepo) return formatResponse('https://github.com/nicholasvrdoljak/challenge');
    
    /*
         
     ABCDEF
    A=-----
    B>--<--
    C--=---
    D---=--
    E-->--<
    F<-----
    CEFABD
    
    ABDCEF
    */
    if (isMatchLetterPuzzle) {
        //Move letter one to left or right of letter two
        const moveLetter = (letter1, leftOrRight, letter2, array) => {
            let arrayCopy = Array.from(array);
            let arrayWorkingCopy = Array.from(array);

            let index1 = arrayCopy.indexOf(letter1);
            let index2 = arrayCopy.indexOf(letter2);
            
            let finalIndex = leftOrRight === 'left' ? index2 : index2+1;
            arrayWorkingCopy.splice(finalIndex, 0, letter1);
            if (finalIndex <= index1) {
                arrayWorkingCopy.splice(index1+1,1);    
            } else {
                arrayWorkingCopy.splice(index1,1);
            }
            return arrayWorkingCopy;
        }
        
        const components = question.split("\r\n");
        
        //startingLetters: ["A", "B", "C", "D", "E", "F"]
        let startingLetters = components[0].trim().split("");
        //instructions:  [ 'A->-<--', 'B-=----', 'C-<----', 'D---=--', 'E--<-->', 'F-----=' ]
        const instructions = components.slice(1);
        
        //2. if two symbols, move the line letter to the position for the first symbol, move the symbol letter to the position for the second symbol
        //3. if one symbol, move the line letter to the position for the symbol
        const finalLetterConfiguration = instructions.reduce((workingLetterConfiguration, instruction) => {
            //instruction 'A->-<--'
            const letterInQuestion = instruction[0];
            let firstInstruction = true;

            for (let i = 1; i < instruction.length; i++) {

                const symbol = instruction[i];
                const symbolPosition = i-1;

                if ([">", "<"].indexOf(symbol) === -1) {
                    continue;
                }

                if (firstInstruction) {
                    // Move the line letter to the position if needed
                    // Move (A to right of B)
                    if (symbol === "<") {
                        workingLetterConfiguration = moveLetter(letterInQuestion, 'left', startingLetters[symbolPosition], workingLetterConfiguration);

                    }
                    if (symbol === ">") {
                        workingLetterConfiguration = moveLetter(letterInQuestion, 'right', startingLetters[symbolPosition], workingLetterConfiguration);

                    }
                } else {
                    // Move the symbol letter to the position
                    // Move D to right of A
                    if (symbol === "<") {
                        workingLetterConfiguration = moveLetter(startingLetters[symbolPosition], 'right', letterInQuestion, workingLetterConfiguration)

                    }
                    if (symbol === ">") {
                        workingLetterConfiguration = moveLetter(startingLetters[symbolPosition], 'left', letterInQuestion, workingLetterConfiguration)

                    }
                }
                firstInstruction = false;
            }
            return workingLetterConfiguration;
            
        }, startingLetters);
        
        
    
        return formatResponse(finalLetterConfiguration.join(''))
    }
    
    // < 11 8 40 47 30 51 15 30 56 57 > => 67 55 77 81 65
    if (isMatchNumberPuzzle) {
        const numbers = question.match(/[0-9]+/g);
        const evenNumbers = numbers.filter(num => num%2===0);
        const oddNumbers = numbers.filter(num => num%2===1);
        const oddNumbersSortedAsc = oddNumbers.sort((a,b) => (Number(a) - Number(b)));
        const evenNumbersSortedDesc = evenNumbers.sort((a,b) => (Number(b) - Number(a)));
        const result = oddNumbersSortedAsc.reduce((acc, item, index) => {acc.push(Number(oddNumbersSortedAsc[index]) + Number(evenNumbersSortedDesc[index])); return acc;}, []);
        return formatResponse(result.join(' '));
    }
    
    
    // 205 + 318 + 1101 = ? => 1624
    if (isAddition) {
        const sum = matchAddition.reduce((acc, item) => {acc+=Number(item); return acc;}, 0);
        return formatResponse(sum);
    }
    
    // opal bluster sonder ethereal => 4-15-10
    if (isMatchConsonants) {
        const words = question.match(/\w+/g).length;
        const vowels = question.match(/[aeiou]/g).length;
        const consonants = question.match(/[^aeiou\s]/g).length;

        return formatResponse(""+words+"-"+consonants+"-"+vowels+"");
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello Vacasa!'),
    };
    return response;
};
