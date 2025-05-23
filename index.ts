
type UserID = number;
type TaskID = number;

class User {
  static nextId = 1;
  id: UserID;
  name: string;

  constructor(name: string) {
    this.id = User.nextId++;
    this.name = name;
  }
}

class Task {
  static nextId = 1;
  id: TaskID;
  title: string;
  description: string;
  assignedUserId: UserID | null;
  completed: boolean;

  constructor(title: string, description: string, assignedUserId: UserID | null) {
    this.id = Task.nextId++;
    this.title = title;
    this.description = description;
    this.assignedUserId = assignedUserId;
    this.completed = false;
  }
}

class TaskManager {
  users: User[] = [];
  tasks: Task[] = [];

  addUser(name: string): User {
    const user = new User(name);
    this.users.push(user);
    return user;
  }

  addTask(title: string, description: string, userId: UserID): Task {
    const task = new Task(title, description, userId);
    this.tasks.push(task);
    return task;
  }

  toggleTaskCompletion(taskId: TaskID): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) task.completed = !task.completed;
  }

  deleteTask(taskId: TaskID): void {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }

  getUser(id: UserID): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getTasksByUser(userId: UserID): Task[] {
    return this.tasks.filter(t => t.assignedUserId === userId);
  }

  listUsers(): User[] {
    return this.users;
  }

  listTasks(): Task[] {
    return this.tasks;
  }

  listPendingTasks(): Task[] {
    return this.tasks.filter(t => !t.completed);
  }
}

const manager = new TaskManager();

(window as any).addUser = () => {
  const nameInput = document.getElementById("username") as HTMLInputElement;
  if (!nameInput.value.trim()) return;
  const user = manager.addUser(nameInput.value.trim());
  nameInput.value = "";
  renderUsers();
  renderUserSelect();
  renderFilterUserSelect();
};

(window as any).addTask = () => {
  const title = (document.getElementById("title") as HTMLInputElement).value.trim();
  const desc = (document.getElementById("description") as HTMLInputElement).value.trim();
  const select = document.getElementById("userSelect") as HTMLSelectElement;
  const userId = parseInt(select.value);

  if (!title || !desc || isNaN(userId)) return;

  manager.addTask(title, desc, userId);

  (document.getElementById("title") as HTMLInputElement).value = "";
  (document.getElementById("description") as HTMLInputElement).value = "";

  renderTasks();
  renderPendingTasks();
};

(window as any).filterByUser = () => {
  renderTasks();
  renderPendingTasks();
};

function renderUsers() {
  const list = document.getElementById("userList")!;
  list.innerHTML = "";
  manager.listUsers().forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.id}: ${user.name}`;
    list.appendChild(li);
  });
}

function renderUserSelect() {
  const select = document.getElementById("userSelect")!;
  select.innerHTML = "";
  manager.listUsers().forEach(user => {
    const option = document.createElement("option");
    option.value = user.id.toString();
    option.textContent = user.name;
    select.appendChild(option);
  });
}

function renderFilterUserSelect() {
  const select = document.getElementById("filterUser")!;
  select.innerHTML = "<option value=''>All Users</option>";
  manager.listUsers().forEach(user => {
    const option = document.createElement("option");
    option.value = user.id.toString();
    option.textContent = user.name;
    select.appendChild(option);
  });
}

function renderTasks() {
  const list = document.getElementById("taskList")!;
  list.innerHTML = "";

  const filterSelect = document.getElementById("filterUser") as HTMLSelectElement;
  const filterId = filterSelect.value ? parseInt(filterSelect.value) : null;

  let tasks = manager.listTasks();
  if (filterId !== null) {
    tasks = tasks.filter(t => t.assignedUserId === filterId);
  }

  tasks.forEach(task => {
    const user = manager.getUser(task.assignedUserId!);
    const li = document.createElement("li");
    li.innerHTML = `<strong>${task.title}</strong> (${task.description}) → ${user?.name}<br/>Status: ${task.completed ? "Done" : "Pending"}`;

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = task.completed ? "Mark as Pending" : "Mark as Done";
    toggleBtn.onclick = () => {
      manager.toggleTaskCompletion(task.id);
      renderTasks();
      renderPendingTasks();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      manager.deleteTask(task.id);
      renderTasks();
      renderPendingTasks();
    };

    li.appendChild(toggleBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function renderPendingTasks() {
  const list = document.getElementById("pendingTasks")!;
  list.innerHTML = "";

  const filterSelect = document.getElementById("filterUser") as HTMLSelectElement;
  const filterId = filterSelect.value ? parseInt(filterSelect.value) : null;

  let tasks = manager.listPendingTasks();
  if (filterId !== null) {
    tasks = tasks.filter(t => t.assignedUserId === filterId);
  }

  tasks.forEach(task => {
    const user = manager.getUser(task.assignedUserId!);
    const li = document.createElement("li");
    li.textContent = `${task.title} → ${user?.name}`;
    list.appendChild(li);
  });
}

renderUserSelect();
renderFilterUserSelect();

