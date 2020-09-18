
export default class Sudoku
{
    /*
    expert: { open: 23, onPadMax: 4 },
    hard: { open: 25, onPadMax: 5 },
    middle: { open: 30, onPadMax: 6 },
    lite: { open: 38, onPadMax: 7 } */

    constructor(box_id = "game")
    {
        this.box = typeof box_id === "string" ? document.getElementById(box_id) : box_id;
        this.box.setAttribute('tabindex', 0);
        this.box.addEventListener('keyup', (ev) => this.keyUp(ev.key));
        
        this.createTable();
    }
    
    createTable(size = 9)
    {
        this.items = [];

        const pad = Math.sqrt(size) >> 0;
        size = pad * pad;

        const gameData = this.genGameData(size);
        
        const table = this.create('table', this.box);

        for (let line = 0; line < size; ++line)
        {
            const lineData = [];

            const tr = this.create('tr', table);
            for (let column = 0; column < size; ++column)
            {
                const td = this.create('td', tr);
                const data = gameData[line][column];
                data.td = td;
                lineData.push(data);

                if (line && line % pad == 0)
                    td.classList.add('td-t');
                if (column && column % pad == 0)
                    td.classList.add('td-l');

                td.innerText = data.isHidden ? ' ' : data.value;

                td.addEventListener('click', () => this.click(data, line, column));
                td.addEventListener('mouseover', () => this.over(data, line, column));
                td.addEventListener('mouseout', () => this.out(data, line, column));
            }

            this.items.push(lineData);
        }
    }

    genGameData(size)
    {
        const gameData = [];
        for (let line = 0; line < size; ++line)
        {
            const lineData = [];
            for (let column = 0; column < size; ++column)
                lineData.push({ value: 0, isHidden: Math.random() > 0.5 });
            gameData.push(lineData);
        }

        const pad = Math.sqrt(size);
        for (let value = 1; value <= size; ++value)
            if (!this.fillDataItem(gameData, value, size, pad))
                return this.genGameData(size);

        return gameData;
    }

    fillDataItem(gameData, value, size, pad, pos = 0)
    {
        const boxX = (pos % pad) * pad;
        const boxY = Math.floor(pos / pad) * pad;

        if (++pos > size)
            return true;

        const fieldChoices = [];
        for (let i = 0; i < size; ++i)
        {
            const line = boxY + Math.floor(i / pad);
            const column = boxX + (i % pad);
            if (gameData[line][column].value == 0)
                fieldChoices.push(i);
        }

        do
        {
            const i = this.rnd(fieldChoices.length);
            const num = fieldChoices[i];
            const line = boxY + Math.floor(num / pad);
            const column = boxX + (num % pad);

            if (this.checkField(gameData, line, boxY, column, boxX, value))
            {
                gameData[line][column].value = value;
                if (this.fillDataItem(gameData, value, size, pad, pos))
                    return true;
                gameData[line][column].value = 0;
            }

            fieldChoices.splice(i, 1);
        }
        while(fieldChoices.length);

        return false;
    }

    checkField(gameData, line, boxY, column, boxX, value)
    {
        const lineData = gameData[line];
        if (lineData[column].value)
            return false;

        for (let c = 0; c < boxX; ++c)
            if (lineData[c].value == value)
                return false;

        for (let l = 0; l < boxY; ++l)
            if (gameData[l][column].value == value)
                return false;
        return true;
    }

    rnd(max) 
    {
        return Math.floor(Math.random() * max);
    }

    genDataItem(gameData, line, column, size)
    {
        const value = Math.round(0.5 + Math.random() * size);

        const pad = Math.sqrt(size);
        const lBox = Math.floor(line / pad) * pad;
        const lBoxEnd = lBox + pad;
        const cBox = Math.floor(column / pad) * pad;
        const cBoxEnd = cBox + pad;

        for (let l = 0; l < gameData.length; ++l)
        {
            const lineData = gameData[l];
            for (let c = 0; c < lineData.length; ++c)
            {
                const fieldData = lineData[c];
                if ((l == line || c == column 
                    || ((l >= lBox && l < lBoxEnd)
                        && (c >= cBox && c < cBoxEnd)))
                    && value == fieldData.value)
                    return this.genDataItem(gameData, line, column, size);
            }
        }

        const isHidden = false; // Math.random() > 0.5;

        return { value, isHidden };
    }

    keyUp(key)
    {
        if (key < '1' || key > '9')
            return;

        console.log('add' , key)
    }

    click(data, line, column)
    {

    }

    over(data, line, column)
    {
        this.toggleMouseDep(data, line, column);
        // data.td.classList.add('mouse');
    }

    out(data, line, column)
    {
        this.toggleMouseDep(data, line, column);
        // data.td.classList.remove('mouse');
    }

    toggleMouseDep(data, line, column)
    {
        data.td.classList.toggle('mouse');
        for (let l = 0; l < this.items.length; ++l)
        {
            const lineData = this.items[l];
            for (let c = 0; c < lineData.length; ++c)
            {
                const fieldData = lineData[c];
                if ((l == line || c == column)
                    && data !== fieldData)
                    fieldData.td.classList.toggle('mouse-dep');
            }
        }
    }

    create(name, parent)
    {
        let elem = document.createElement(name);
        parent.appendChild(elem);
        return elem;
    }
}
