'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

// Page
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar'),
    },
    content: {
        daysContainer: document.getElementById('days'),
        habbitDays: document.querySelector('.habbit__day'),
        habbitComment: document.querySelector('.habbit__comment'),
    },
    popup: {
        index: document.getElementById('add-habbit-popup'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    },
    cover: {
        coverHidden: document.querySelector('.cover'),
    }
};

// Utils
function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    if (!habbitsString) {
        habbits = [];
        saveData(); // Сохраняем пустой массив в localStorage
    } else {
        habbits = JSON.parse(habbitsString) || [];
    }

    if (habbits.length === 0) {
        page.cover.coverHidden.classList.remove('cover_hidden');
    } else {
        page.cover.coverHidden.classList.add('cover_hidden');
    }
}

function saveData() {
    console.log(habbits);
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

// Render
function rerenderMenu(activeHabbit) {
    if (!activeHabbit) {
        return;
    }

    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            // Create
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu__item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `<img src="/assets/img/${habbit.icon}.svg" alt="${habbit.name}" />`;
            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu__item_active');
            }
            page.menu.appendChild(element);
            continue;
        }

        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu__item_active');
        } else {
            existed.classList.remove('menu__item_active');
        }
    }
}

function rerenderHead(activeHabbit) {
    if (!activeHabbit) {
        return;
    }

    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1 ? 100 : activeHabbit.days.length / activeHabbit.target * 100;

    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
                        <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
                        <button class="habbit__delete" onclick="deleteDay(${index})">
                            <img src="./assets/img/delete.svg" alt="delete">
                        </button>`;
        
        page.content.daysContainer.appendChild(element);
    }

    page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateForm(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }

    if (!isValid) {
        return;
    }

    return res;
}

// Days
function addDays(event) {
    event.preventDefault();
    const data = validateForm(event.target, ['comment']);
    if (!data) {
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }])
            };
        }
        return habbit;
    });

    saveData(); // Сохраняем обновлённый массив привычек в localStorage
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId); // Перерисовываем активную привычку
}

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
            };
        }
        return habbit;
    });
    saveData(); // Сохраняем обновлённый массив привычек в localStorage
    rerender(globalActiveHabbitId);
}

// Popup 
function togglePopup() {
    if (page.popup.index.classList.contains('cover_hidden')) {
        page.popup.index.classList.remove('cover_hidden');
    } else {
        page.popup.index.classList.add('cover_hidden');
    }
}

// Icons
function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon_active');
    activeIcon.classList.remove('icon_active');
    context.classList.add('icon_active');
    // console.log(context);
}

// Add habbit
function addHabbit(event) {
    event.preventDefault();
    const data = validateForm(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);

    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    });
    saveData();
    resetForm(event.target, ['name', 'icon', 'target']);
    togglePopup();
    rerender(maxId + 1);
}

// Initialization
(() => {
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    console.log(hashId);
    const urlHabbitId = habbits.find(habbit => habbit.id == hashId);
    if (urlHabbitId) {  
        rerender(urlHabbitId.id);
    } else {
        rerender(habbits[0].id);
    }
})();