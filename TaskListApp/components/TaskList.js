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
      <FlatList
        data={tasks}
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
    marginBottom: 20,
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
