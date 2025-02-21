import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskList = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar tareas desde AsyncStorage al montar el componente
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error("Error al cargar las tareas", error);
      }
    };
    loadTasks();
  }, []);

  // Guardar tareas en AsyncStorage cada vez que 'tasks' cambia
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Error al guardar las tareas", error);
      }
    };
    saveTasks();
  }, [tasks]);

  // Función para agregar una tarea nueva
  const addTask = () => {
    if (task.trim() !== '') {
      const newTask = {
        id: Date.now().toString(),
        text: task,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setTask('');
    }
  };

  // Función para eliminar una tarea
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Función para alternar el estado de completado
  const toggleTaskCompleted = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // Funciones para editar una tarea
  const startEditingTask = (id, currentText) => {
    setEditingId(id);
    setTask(currentText);
  };

  const updateTask = () => {
    setTasks(
      tasks.map((t) =>
        t.id === editingId ? { ...t, text: task } : t
      )
    );
    setTask('');
    setEditingId(null);
  };

  // Función para limpiar las tareas completadas
  const clearCompletedTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  // Filtrar tareas según el filtro seleccionado y el término de búsqueda
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));

  // Renderizado de cada elemento de la lista
  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => toggleTaskCompleted(item.id)}
      >
        <Text style={[styles.taskText, item.completed && styles.completedTask]}>
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => startEditingTask(item.id, item.text)}>
        <Text style={styles.editButton}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(item.id)}>
        <Text style={styles.deleteButton}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista de Tareas</Text>

      {/* Input para agregar o actualizar tareas */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva tarea..."
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity
          onPress={editingId ? updateTask : addTask}
          style={styles.addButton}
        >
          <Text style={styles.buttonText}>
            {editingId ? 'Actualizar' : 'Agregar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Buscador de tareas */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tarea..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterButtons}>
        <TouchableOpacity onPress={() => setFilter('all')}>
          <Text style={[styles.filterButton, filter === 'all' && styles.activeFilter]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('active')}>
          <Text style={[styles.filterButton, filter === 'active' && styles.activeFilter]}>
            Activas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('completed')}>
          <Text style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}>
            Completadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contador y botón para limpiar completadas */}
      <View style={styles.extraContainer}>
        <Text style={styles.counterText}>
          Tareas restantes: {tasks.filter(task => !task.completed).length}
        </Text>
        <TouchableOpacity onPress={clearCompletedTasks} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpiar Completadas</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de tareas */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay tareas. ¡Agrega una!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#5cb85c',
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {
    fontSize: 16,
    color: '#555',
  },
  activeFilter: {
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'underline',
  },
  extraContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  counterText: {
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#d9534f',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  taskText: {
    fontSize: 16,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  editButton: {
    color: '#007bff',
    marginHorizontal: 10,
  },
  deleteButton: {
    color: '#d9534f',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default TaskList;
