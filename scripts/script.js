class Model {
  constructor() {
    this.taskList = localStorage.getItem("tasks")
      ? JSON.parse(localStorage.getItem("tasks"))
      : [
          {
            identifier: 0,
            text: "My first task",
            completed: false,
            isInput: false,
          },
        ];
  }

  addTask(text) {
    const lastIndex = this.taskList.length - 1;
    let newIdentifier =
      lastIndex >= 0 ? this.taskList[lastIndex].identifier + 1 : 1;

    const task = {
      identifier: newIdentifier,
      text: text,
      completed: false,
      isInput: false,
    };

    this.taskList.push(task);

    this._saveAndNotifyListChanged(this.taskList);
  }

  removeTask(identifier) {
    this.taskList = this.taskList.filter(
      (task) => task.identifier != identifier
    );

    this._saveAndNotifyListChanged(this.taskList);
  }

  toggleTask(identifier) {
    this.taskList = this.taskList.map(function (task) {
      if (identifier === task.identifier) {
        task.completed = !task.completed;
      }
      return task;
    });

    this._saveAndNotifyListChanged(this.taskList);
  }

  inputTask(identifier) {
    this.taskList = this.taskList.map(function (task) {
      if (identifier === task.identifier) {
        task.isInput = true;
      }
      return task;
    });

    this._saveAndNotifyListChanged(this.taskList);
  }

  editTask(identifier, text) {
    this.taskList = this.taskList.map((task) => {
      if (identifier === task.identifier) {
        task.text = text;
        task.isInput = false;
      }
      return task;
    });

    this._saveAndNotifyListChanged(this.taskList);
  }

  bindTaskListChanged(callback) {
    this.onTaskListChanged = callback;
  }

  _saveAndNotifyListChanged(tasks) {
    this.onTaskListChanged(tasks);

    const tasksToStorage = this.taskList.map((task) => {
      if (task.isInput) task.isInput = false;
      return task;
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

class View {
  constructor() {
    this.tasks = document.getElementById("tasks");
  }

  createElement(tag, firstClass, secondClass) {
    const element = document.createElement(tag);
    if (firstClass) element.classList.add(firstClass);
    if (secondClass) element.classList.add(secondClass);

    return element;
  }

  displayTasks(taskList) {
    while (this.tasks.firstChild) {
      this.tasks.removeChild(this.tasks.firstChild);
    }

    if (taskList.length > 0) {
      taskList.forEach((task) => {
        const listItem = this.createElement("li", "task");
        listItem.identifier = task.identifier;

        if (task.isInput) {
          const input = this.createElement("input");
          input.id = "task-input";
          input.placeholder = "Edit a task...";
          input.type = "text";
          input.value = task.text;
          listItem.append(input);
        } else {
          const trash = this.createElement(
            "span",
            "task-button",
            "task-delete"
          );
          const trashIcon = this.createElement("i", "fas", "fa-trash-alt");
          trash.append(trashIcon);

          const edit = this.createElement("span", "task-button", "task-edit");
          const editIcon = this.createElement("i", "fas", "fa-edit");
          edit.append(editIcon);

          const paragraph = this.createElement("p", "task-paragraph");
          if (task.completed) paragraph.classList.add("completed");
          paragraph.textContent = task.text;

          listItem.append(trash, edit);
          listItem.append(paragraph);
        }
        this.tasks.append(listItem);
      });
    }
  }
  get _addTask() {
    return document.getElementById("add-task");
  }

  get _task() {
    return this._addTask.value;
  }

  get _tasks() {
    return document.getElementById("tasks");
  }

  _resetInput() {
    this._addTask.value = "";
  }

  bindAddTask(handle) {
    this._addTask.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        if (this._task) {
          handle(this._task);
          this._resetInput();
        }
      }
    });
  }

  bindRemoveTask(handle) {
    this._tasks.addEventListener("click", (event) => {
      const className = event.target.className;
      if (className.includes("task-delete")) {
        event.preventDefault();
        handle(event.target.parentElement.identifier);
      } else if (className.includes("fa-trash-alt")) {
        event.preventDefault();
        handle(event.target.parentElement.parentElement.identifier);
      }
    });
  }

  bindToggleTask(handle) {
    this._tasks.addEventListener("click", (event) => {
      const className = event.target.className;
      if (className === "task-paragraph" || className.includes("completed")) {
        event.preventDefault();
        handle(event.target.parentElement.identifier);
      } else if (className === "task") {
        event.preventDefault();
        handle(event.target.identifier);
      }
    });
  }

  bindInputTask(handle) {
    this._tasks.addEventListener("click", (event) => {
      const className = event.target.className;
      if (className.includes("task-edit")) {
        event.preventDefault();
        handle(event.target.parentElement.identifier);
      } else if (className.includes("fa-edit")) {
        event.preventDefault();
        handle(event.target.parentElement.parentElement.identifier);
      }
    });
  }

  bindEditTask(handle) {
    this._tasks.addEventListener("keypress", (event) => {
      if (event.key === "Enter" && event.target.id === "task-input") {
        event.preventDefault();
        handle(event.target.parentElement.identifier, event.target.value);
      }
    });
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.onTaskListChanged(this.model.taskList);
    this.view.bindAddTask(this.handleAddTask);
    this.view.bindRemoveTask(this.handleRemoveTask);
    this.view.bindToggleTask(this.handleToggleTask);
    this.view.bindInputTask(this.handleInputTask);
    this.view.bindEditTask(this.handleEditTask);

    this.model.bindTaskListChanged(this.onTaskListChanged);
  }

  onTaskListChanged = (taskList) => {
    this.view.displayTasks(taskList);
  };

  handleAddTask = (text) => {
    this.model.addTask(text);
  };

  handleRemoveTask = (identifier) => {
    this.model.removeTask(identifier);
  };

  handleToggleTask = (identifier) => {
    this.model.toggleTask(identifier);
  };

  handleInputTask = (identifier) => {
    this.model.inputTask(identifier);
  };

  handleEditTask = (identifier, text) => {
    this.model.editTask(identifier, text);
  };
}

const delegates = new Controller(new Model(), new View());
