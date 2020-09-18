import Sudoku from './js/sudoku.js';
import './scss/base.scss';

const box = document.createElement('div');
box.classList.add('game');
document.body.appendChild(box);

const game = new Sudoku(box);