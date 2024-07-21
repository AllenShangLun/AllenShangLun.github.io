const currentDate = new Date();
// console.log(currentDate);
const TodayDate = new Date();
const calendarElement = document.querySelector('.calendar');    //日曆初始化
const monthElement = document.querySelector('.text-yearMonth'); //h2年月顯示
const previousButton = document.querySelector('.btn-previous'); //上個月按鈕
const nextButton = document.querySelector('.btn-next'); //下個月按鈕
const nowButton = document.querySelector('.btn-now');   //Now按鈕

document.addEventListener('DOMContentLoaded', function () {
    initCalendar();
});

// init 日曆
function initCalendar() {
    // 上個月click
    previousButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });

    // 下個月click
    nextButton.addEventListener('click', function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    // Add click
    nowButton.addEventListener('click', function () {
        currentDate.setMonth(TodayDate.getMonth());
        updateCalendar();
    })

    updateCalendar();
}

function updateCalendar() {
    //初始化周一至周日
    calendarElement.innerHTML = `
                <div class="header text-danger">Sun</div>
                <div class="header">Mon</div>
                <div class="header">Tue</div>
                <div class="header">Wed</div>
                <div class="header">Thu</div>
                <div class="header">Fri</div>
                <div class="header text-success">Sat</div>
            `;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();  //第一天為星期幾
    // console.log(firstDayOfMonth);
    const daysInMonth = new Date(year, month + 1, 0).getDate(); //共有幾天
    // console.log(daysInMonth);
    monthElement.textContent = `${year}-${String(month + 1).padStart(2, '0')}`;

    // 初始化1號前空白的div
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarElement.innerHTML += '<div class="day"></div>';
    }

    // 開始迴圈本月日曆div
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.dataset.date = formatDate(new Date(year, month, i));

        // 星期六和日加顏色
        // console.log(`${firstDayOfMonth}, ${i}`);
        // console.log((firstDayOfMonth + i) % 7 == 0);
        if ((firstDayOfMonth + i) % 7 == 0) {
            dayElement.classList.add('header-sat');
        } else if ((firstDayOfMonth + i) % 7 == 1) {
            dayElement.classList.add('header-sun');
        }

        // 給日期
        const numberElement = document.createElement('div');
        numberElement.classList.add('day-number');
        numberElement.textContent = i;
        dayElement.appendChild(numberElement);
        // console.log(numberElement);

        const today = new Date();
        // 判斷當天給today css
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            dayElement.classList.add('today');
        }
        // console.log(dayElement);

        // To do List 的click
        dayElement.addEventListener('click', (event) => {
            if (event.target === dayElement) {
                setAddInitDate(dayElement.dataset.date);
            } else {
                openEditModal(dayElement.dataset.date, event.target);
            }
            // console.log(dayElement);
        });

        calendarElement.appendChild(dayElement);
    }

    loadEvents();
}

//=================================================================================================================================
// To do list======================================================================================================================
//=================================================================================================================================

// Loading To do List
function loadEvents() {

    const events = JSON.parse(localStorage.getItem('CalendarToDoList')) || [];

    events.forEach(event => {
        const eventDate = formatDate(new Date(event.ToDoListDate));
        // console.log(eventDate);
        const eventElement = document.querySelector(`.day[data-date="${eventDate}"]`);
        // console.log(eventElement);
        if (eventElement) {
            const eventDiv = document.createElement('div');
            eventDiv.style.backgroundColor = event.color;
            eventDiv.textContent = event.todo;
            eventDiv.dataset.id = event.id;
            eventDiv.classList.add('event');
            eventElement.appendChild(eventDiv);
        }
    });
}

const plusDateBtn = document.querySelector(".plus-date");   //日期
const todo = document.querySelector("#todo");   //代辦事項
const colorMark = document.querySelector("#color-mark");    //顏色
const addEvent = document.querySelector("#add-event");  //新增/修改按鈕
const deleteEvent = document.querySelector("#delete-event");    //刪除按鈕
const storageKey = "CalendarToDoList";
const headerTodolist = document.querySelector("#header-todolist");
// const btnPlus = document.querySelector(".btn-plus");
let eventId = null;
// console.log(eventId);
let plusDate = null;
// console.log(plusDate);

// btnPlus.addEventListener("click", () => {

//     setAddInitDate(formatDate(TodayDate));
// });

// 代辦事項init
function setAddInitDate(date) {
    // console.log(date);
    plusDateBtn.textContent = date;
    todo.value = "";
    colorMark.value = "#c0e9ed";
    plusDate = new Date(date);
    eventId = null;

    const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
    addEventModal.show();
}

// 新增/修改按鈕 init
addEvent.addEventListener("click", () => {
    const storageObj = {
        id: eventId ? eventId : Date.now(),
        ToDoListDate: formatDate(plusDate),
        todo: todo.value.trim(),
        color: colorMark.value,
    };

    saveData(storageObj);
    updateCalendar();
});

// 刪除按鈕 init
deleteEvent.addEventListener("click", () => {
    if (eventId) {
        let todoStorage = JSON.parse(localStorage.getItem(storageKey)) || [];
        todoStorage = todoStorage.filter(event => event.id !== eventId);
        localStorage.setItem(storageKey, JSON.stringify(todoStorage));
        updateCalendar();
    }
});

// 存到localStorage
function saveData(storageObj) {
    let todoStorage = JSON.parse(localStorage.getItem(storageKey)) || [];
    // console.log(todoStorage);
    // console.log(eventId);

    if (eventId) {
        todoStorage = todoStorage.map(event => event.id === eventId ? storageObj : event);
    } else {
        todoStorage.push(storageObj);
    }

    localStorage.setItem(storageKey, JSON.stringify(todoStorage));
}

// 點選該列開啟修改畫面
function openEditModal(date, target) {

    const events = JSON.parse(localStorage.getItem('CalendarToDoList')) || [];
    const event = events.find(event => event.id === parseInt(target.dataset.id));
    // console.log(events);
    // console.log(event);
    addEvent.textContent = "修改";
    headerTodolist.textContent = "修改待辦事項";
    if (event) {
        todo.value = event.todo;
        colorMark.value = event.color;
        plusDate = new Date(event.ToDoListDate);
        plusDateBtn.textContent = formatDate(plusDate);
        eventId = event.id;

        const addEventModal = new bootstrap.Modal(document.getElementById('addEventModal'));
        addEventModal.show();
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}