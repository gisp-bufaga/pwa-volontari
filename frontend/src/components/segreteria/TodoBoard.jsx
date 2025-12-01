import React from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TodoCard from './TodoCard';

const TodoBoard = ({ todosBacheca, onEdit, onDelete, onMarkDone, onStatusChange }) => {
  const columns = [
    {
      id: 'todo',
      title: 'Da Fare',
      color: '#ff9800',
      todos: todosBacheca.todo || [],
    },
    {
      id: 'in_progress',
      title: 'In Corso',
      color: '#2196f3',
      todos: todosBacheca.in_progress || [],
    },
    {
      id: 'done',
      title: 'Completati',
      color: '#4caf50',
      todos: todosBacheca.done || [],
    },
  ];

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside
    if (!destination) return;

    // Same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Different column - change status
    if (destination.droppableId !== source.droppableId) {
      const newStatus = destination.droppableId;
      onStatusChange(parseInt(draggableId), newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          minHeight: 500,
        }}
      >
        {columns.map((column) => (
          <Paper
            key={column.id}
            sx={{
              p: 2,
              bgcolor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Column Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                pb: 1,
                borderBottom: 3,
                borderColor: column.color,
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                {column.title}
              </Typography>
              <Chip
                label={column.todos.length}
                size="small"
                sx={{
                  bgcolor: `${column.color}20`,
                  color: column.color,
                  fontWeight: 600,
                }}
              />
            </Box>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <Box
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flexGrow: 1,
                    minHeight: 100,
                    bgcolor: snapshot.isDraggingOver
                      ? `${column.color}10`
                      : 'transparent',
                    borderRadius: 1,
                    transition: 'background-color 0.2s',
                  }}
                >
                  {column.todos.map((todo, index) => (
                    <Draggable
                      key={todo.id}
                      draggableId={todo.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}
                        >
                          <TodoCard
                            todo={todo}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onMarkDone={onMarkDone}
                            onStatusChange={onStatusChange}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Empty state */}
                  {column.todos.length === 0 && (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body2">
                        Nessun to-do in questa colonna
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Droppable>
          </Paper>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default TodoBoard;