const SudokuType = {
    expert: { fixed: 23, maxBoxFixed: 4, size: 9 },
      hard: { fixed: 25, maxBoxFixed: 5, size: 9 },
    middle: { fixed: 30, maxBoxFixed: 6, size: 9 },
      lite: { fixed: 38, maxBoxFixed: 7, size: 9 } 
};

export default class Sudoku
{
    constructor(box_id = "game")
    {
        this.type = SudokuType.lite;
        this.box = typeof box_id === "string" ? document.getElementById(box_id) : box_id;
        
        this.createTable(this.type.size);

        this.box.setAttribute('tabindex', 0);
        this.box.addEventListener('keyup', (ev) => this.keyUp(ev));
    }
    
    createTable(size)
    {
        this.items = [];

        const pad = Math.sqrt(size) >> 0;
        size = pad * pad;

        const gameData = this.genGameData(size, pad);
        
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

                if (data.isFixed)
                {
                    td.classList.add('fixed');
                    td.innerText = data.value;
                }

                td.addEventListener('click', () => this.click(data, line, column));
                td.addEventListener('mouseover', () => this.over(data, line, column));
                td.addEventListener('mouseout', () => this.out(data, line, column));
            }

            this.items.push(lineData);
        }
    }

    createHelpTable(data)
    {
        const pad = Math.sqrt(this.type.size);
        const table = this.create('table', data.td);
        table.classList.add('help')
        for (let l = 0; l < pad; ++l)
        {
            const tr = this.create('tr', table);
            for (let c = 0; c < pad; ++c)
            {
                const td = this.create('td', tr);
                td.innerText = ' ';
            }
        }
    }

    genGameData(size, pad)
    {
        let fixedCount = 0;

        const gameData = [];
        for (let line = 0; line < size; ++line)
        {
            const lineData = [];
            for (let column = 0; column < size; ++column)
            {
                const data = { value: 0, isFixed: Math.random() > 0.75 };
                if (data.isFixed)
                    ++fixedCount;
                lineData.push(data);
            }
            gameData.push(lineData);
        }

        this.adjustFixed(gameData, size, pad, fixedCount);

        for (let value = 1; value <= size; ++value)
            if (!this.fillDataItem(gameData, value, size, pad))
                return this.genGameData(size, pad);

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

    adjustFixed(gameData, size, pad, fixedCount)
    {
        fixedCount -= this.type.fixed;

        do
        {
            for (let pos = 0; pos < size; ++pos)
            {
                const boxX = (pos % pad) * pad;
                const boxY = Math.floor(pos / pad) * pad;
            
                let boxFixedCount = 0;
                const fixed = [], empty = [];

                for (let i = 0; i < size; ++i)
                {
                    const line = boxY + Math.floor(i / pad);
                    const column = boxX + (i % pad);
                    const data = gameData[line][column];

                    if (data.isFixed)
                    {
                        if (boxFixedCount < this.type.maxBoxFixed)
                        {
                            ++boxFixedCount;
                            fixed.push(i);
                        }
                        else
                        {
                            data.isFixed = false;
                            --fixedCount;
                        }
                    }
                    else
                        empty.push(i);
                }

                const toggleFixed = (arr) => 
                {
                    const i = this.rnd(arr.length);
                    const num = arr[i];
                    const line = boxY + Math.floor(num / pad);
                    const column = boxX + (num % pad);
                    const data = gameData[line][column];
                    data.isFixed = !data.isFixed;
                    arr.splice(i, 1);
                };

                let maxAdd = 1;
                while (fixedCount < 0 && boxFixedCount < this.type.maxBoxFixed && maxAdd--)
                {
                    toggleFixed(empty);
                    ++boxFixedCount;
                    ++fixedCount;
                }

                while (fixedCount > 0 && boxFixedCount > 0)
                {
                    toggleFixed(fixed);
                    --boxFixedCount;
                    --fixedCount;
                }
            }
        }
        while (fixedCount != 0);
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

        const isFixed = false; // Math.random() > 0.5;

        return { value, isFixed };
    }

    keyUp(ev)
    {
        // console.log('add' , ev);
        if (!this.current || this.current.isFixed)
            return;

        if (ev.key == 'Delete')
            this.current.td.innerText = '';

        if (ev.key < '1' || ev.key > '9')
            return;

        if (ev.ctrlKey && (!this.current.td.childNodes.length || this.current.td.children.length))
        {
            if (!this.current.td.children.length)
                this.createHelpTable(this.current);

            const pad = Math.sqrt(this.type.size);
            const i = parseInt(ev.key) - 1;
            const x = (i % pad);
            const y = Math.floor(i / pad);

            const table = this.current.td.children[0];
            const tr = table.children[y];
            const td = tr.children[x];
            if (td.innerText.length)
                td.innerText = '';
            else
                td.innerText = i + 1;
        }
        else
        {
            this.current.td.innerText = ev.key;
        }
    }

    click(data, line, column)
    {
        if (this.current)
        {
            // TODO: remove curent
            this.current.td.classList.remove('current-field');
        }

        if (this.current !== data)
        {
            this.current = data;
            this.current.td.classList.add('current-field');
        }
        else
            this.current = null;
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
