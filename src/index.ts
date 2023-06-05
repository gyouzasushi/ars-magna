const svg = document.getElementById('svg')!;
const before = document.getElementById('before')!;
const after = document.getElementById('after')!;
let active = true;
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
        if (!active || before.firstChild) {
            active = !active;
        }
    }
    if (/^[a-zA-Z ]$/.test(ev.key)) {
        const span = document.createElement('span');
        span.textContent = ev.key.toUpperCase();
        if (active) {
            before.appendChild(span);
        } else {
            after.appendChild(span);
        }
    }
    if (ev.key === 'Backspace') {
        if (!active) {
            if (after.lastChild) {
                after.removeChild(after.lastChild);
            } else {
                active = true;
            }
        }
        if (active) {
            if (before.lastChild) before.removeChild(before.lastChild);
        }
    }
    draw();
});
window.addEventListener('resize', draw);

function getCharacterCoordinatesAndText(textElement: HTMLElement):
    [{
        lx: number,
        rx: number,
        uy: number
        dy: number
    }[], string[]] {
    const characterCoordinates: {
        lx: number,
        rx: number,
        uy: number
        dy: number
    }[] = [];
    const text: string[] = [];
    for (const span of textElement.children) {
        const character = span.textContent!;
        const rect = span.getBoundingClientRect();
        const coordinates = {
            lx: rect.left,
            rx: rect.right,
            uy: rect.top - 10,
            dy: rect.bottom + 10,
        };
        console.log(character, rect.left);
        characterCoordinates.push(coordinates);
        text.push(character);
    }
    return [characterCoordinates, text];
}
function draw() {
    const [before_coords, before_text] = getCharacterCoordinatesAndText(before);
    const [after_coords, after_text] = getCharacterCoordinatesAndText(after);
    const offsetX = svg.getBoundingClientRect().left;
    const offsetY = svg.getBoundingClientRect().top;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    for (let i = 0; i < before_text.length; i++) {
        const c = before_text[i];
        if (c == ' ') continue;
        const j = after_text.lastIndexOf(c);
        if (j == -1) continue;
        after_text[j] = '$';
        const x1 = (() => {
            if (i == 0) return before_coords[i].lx - offsetX + 5;
            if (i == before_text.length - 1) return before_coords[i].rx - offsetX - 5;
            return (before_coords[i].lx + before_coords[i].rx) / 2 - offsetX;
        })();
        const x2 = (() => {
            if (j == 0) return after_coords[j].lx - offsetX + 5;
            if (j == after_text.length - 1) return after_coords[j].rx - offsetX - 5;
            return (after_coords[j].lx + after_coords[j].rx) / 2 - offsetX;
        })();
        const y1 = before_coords[i].dy - offsetY;
        const y2 = after_coords[j].uy - offsetY;
        svg.appendChild(getRect(x1, y1, x2, y2, 20));
    }
}
function getRect(x1: number, y1: number, x2: number, y2: number, h: number): SVGElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    const w = Math.sqrt(d * d - h * h);
    rect.setAttribute('height', `${h}`);
    rect.setAttribute('width', `${w}`);
    rect.setAttribute('fill', 'white');
    if (x1 < x2) {
        rect.setAttribute('x', `${x1}`);
        rect.setAttribute('y', `${y1}`);
        const t1 = Math.atan2(y2 - y1, x2 - x1);
        const t2 = Math.atan2(h, w);
        const t = 180 * (t1 - t2) / Math.PI;
        rect.setAttribute('transform', `rotate(${t} ${x1} ${y1})`);
    } else {
        rect.setAttribute('x', `${x2}`);
        rect.setAttribute('y', `${y2 - h}`);
        const t1 = Math.atan2(y1 - y2, x1 - x2);
        const t2 = Math.atan2(h, w);
        const t = 180 * (t1 + t2) / Math.PI;
        rect.setAttribute('transform', `rotate(${t} ${x2} ${y2})`);
    }
    return rect;
}