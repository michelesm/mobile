import { Component } from '@angular/core';
import { Task } from '../../models/task.model';
import { Category } from '../../models/category.model';
import { AlertController } from '@ionic/angular';
import { CategoryService } from '../../services/category.service';
import { TaskService } from '../../services/task.service';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HomeConfig } from './home.config';
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from '@angular/fire/remote-config';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  newTask: string = '';
  taskCategory: string = '';
  dueDate: string = '';
  filteredTasks: Task[] = [];
  completedTasks: number = 0;
  selectedCategory: string = '';
  

  public HomeConfig = HomeConfig;
  public texts: { [key: string]: string } = {};
  public enableLogo: boolean = true;

  constructor(
    private alertController: AlertController,
    private categoryService: CategoryService,
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private remoteConfig: RemoteConfig
  ) {
    this.translate.setDefaultLang('es');
    this.loadTexts();
    this.initializeFirebaseConfig();
    this.dueDate = '';
  }
  onDateChange(event: any) {
    console.log('Data selecionada:', this.dueDate);
  }

  // Chamado quando a visão está prestes a entrar no ciclo de vida ativo
  // Carrega as tarefas do serviço
  ionViewWillEnter() {
    this.loadTasks();
  }

  // Getters
  public get categories(): Category[] {
    return this.categoryService.getCategories();
  }

  public get tasks(): Task[] {
    return this.taskService.getTasks();
  }

  // Lida com a mudança na seleção de categoria
  // Pode adicionar uma nova categoria, gerenciar categorias existentes ou filtrar tarefas
  public async onCategoryChange(event: any) {
    switch (event.detail.value) {
      case 'addNewCategory':
        await this.addNewCategory();
        break;
      case 'manageCategory':
        await this.manageCategories();
        break;
      default:
        this.filterTasksByCategory(event.detail.value);
    }
  }

  // Adiciona uma nova tarefa à lista e a atribui a uma categoria
  public async addTask() {
    if (this.newTask.trim() === '') return;

    if (!this.taskCategory) {
      const alert = await this.alertController.create({
        header: 'Categoria necessária',
        message: 'Por favor, escolha uma categoria para a tarefa.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

    // Criar a nova tarefa se houver uma categoria selecionada
    const task: Task = {
      id: this.generateId(),
      title: this.newTask,
      categoryId: this.taskCategory,
      completed: false,
      dueDate: this.dueDate ? new Date(this.dueDate) : undefined 
    };

    this.taskService.addTask(task);
    this.resetTaskInput();
    this.filterTasksByCategory(this.taskCategory);
  }

  // Remove uma tarefa pelo seu ID
  public deleteTask(taskId: string) {
    this.taskService.deleteTask(taskId);
    this.filterTasksByCategory(this.taskCategory);
  }

  // Alterna o estado de completado de uma tarefa
  public toggleTask(task: Task) {
    task.completed = !task.completed;
    this.taskService.updateTask(task);
    this.updateCompletedTasks();
    this.cdr.detectChanges();
  }

  // Remove todas as tarefas completadas
  public clearCompleted() {
    this.taskService.clearCompletedTasks();
    this.filterTasksByCategory(this.taskCategory);
  }

  // Retorna o nome de uma categoria dado seu ID
  public getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Sem categoria';
  }

  // Filtra as tarefas de acordo com a categoria selecionada
  public filterTasksByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    if (!categoryId) {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(task => task.categoryId === categoryId);
    }
    this.updateCompletedTasks();
  }

  // Gera um ID único para as novas tarefas
  private generateId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  // Carrega as tarefas do serviço e atualiza a lista de tarefas filtradas
  private loadTasks() {
    this.filteredTasks = [...this.tasks];
    this.updateCompletedTasks();
  }
// Atualiza o número de tarefas completadas
private updateCompletedTasks() {
  this.completedTasks = this.filteredTasks.filter(t => t.completed).length;
}

// Reseta os campos de entrada de nova tarefa e categoria selecionada
private resetTaskInput() {
  this.newTask = '';
  this.taskCategory = '';
  this.dueDate = '';
}

// Mostra um alerta para adicionar uma nova categoria
// Depois de adicioná-la, atribui a nova categoria à tarefa atual
private async addNewCategory() {
  const alert = await this.alertController.create({
    header: 'Nova Categoria',
    inputs: [
      {
        name: 'newCategory',
        type: 'text',
        placeholder: 'Nome da nova categoria'
      }
    ],
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Adicionar',
        handler: (data) => {
          if (data.newCategory) {
            const newCategory = this.categoryService.addCategory(data.newCategory);
            this.taskCategory = newCategory.id;
          }
        }
      }
    ]
  });

  await alert.present();
}

// Mostra um alerta para gerenciar (editar ou excluir) categorias existentes
private async manageCategories() {
  const alert = await this.alertController.create({
    header: 'Gerenciar Categorias',
    inputs: this.categories.map(category => ({
      name: category.id,
      type: 'text',
      value: category.name,
      placeholder: `Editar ${category.name}`
    })),
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Salvar Alterações',
        handler: (data) => {
          for (let categoryId in data) {
            this.categoryService.updateCategory(categoryId, data[categoryId]);
          }
        }
      },
      {
        text: 'Excluir Categoria',
        handler: async () => {
          const deleteAlert = await this.alertController.create({
            header: 'Excluir Categoria',
            inputs: this.categories.map(category => ({
              name: category.id,
              type: 'radio',
              label: category.name,
              value: category.id,
            })),
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel'
              },
              {
                text: 'Excluir',
                handler: (categoryId) => {
                  this.categoryService.deleteCategory(categoryId);
                  if (this.taskCategory === categoryId) {
                    this.taskCategory = '';
                  }
                  this.filterTasksByCategory(this.taskCategory);
                }
              }
            ]
          });
          await deleteAlert.present();
        }
      }
    ]
  });

  await alert.present();
}

// Método geral para carregar todos os textos necessários do arquivo de configuração i18n
private loadTexts() {
  const keys = Object.values(HomeConfig);

  this.translate.get(keys).subscribe(translations => {
    keys.forEach((key) => {
      this.texts[key] = translations[key];
    });
  });
}

// Inicializa o Firebase Remote Config
private async initializeFirebaseConfig() {
  const remoteConfig = this.remoteConfig || getRemoteConfig(initializeApp(environment.firebaseConfig));

  remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hora

  try {
    await fetchAndActivate(remoteConfig);
    this.enableLogo = getValue(remoteConfig, 'enableLogo').asBoolean();

    // Valor no console de enableLogo Firebase
    console.log('Valor de enableLogo do Remote Config:', this.enableLogo);
  } catch (err) {
    console.error('Erro ao buscar ou ativar o remote config:', err);
  }
}
}