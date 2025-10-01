import { ref } from 'vue';

export function useDragDrop<T = any>() {
  const draggedItem = ref<T | null>(null);
  const draggedFromColumn = ref<string | null>(null);

  function handleDragStart(item: T, columnId: string) {
    draggedItem.value = item;
    draggedFromColumn.value = columnId;
  }

  function handleDragEnd() {
    draggedItem.value = null;
    draggedFromColumn.value = null;
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(
    event: DragEvent,
    targetColumnId: string,
    onDrop: (item: T, fromColumn: string, toColumn: string) => void
  ) {
    event.preventDefault();
    
    if (draggedItem.value && draggedFromColumn.value) {
      if (draggedFromColumn.value !== targetColumnId) {
        onDrop(draggedItem.value, draggedFromColumn.value, targetColumnId);
      }
    }
    
    handleDragEnd();
  }

  return {
    draggedItem,
    draggedFromColumn,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
}