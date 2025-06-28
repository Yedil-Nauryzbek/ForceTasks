// 📌 Элементы
const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-button');
const prioritySelect = document.getElementById('priority-select');
const deadlineInput = document.getElementById('deadline-input');
const sortSelect = document.getElementById('sort-select');
const streakCounter = document.getElementById('streak-count');

// 📅 Списки задач по категориям
const todayList = document.getElementById('today-list');
const tomorrowList = document.getElementById('tomorrow-list');
const futureList = document.getElementById('future-list');
const overdueList = document.getElementById('overdue-list');

// 📊 Статистика
const totalCount = document.getElementById('total-count');
const doneCount = document.getElementById('done-count');
const percentDone = document.getElementById('percent-done');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let streak = parseInt(localStorage.getItem('streak')) || 0;
let sortMode = localStorage.getItem('sortMode') || 'created';

function updateStreak() {
  streakCounter.textContent = streak;
  localStorage.setItem('streak', streak);
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderStats() {
  totalCount.textContent = tasks.length;
  const done = tasks.filter(t => t.done).length;
  doneCount.textContent = done;
  percentDone.textContent = tasks.length ? `${Math.round((done / tasks.length) * 100)}%` : '0%';
}

function renderTasks() {
  [todayList, tomorrowList, futureList, overdueList].forEach(list => list.innerHTML = '');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  let sortedTasks = [...tasks];
  if (sortMode === 'priority') {
    const order = { high: 1, medium: 2, low: 3 };
    sortedTasks.sort((a, b) => order[a.priority] - order[b.priority]);
  } else if (sortMode === 'deadline') {
    sortedTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }

  sortedTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = 'bg-zinc-800 rounded px-4 py-3 flex justify-between items-start flex-col shadow-md';

    const top = document.createElement('div');
    top.className = 'flex justify-between w-full';

    const text = document.createElement('span');
    text.textContent = task.text;
    if (task.done) text.classList.add('line-through', 'text-gray-500');

    const controls = document.createElement('div');
    controls.className = 'flex gap-2';

    const doneBtn = document.createElement('button');
    doneBtn.textContent = '✓';
    doneBtn.className = 'text-green-400 hover:text-green-300 text-xl';
    doneBtn.onclick = () => {
      task.done = !task.done;
      if (task.done) streak++;
      else streak = Math.max(0, streak - 1);
      saveTasks();
      updateStreak();
      renderTasks();
      renderStats();
    };

    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.className = 'text-red-400 hover:text-red-300 text-xl';
    delBtn.onclick = () => {
      if (task.done) streak = Math.max(0, streak - 1);
      tasks.splice(index, 1);
      saveTasks();
      updateStreak();
      renderTasks();
      renderStats();
    };

    controls.appendChild(doneBtn);
    controls.appendChild(delBtn);

    top.appendChild(text);
    top.appendChild(controls);

    const info = document.createElement('div');
    info.className = 'text-xs text-gray-400 mt-1';
    info.textContent = `Приоритет: ${task.priority}` + (task.deadline ? ` | Дедлайн: ${task.deadline}` : '');

    li.appendChild(top);
    li.appendChild(info);

    if (!task.deadline) {
      futureList.appendChild(li);
    } else if (task.deadline < todayStr) {
      overdueList.appendChild(li);
    } else if (task.deadline === todayStr) {
      todayList.appendChild(li);
    } else if (task.deadline === tomorrowStr) {
      tomorrowList.appendChild(li);
    } else {
      futureList.appendChild(li);
    }
  });
}

addBtn.addEventListener('click', () => {
  const value = input.value.trim();
  if (!value) return;

  const priority = prioritySelect.value;
  const deadline = deadlineInput.value || null;

  tasks.push({
    text: value,
    done: false,
    priority,
    deadline,
    createdAt: new Date().toISOString()
  });

  input.value = '';
  deadlineInput.value = '';
  saveTasks();
  renderTasks();
  renderStats();
});

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addBtn.click();
});

sortSelect.value = sortMode;
sortSelect.addEventListener('change', () => {
  sortMode = sortSelect.value;
  localStorage.setItem('sortMode', sortMode);
  renderTasks();
});

renderTasks();
renderStats();
updateStreak();
