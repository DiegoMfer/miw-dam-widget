# miw-dam-widget
Guión de Diego Martín Fernández martinfdiego@uniovi.es
## Paso 1: Instalación e Inicialización

Para comenzar, instala las herramientas necesarias y crea un nuevo proyecto Expo.

```sh
npm install -g expo-cli
expo init TaskListApp
cd TaskListApp
npx expo install react-dom react-native-web @expo/metro-runtime
expo start
```

## Paso 2: Implementación de la Funcionalidad de la Lista de Tareas

### Configuración de `App.js`

Copia y pega el siguiente código en tu archivo `App.js` para configurar la estructura básica de la aplicación.

```javascript
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import TaskList from './components/TaskList';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <TaskList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Configuración de `components/TaskList.js`

Crea un archivo `TaskList.js` en la carpeta `components` y pega el siguiente código para implementar la funcionalidad de la lista de tareas.

```javascript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';

const TaskList = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleTaskCompleted = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

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
```

## Paso 3: Persistencia de Datos

Para hacer que la lista de tareas sea persistente, instala `@react-native-async-storage/async-storage`.

```sh
npm install @react-native-async-storage/async-storage
```

### Añadir Persistencia a `TaskList.js`

Cargar las tareas al iniciar el componente:

```javascript
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
```

Guardar las tareas al cambiar:

```javascript
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
```

### Código Completo Integrado

Aquí tienes el código completo de `TaskList.js` con la funcionalidad de persistencia integrada.

```javascript
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

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleTaskCompleted = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

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
```

Ejecuta `npm start` y verifica que todo funcione correctamente.

## Ampliando funcionalidades

### Actualiza las importaciones

En la parte superior del archivo, conserva tus importaciones actuales. Este bloque no cambia, pero es importante verificar que se importe AsyncStorage:

```javascript
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
```

### Nuevos estados

Justo después de declarar los estados actuales (`task`, `tasks`, `editingId`), agrega dos nuevos estados para el filtro y la búsqueda:

```javascript
const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
const [searchTerm, setSearchTerm] = useState('');
```

### Lógica para cargar, guardar y filtrar tareas

#### Función para filtrar tareas

Antes del retorno del componente, crea una constante que se encargue de filtrar las tareas según el filtro seleccionado y el término de búsqueda. Agrégala justo antes del `return`:

```javascript
const filteredTasks = tasks
  .filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  })
  .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()));
```

### Nuevas funciones para funcionalidades adicionales

#### Contador y limpieza de tareas completadas

Agrega la función para limpiar las tareas completadas. Ubícala junto a las otras funciones de manejo de tareas:

```javascript
const clearCompletedTasks = () => {
  setTasks(tasks.filter(task => !task.completed));
};
```

### Actualización del JSX (renderizado)

Modifica el bloque JSX dentro del `return` para incluir las nuevas secciones: buscador, filtros, contador y botón de limpiar.

#### Buscador

Justo después del bloque de entrada (donde se agrega o actualiza una tarea), agrega un nuevo `View` para el buscador:

```javascript
{/* Buscador de tareas */}
<View style={styles.searchContainer}>
  <TextInput
    style={styles.searchInput}
    placeholder="Buscar tarea..."
    value={searchTerm}
    onChangeText={setSearchTerm}
  />
</View>
```

#### Filtros

Añade un grupo de botones para seleccionar el filtro (todos, activas, completadas):

```javascript
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
```

#### Contador y botón para limpiar tareas completadas

Agrega otro bloque que muestre la cantidad de tareas activas y un botón para limpiar las completadas:

```javascript
{/* Contador y botón para limpiar completadas */}
<View style={styles.extraContainer}>
  <Text style={styles.counterText}>
    Tareas restantes: {tasks.filter(task => !task.completed).length}
  </Text>
  <TouchableOpacity onPress={clearCompletedTasks} style={styles.clearButton}>
    <Text style={styles.clearButtonText}>Limpiar Completadas</Text>
  </TouchableOpacity>
</View>
```

#### Lista de tareas

Actualiza el componente `FlatList` para que utilice `filteredTasks` en lugar de `tasks`:

```javascript
<FlatList
  data={filteredTasks}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  ListEmptyComponent={
    <Text style={styles.emptyText}>No hay tareas. ¡Agrega una!</Text>
  }
/>
```

### Actualización de estilos

Agrega o modifica los estilos necesarios para las nuevas secciones. Asegúrate de incluir estos estilos en el objeto `styles`:

#### Estilos para el buscador

```javascript
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
```

#### Estilos para los filtros

```javascript
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
```

#### Estilos para el contador y el botón de limpiar

```javascript
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
```

### Revisión final y pruebas

Guarda todos los cambios y reinicia la aplicación:

```sh
npm start
```

o

```sh
npx react-native run-android
```

o

```sh
npx react-native run-ios
```

Prueba las funcionalidades:

- Agrega, edita, elimina y marca tareas como completadas.
- Utiliza el buscador para filtrar tareas por texto.
- Cambia los filtros (todos, activas, completadas) y verifica que se muestren correctamente.
- Comprueba que el contador muestre el número de tareas activas y que el botón "Limpiar Completadas" funcione.